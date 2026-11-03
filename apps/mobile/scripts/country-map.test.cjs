const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function loadSource(relative, environment = {}) {
    const filename = path.resolve(root, relative);
    const module = {exports: {}};
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText;
    vm.runInNewContext(code, {
        module, exports: module.exports, URL, Response, process: {env: environment},
        require(id) {
            const target = id.startsWith('@/') ? path.join(root, 'src', id.slice(2)) : path.resolve(path.dirname(filename), id);
            return loadSource(`${target}.ts`, environment);
        },
    }, {filename});
    return module.exports;
}
const {createCountryMapDocument} = loadSource('src/pages/explore/maps/country-map-document.ts');
const {readMapMessage} = loadSource('src/pages/explore/maps/map-messages.ts');
const baseOptions = {apiKey: 'test-key', mapId: 'test-map', channel: 'test-channel', dark: false, initialCountry: null};
const result = code => ({results: [{place_id: code, types: ['country'], address_components: [{types: ['country'], short_name: code}], geometry: {viewport: {country: code}}}]});
const flush = () => new Promise(resolve => setImmediate(resolve));

function harness(options = {}, {available = true, geocode = () => Promise.resolve(result('AU')), native = false, renderer = 'VECTOR', boundaryFailure = false} = {}) {
    const messages = [], scripts = [], requests = [], viewports = [];
    const timers = new Map(), layerListeners = {}, mapListeners = {};
    let mapOptions, nextTimer = 1;
    const status = {textContent: '', hidden: false};
    const rendering = {value: renderer};
    const dataListeners = {};
    const localFeatures = new Map();
    const data = {
        addGeoJson(collection) {
            for (const item of collection.features) localFeatures.set(item.properties.code, {
                getProperty: key => item.properties[key],
                getGeometry: () => ({forEachLatLng: callback => callback({lat: -25, lng: 135})}),
            });
            return [...localFeatures.values()];
        },
        getFeatureById: code => localFeatures.get(code),
        setStyle: style => {data.style = style;},
        addListener: (name, callback) => {dataListeners[name] = callback;},
    };
    const layer = {isAvailable: available, addListener: (name, callback) => {layerListeners[name] = callback;}};
    const window = {location: {origin: 'https://travel.example'}, parent: {postMessage: value => messages.push(JSON.parse(value))}};
    if (native) window.ReactNativeWebView = {postMessage: value => messages.push(JSON.parse(value))};
    const context = vm.createContext({
        window, URLSearchParams, Promise, AbortController,
        fetch: async () => ({ok: !boundaryFailure, json: async () => ({features: [{properties: {code: 'AU'}}]})}),
        document: {getElementById: id => id === 'status' ? status : {}, createElement: () => ({}), head: {appendChild: script => scripts.push(script)}},
        setTimeout(callback, milliseconds) {const id = nextTimer++; timers.set(id, {callback, milliseconds}); return id;},
        clearTimeout: id => timers.delete(id),
        google: {maps: {
            Map: class {
                constructor(element, config) {mapOptions = config; this.data = data;}
                getRenderingType() {return rendering.value;}
                getMapCapabilities() {return {isDataDrivenStylingAvailable: layer.isAvailable && rendering.value === 'VECTOR'};}
                getFeatureLayer(name) {assert.equal(name, 'COUNTRY'); return layer;}
                addListener(name, callback) {mapListeners[name] = callback;}
                fitBounds(viewport) {viewports.push(viewport);}
            },
            LatLngBounds: class {extend() {}},
            Geocoder: class {geocode(request) {requests.push(request); return geocode(request);}},
        }},
    });
    const html = createCountryMapDocument({...baseOptions, ...options});
    vm.runInContext(html.match(/<script>\n([\s\S]*?)\n<\/script>/)[1], context);
    return {context, window, messages, scripts, timers, layer, layerListeners, mapListeners, requests, viewports, options: () => mapOptions, status, rendering, data, dataListeners};
}

test('missing configuration reports an error without contacting Google', () => {
    const map = harness({apiKey: ''});
    assert.equal(map.scripts.length, 0);
    assert.equal(map.messages[0].reason, 'configuration');
    assert.equal(map.timers.size, 0);
});
test('country layer is clickable and uses the configured map and theme', () => {
    const map = harness({dark: true}); map.window.initCountryMap();
    assert.equal(map.options().mapId, 'test-map');
    assert.equal(map.options().colorScheme, 'DARK');
    assert.ok(map.layer.style({feature: {placeId: 'AU'}}).fillOpacity >= 0.1);
    assert.equal(typeof map.layerListeners.click, 'function');
    assert.equal(map.messages.at(-1).type, 'ready');
    assert.equal(map.timers.size, 0);
});
test('country click selects an ISO code and highlights the clicked boundary', async () => {
    const map = harness(); map.window.initCountryMap();
    map.layerListeners.click({features: [{placeId: 'australia-boundary'}]}); await flush();
    assert.equal(map.requests[0].placeId, 'australia-boundary');
    assert.equal(map.messages.at(-1).code, 'AU');
    assert.equal(map.layer.style({feature: {placeId: 'australia-boundary'}}).strokeWeight, 3);
    assert.equal(map.status.hidden, true);
});
test('initial selection restores the country viewport', async () => {
    const map = harness({initialCountry: {code: 'AU', name: 'Australia'}}); map.window.initCountryMap(); await flush();
    assert.equal(map.requests[0].componentRestrictions.country, 'AU');
    assert.equal(map.messages.at(-1).code, 'AU');
    assert.equal(map.viewports[0].country, 'AU');
});
test('hover highlights boundaries without geocoding or changing the selection', () => {
    const map = harness(); map.window.initCountryMap();
    map.layerListeners.mousemove({features: [{placeId: 'AU'}]});
    assert.equal(map.layer.style({feature: {placeId: 'AU'}}).strokeWeight, 2);
    map.layerListeners.mousemove({features: [{placeId: 'NZ'}]});
    assert.equal(map.layer.style({feature: {placeId: 'AU'}}).strokeWeight, 1);
    assert.equal(map.layer.style({feature: {placeId: 'NZ'}}).strokeWeight, 2);
    assert.equal(map.requests.length, 0);
    assert.equal(map.messages.some(message => message.type === 'selection'), false);
    map.mapListeners.mousemove();
    assert.equal(map.layer.style({feature: {placeId: 'NZ'}}).strokeWeight, 1);
    map.layerListeners.mousemove({features: [{placeId: 'AU'}]});
    map.mapListeners.mouseout();
    assert.equal(map.layer.style({feature: {placeId: 'AU'}}).strokeWeight, 1);
});
test('hovering another country preserves the selected boundary', async () => {
    const map = harness(); map.window.initCountryMap();
    await map.context.selectCountry({placeId: 'AU'}, 'AU', false);
    map.layerListeners.mousemove({features: [{placeId: 'NZ'}]});
    assert.equal(map.layer.style({feature: {placeId: 'AU'}}).strokeWeight, 3);
    assert.equal(map.layer.style({feature: {placeId: 'NZ'}}).strokeWeight, 2);
});
test('touch selection highlights immediately while country lookup is pending', async () => {
    let resolve;
    const map = harness({}, {geocode: () => new Promise(callback => {resolve = callback;})});
    map.window.initCountryMap();
    const selection = map.context.selectCountry({placeId: 'AU'}, 'AU', false);
    assert.equal(map.layer.style({feature: {placeId: 'AU'}}).strokeWeight, 2);
    assert.equal(map.messages.at(-1).type, 'selecting');
    resolve(result('AU')); await selection;
    assert.equal(map.layer.style({feature: {placeId: 'AU'}}).strokeWeight, 3);
});
test('older responses cannot replace the newest selection', async () => {
    const pending = [];
    const map = harness({}, {geocode: () => new Promise(resolve => pending.push(resolve))}); map.window.initCountryMap();
    const first = map.context.selectCountry({placeId: 'AU'}, 'AU', false);
    const second = map.context.selectCountry({placeId: 'NZ'}, 'NZ', false);
    pending[1](result('NZ')); await second;
    pending[0](result('AU')); await first;
    assert.equal(map.messages.filter(message => message.type === 'selection').length, 1);
    assert.equal(map.messages.at(-1).code, 'NZ');
    assert.equal(map.layer.style({feature: {placeId: 'NZ'}}).strokeWeight, 3);
    assert.equal(map.layer.style({feature: {placeId: 'AU'}}).strokeWeight, 1);
});
test('failed selection preserves the previous highlight', async () => {
    let count = 0;
    const map = harness({}, {geocode: () => ++count === 1 ? Promise.resolve(result('AU')) : Promise.reject(new Error('Offline'))});
    map.window.initCountryMap();
    await map.context.selectCountry({placeId: 'AU'}, 'AU', false);
    await map.context.selectCountry({placeId: 'NZ'}, 'NZ', false);
    assert.equal(map.messages.at(-1).reason, 'selection');
    assert.equal(map.layer.style({feature: {placeId: 'AU'}}).strokeWeight, 3);
});
test('unsupported countries cannot become confirmed selections', async () => {
    const map = harness({}, {geocode: () => Promise.resolve(result('XX'))}); map.window.initCountryMap();
    await map.context.selectCountry({placeId: 'unknown'}, 'unknown', false);
    assert.equal(map.messages.at(-1).reason, 'selection');
    assert.equal(map.messages.some(message => message.type === 'selection'), false);
});
test('boundaries can recover after a capabilities update', () => {
    const map = harness({}, {available: false, renderer: 'UNINITIALIZED'}); map.window.initCountryMap();
    [...map.timers.values()].find(timer => timer.milliseconds === 20000).callback();
    assert.equal(map.messages.at(-1).reason, 'boundaries');
    map.layer.isAvailable = true; map.rendering.value = 'VECTOR'; map.mapListeners.mapcapabilities_changed();
    assert.equal(map.messages.at(-1).type, 'ready');
});
test('network and authentication failures are reported', () => {
    const map = harness(); map.scripts[0].onerror();
    assert.equal(map.messages.at(-1).reason, 'network');
    map.window.gm_authFailure(); assert.equal(map.messages.at(-1).reason, 'configuration');
});
test('native and browser transports use the same validated message format', () => {
    const map = harness({}, {native: true}); map.window.initCountryMap();
    assert.equal(readMapMessage(JSON.stringify(map.messages.at(-1)), 'test-channel').type, 'ready');
    for (const value of [null, '{', 3, {channel: 'other', type: 'ready'}, {channel: 'test-channel', type: 'selection', code: 'XX'}, {channel: 'test-channel', type: 'error', reason: 'unknown'}]) {
        assert.equal(readMapMessage(value, 'test-channel'), null);
    }
});
test('configuration cannot close the HTML script element', () => {
    const html = createCountryMapDocument({...baseOptions, apiKey: '</script><script>attack()</script>'});
    assert.equal((html.match(/<script>/g) ?? []).length, 1);
    assert.equal(html.includes('<script>attack()'), false);
});
test('API route validates channels and serves uncached HTML', async () => {
    const {GET} = loadSource('src/app/country-map+api.ts', {GOOGLE_MAPS_API_KEY: 'test-key', GOOGLE_MAPS_MAP_ID: 'test-map'});
    assert.equal(GET(new Request('https://travel.example/country-map')).status, 400);
    assert.equal(GET(new Request('https://travel.example/country-map?channel=%3Cscript%3E')).status, 400);
    const response = GET(new Request('https://travel.example/country-map?channel=test-channel&country=AU&theme=dark'));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.ok(response.headers.get('Content-Type').startsWith('text/html'));
    const html = await response.text();
    assert.ok(html.includes('"dark":true'));
    assert.ok(html.includes('"initialCountry":{"code":"AU","name":"Australia"}'));
});

test('raster mode falls back to interactive local polygons without geocoding', async () => {
    const map = harness({}, {renderer: 'RASTER', available: false}); map.window.initCountryMap();
    await flush();
    assert.equal(map.messages.at(-1).type, 'ready');
    const feature = map.data.getFeatureById('AU');
    map.dataListeners.mouseover({feature});
    assert.equal(map.data.style(feature).strokeWeight, 2);
    map.dataListeners.click({feature});
    assert.equal(map.data.style(feature).strokeWeight, 3);
    assert.equal(map.messages.at(-1).code, 'AU');
    assert.equal(map.requests.length, 0);
});
test('losing vector support after readiness switches to the local layer', async () => {
    const map = harness(); map.window.initCountryMap();
    map.rendering.value = 'RASTER'; map.layer.isAvailable = false;
    map.mapListeners.renderingtype_changed();
    assert.equal(map.messages.at(-1).type, 'loading');
    await flush();
    assert.equal(map.messages.at(-1).type, 'ready');
    assert.equal(typeof map.dataListeners.click, 'function');
});
test('failed polygon download reports a boundary error instead of false readiness', async () => {
    const map = harness({}, {renderer: 'RASTER', available: false, boundaryFailure: true});
    map.window.initCountryMap(); await flush();
    assert.equal(map.messages.at(-1).reason, 'boundaries');
});
test('bundled fallback contains valid supported country codes and closed polygons', () => {
    const boundaries = JSON.parse(fs.readFileSync(path.join(root, 'public/data/country-boundaries.geojson'), 'utf8'));
    const {COUNTRIES} = loadSource('src/pages/explore/data/countries.ts');
    const supported = new Set(COUNTRIES.map(country => country.code));
    assert.ok(boundaries.features.length > 200);
    assert.equal(new Set(boundaries.features.map(feature => feature.properties.code)).size, boundaries.features.length);
    const australia = boundaries.features.find(feature => feature.properties.code === 'AU');
    const longitudes = australia.geometry.coordinates.flat(2).map(point => point[0]);
    assert.ok(Math.max(...longitudes) - Math.min(...longitudes) > 30);
    for (const feature of boundaries.features) {
        assert.ok(supported.has(feature.properties.code));
        const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
        for (const polygon of polygons) for (const ring of polygon) {
            assert.ok(ring.length >= 4);
            assert.deepEqual(ring[0], ring.at(-1));
        }
    }
});
