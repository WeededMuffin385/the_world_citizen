import 'maplibre-gl/dist/maplibre-gl.css';

import {useEffect, useRef} from 'react';
import type {Map as WebMap} from 'maplibre-gl';

import {countryBounds, countryMapStyle, readCountryCode} from './country-map-data';
import type {CountryMapSurfaceProps} from './map-messages';

export function CountryMapSurface({selected, dark, onMessage, onError}: CountryMapSurfaceProps) {
    const container = useRef<HTMLDivElement>(null);
    useEffect(() => {
        let disposed = false;
        let map: WebMap | undefined;
        // Import in the browser only so web server rendering needs no DOM or WebGL.
        void import('maplibre-gl').then(({Map, setWorkerUrl, getVersion}) => {
            if (disposed || !container.current) return;
            const baseUrl = process.env.EXPO_BASE_URL ?? '';
            setWorkerUrl(`${baseUrl}/vendor/maplibre/${getVersion()}/maplibre-gl-worker.mjs`);
            const bounds = countryBounds(selected);
            map = new Map({
                container: container.current,
                style: countryMapStyle(dark, selected),
                center: [10, 20], zoom: 0.5, minZoom: 0, maxZoom: 8,
                ...(bounds ? {bounds, fitBoundsOptions: {padding: 32}} : {}),
                attributionControl: false,
            });
            let draft = selected;
            map.on('load', () => {if (!disposed) onMessage({type: 'ready'});});
            map.on('error', () => {if (!disposed) onError('boundaries');});
            const highlight = (hovered: string | null) => {
                const layer = countryMapStyle(dark, draft, hovered).layers[1];
                if (layer.type === 'fill') map?.setPaintProperty('countries', 'fill-color', layer.paint?.['fill-color']);
            };
            map.on('mousemove', 'countries', event => {
                if (!map) return;
                map.getCanvas().style.cursor = 'pointer';
                highlight(readCountryCode(event.features?.[0]?.properties?.code));
            });
            map.on('mouseleave', 'countries', () => {
                if (map) map.getCanvas().style.cursor = '';
                highlight(null);
            });
            map.on('click', 'countries', event => {
                const code = readCountryCode(event.features?.[0]?.properties?.code);
                if (!code || !map) return;
                draft = code;
                highlight(null);
                map.setFilter('selected-border', ['==', ['get', 'code'], code]);
                onMessage({type: 'selection', code});
            });
        }).catch(() => {if (!disposed) onError('boundaries');});
        return () => {disposed = true; map?.remove();};
    }, [selected, dark, onMessage, onError]);

    return <div ref={container} role="region" aria-label="Choose a country on the map"
        style={{position: 'relative', overflow: 'hidden', width: '100%', flex: 1, minHeight: 160}} />;
}
