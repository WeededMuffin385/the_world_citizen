import type {StyleSpecification} from '@maplibre/maplibre-react-native';
import type {FeatureCollection, MultiPolygon, Polygon} from 'geojson';

import boundaries from '../data/country-boundaries.json';
import {COUNTRIES} from '../data/countries';

export const COUNTRY_BOUNDARIES = boundaries as FeatureCollection<Polygon | MultiPolygon, {code: string}>;
const supported = new Set<string>(COUNTRIES.map(country => country.code));

export function readCountryCode(value: unknown): string | null {
    return typeof value === 'string' && supported.has(value) ? value : null;
}

export function countryBounds(code: string | null): [number, number, number, number] | null {
    const feature = COUNTRY_BOUNDARIES.features.find(item => item.properties.code === code);
    if (!feature) return null;
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    const points = polygons.flat(2);
    // Shift countries crossing the antimeridian into one continuous viewport.
    const crossesDateLine = Math.max(...points.map(point => point[0])) - Math.min(...points.map(point => point[0])) > 180;
    const longitudes = points.map(point => crossesDateLine && point[0] < 0 ? point[0] + 360 : point[0]);
    const latitudes = points.map(point => Math.max(-80, Math.min(80, point[1])));
    return [Math.min(...longitudes), Math.min(...latitudes), Math.max(...longitudes), Math.max(...latitudes)];
}

export function countryMapStyle(dark: boolean, selected: string | null, hovered: string | null = null): StyleSpecification {
    return {
        version: 8,
        sources: {countries: {type: 'geojson', data: COUNTRY_BOUNDARIES, attribution: 'Natural Earth'}},
        layers: [
            {id: 'ocean', type: 'background', paint: {'background-color': dark ? '#171d24' : '#dcecf5'}},
            {id: 'countries', type: 'fill', source: 'countries', paint: {
                'fill-color': ['case', ['==', ['get', 'code'], selected ?? ''], '#a6cf75',
                    ['==', ['get', 'code'], hovered ?? ''], '#b8dc91', dark ? '#33452b' : '#edf3e4'],
                'fill-opacity': 1,
            }},
            {id: 'borders', type: 'line', source: 'countries', paint: {
                'line-color': dark ? '#a8b69a' : '#63734f', 'line-width': 0.7,
            }},
            {id: 'selected-border', type: 'line', source: 'countries',
                filter: ['==', ['get', 'code'], selected ?? ''],
                paint: {'line-color': dark ? '#d5efb5' : '#557d30', 'line-width': 2.5}},
        ],
    };
}
