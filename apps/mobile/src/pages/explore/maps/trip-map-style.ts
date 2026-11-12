// Raster streets provide surrounding geography without an API key.
export const TRIP_MAP_STYLE = {
    version: 8 as const,
    sources: {streets: {type: 'raster' as const, tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256,
        attribution: '© OpenStreetMap contributors', maxzoom: 19}},
    layers: [{id: 'streets', type: 'raster' as const, source: 'streets'}],
};
export type {TripDay} from '../data/trip-itineraries';
