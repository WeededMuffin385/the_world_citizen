import {COUNTRIES} from '../data/countries';

type MapDocumentOptions = {
    apiKey: string;
    mapId: string;
    channel: string;
    dark: boolean;
    initialCountry: {code: string; name: string} | null;
};

export function createCountryMapDocument(options: MapDocumentOptions): string {
    // Escape HTML delimiters so configuration can never close the script element.
    const configuration = JSON.stringify({...options, countryCodes: COUNTRIES.map(country => country.code)})
        .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Choose a country</title>
<style>
html, body, #map { height: 100%; width: 100%; margin: 0; }
body { background: ${options.dark ? '#171d14' : '#edf3e4'}; font-family: system-ui, sans-serif; }
#status { position: absolute; top: 12px; left: 12px; right: 12px; padding: 12px; border-radius: 12px;
background: ${options.dark ? '#22291e' : '#ffffff'}; color: ${options.dark ? '#e0f2cc' : '#30491e'}; }
#status[hidden] { display: none; }
#boundary-source { position: absolute; bottom: 28px; left: 8px; padding: 4px 8px; border-radius: 6px;
background: white; color: #30491e; font-size: 11px; }
#boundary-source a { color: inherit; }
</style>
</head>
<body>
<div id="map" aria-label="Interactive country selection map"></div>
<div id="status" role="status">Loading map…</div>
<div id="boundary-source" hidden>Country outlines: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a></div>
<script>
const config = ${configuration};
let requestId = 0;
let selectedPlaceId = null;
let hoveredPlaceId = null;
let pendingPlaceId = null;
let featureLayer;
let map;
let geocoder;
let ready = false;
let mode = null;
let localLoading = false;
let selectedCountryCode = null;
let loadTimeout;
const statusElement = document.getElementById('status');

function send(message) {
    const payload = JSON.stringify({ ...message, channel: config.channel });
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(payload);
    else if (window.parent !== window) window.parent.postMessage(payload, window.location.origin);
}

function reportError(reason) {
    if (reason !== 'selection') clearTimeout(loadTimeout);
    const messages = {
        configuration: 'The map is not available yet. Please choose a country from the list.',
        boundaries: 'Country boundaries are not available. Please choose a country from the list.',
        network: 'Could not load the map. Check your connection and try again.',
        selection: 'Could not select this country. Please try another country or use the list.',
    };
    statusElement.textContent = messages[reason];
    statusElement.hidden = false;
    send({type: 'error', reason});
}

function styleCountry({feature}) {
    if (feature.placeId === selectedPlaceId) {
        return {fillColor: '#a6cf75', fillOpacity: 0.55, strokeColor: '#557d30', strokeOpacity: 1, strokeWeight: 3};
    }
    if (feature.placeId === hoveredPlaceId || feature.placeId === pendingPlaceId) {
        return {fillColor: '#b8dc91', fillOpacity: 0.35, strokeColor: config.dark ? '#c3d5ac' : '#557d30', strokeOpacity: 1, strokeWeight: 2};
    }
    return {fillColor: config.dark ? '#29391e' : '#edf3e4', fillOpacity: 0.12,
        strokeColor: config.dark ? '#a8b69a' : '#63734f', strokeOpacity: 0.35, strokeWeight: 1};
}

function hoverCountry(placeId) {
    if (hoveredPlaceId === placeId) return;
    hoveredPlaceId = placeId;
    refreshStyle();
}

function localStyle(feature) {
    return {...styleCountry({feature: {placeId: feature.getProperty('code')}}), clickable: true};
}

function refreshStyle() {
    if (mode === 'local') map.data.setStyle(localStyle);
    else if (featureLayer) featureLayer.style = styleCountry;
}

function selectLocalCountry(code, zoomToCountry) {
    if (!config.countryCodes.includes(code)) return;
    const feature = map.data.getFeatureById(code);
    if (!feature) { reportError('selection'); return; }
    selectedCountryCode = code;
    selectedPlaceId = code;
    pendingPlaceId = null;
    refreshStyle();
    if (zoomToCountry) {
        const bounds = new google.maps.LatLngBounds();
        feature.getGeometry().forEachLatLng(point => bounds.extend(point));
        map.fitBounds(bounds, 32);
    }
    statusElement.hidden = true;
    send({type: 'selection', code});
}

async function loadLocalBoundaries() {
    if (mode === 'local' || localLoading) return;
    localLoading = true;
    ready = false;
    ++requestId;
    send({type: 'loading'});
    statusElement.textContent = 'Loading country boundaries…';
    statusElement.hidden = false;
    let timeout;
    const controller = new AbortController();
    try {
        timeout = setTimeout(() => controller.abort(), 15000);
        const response = await fetch('/data/country-boundaries.geojson', {signal: controller.signal});
        if (!response.ok) throw new Error('Country boundaries unavailable');
        const data = await response.json();
        const features = map.data.addGeoJson(data, {idPropertyName: 'code'});
        if (!features.length) throw new Error('Country boundaries empty');
        if (featureLayer?.isAvailable) featureLayer.style = null;
        mode = 'local';
        selectedPlaceId = null;
        hoveredPlaceId = null;
        pendingPlaceId = null;
        refreshStyle();
        map.data.addListener('mouseover', event => hoverCountry(event.feature.getProperty('code')));
        map.data.addListener('mouseout', () => hoverCountry(null));
        map.data.addListener('click', event => selectLocalCountry(event.feature.getProperty('code'), false));
        ready = true;
        clearTimeout(loadTimeout);
        statusElement.hidden = true;
        document.getElementById('boundary-source').hidden = false;
        send({type: 'ready'});
        const initialCode = selectedCountryCode || config.initialCountry?.code;
        if (initialCode) selectLocalCountry(initialCode, true);
    } catch {
        reportError('boundaries');
    } finally {
        clearTimeout(timeout);
        localLoading = false;
    }
}

async function selectCountry(request, placeId, zoomToCountry) {
    const currentRequest = ++requestId;
    pendingPlaceId = placeId;
    refreshStyle();
    send({type: 'selecting'});
    statusElement.textContent = 'Selecting country…';
    statusElement.hidden = false;
    let timeout;
    try {
        const response = await Promise.race([
            geocoder.geocode(request),
            new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Selection timed out')), 12000); }),
        ]);
        if (currentRequest !== requestId) return;
        const result = response.results.find(item => item.types.includes('country'));
        const country = result && result.address_components.find(component => component.types.includes('country'));
        if (!country || !config.countryCodes.includes(country.short_name.toUpperCase())) throw new Error('Country not found');
        selectedPlaceId = placeId || result.place_id;
        selectedCountryCode = country.short_name.toUpperCase();
        pendingPlaceId = null;
        refreshStyle();
        if (zoomToCountry && result.geometry.viewport) map.fitBounds(result.geometry.viewport, 32);
        statusElement.hidden = true;
        send({type: 'selection', code: country.short_name.toUpperCase()});
    } catch {
        if (currentRequest === requestId) {
            pendingPlaceId = null;
            refreshStyle();
            reportError('selection');
        }
    } finally {
        clearTimeout(timeout);
    }
}

window.gm_authFailure = () => reportError('configuration');
window.initCountryMap = function () {
    try {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 20, lng: 10}, zoom: 2, minZoom: 1,
            mapId: config.mapId, colorScheme: config.dark ? 'DARK' : 'LIGHT',
            renderingType: 'VECTOR',
            mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
            gestureHandling: 'greedy', clickableIcons: false,
        });
        geocoder = new google.maps.Geocoder();
        function enableLayer() {
            if (mode === 'local' || localLoading) return;
            const renderingType = map.getRenderingType();
            if (renderingType === 'UNINITIALIZED') return;
            if (renderingType !== 'VECTOR' || !map.getMapCapabilities().isDataDrivenStylingAvailable) {
                loadLocalBoundaries();
                return;
            }
            if (!featureLayer) featureLayer = map.getFeatureLayer('COUNTRY');
            if (!featureLayer.isAvailable) {
                loadLocalBoundaries();
                return;
            }
            if (ready) return;
            mode = 'google';
            ready = true;
            clearTimeout(loadTimeout);
            statusElement.hidden = true;
            featureLayer.style = styleCountry;
            featureLayer.addListener('mousemove', event => {
                if (mode !== 'google' || !ready) return;
                hoverCountry(event.features[0]?.placeId ?? null);
            });
            map.addListener('mousemove', () => {if (mode === 'google') hoverCountry(null);});
            map.addListener('mouseout', () => hoverCountry(null));
            featureLayer.addListener('click', event => {
                if (mode !== 'google' || !ready) return;
                const feature = event.features[0];
                if (feature && feature.placeId) selectCountry({placeId: feature.placeId}, feature.placeId, false);
            });
            send({type: 'ready'});
            if (config.initialCountry) {
                selectCountry({address: config.initialCountry.name, componentRestrictions: {country: config.initialCountry.code}}, null, true);
            }
        }
        map.addListener('idle', enableLayer);
        map.addListener('mapcapabilities_changed', enableLayer);
        map.addListener('renderingtype_changed', enableLayer);
        enableLayer();
    } catch {
        reportError('configuration');
    }
};

loadTimeout = setTimeout(() => reportError(map ? 'boundaries' : 'network'), 20000);
if (!config.apiKey || !config.mapId) {
    clearTimeout(loadTimeout);
    reportError('configuration');
} else {
    const script = document.createElement('script');
    const parameters = new URLSearchParams({key: config.apiKey, v: 'weekly', loading: 'async',
        callback: 'initCountryMap', libraries: 'geocoding', language: 'en'});
    script.src = 'https://maps.googleapis.com/maps/api/js?' + parameters.toString();
    script.async = true;
    script.onerror = () => { clearTimeout(loadTimeout); reportError('network'); };
    document.head.appendChild(script);
}
</script>
</body>
</html>`;
}
