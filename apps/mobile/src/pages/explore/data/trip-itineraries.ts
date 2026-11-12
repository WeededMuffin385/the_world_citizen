import type {Feature, LineString} from 'geojson';
import {TRIPS} from './trips';
import type {TripTypeId} from './trip-types';

export type MapPoint = {id: string; name: string; coordinate: [number, number]; kind: 'stay' | 'activity'};
export type TripDay = {day: number; place: string; points: MapPoint[]; events: {time: string; title: string; detail: string}[]};

// Approximate city centers; all lodging, activities, and routes below are fictional.
const CENTERS: Record<typeof TRIPS[number]['id'], [number, number][]> = {
    'japan-classics': [[139.76, 35.68], [135.77, 35.01], [135.5, 34.69]],
    'bali-beaches': [[115.26, -8.69], [115.23, -8.8]],
    'dolomites-hiking': [[12.14, 46.54], [11.7, 46.56]],
    'thai-flavors': [[100.5, 13.75], [98.99, 18.79]],
    'costa-rica-wildlife': [[-83.52, 10.54], [-84.7, 10.46], [-84.82, 10.3]],
    'ubud-wellness': [[115.26, -8.51]],
    'great-ocean-road': [[144.96, -37.81], [143.67, -38.75], [143, -38.62]],
    'europe-by-road': [[11.58, 48.14], [11.4, 47.27], [10.61, 45.6]],
    'portugal-culture': [[-9.14, 38.72], [-9.38, 38.8]],
    'new-zealand-active': [[168.66, -45.03], [169.14, -44.7], [167.72, -45.41]],
    'greece-islands': [[25.38, 37.1], [25.15, 37.09]],
    'tanzania-safari': [[36.68, -3.37], [34.83, -2.33], [35.57, -3.2]],
};
const ACTIVITIES: Record<TripTypeId, [string, string, string]> = {
    active: ['Guided morning hike', 'Trail picnic', 'Scenic outdoor walk'],
    culture: ['Historic quarter walk', 'Museum and local history', 'Landmark sightseeing'],
    relaxation: ['Beach time', 'Seaside lunch and rest', 'Sunset coastal stroll'],
    wellness: ['Morning yoga', 'Spa and recovery session', 'Mindfulness walk'],
    wildlife: ['Wildlife watching', 'Nature reserve exploration', 'Guided sunset lookout'],
    food: ['Local market tasting', 'Regional cooking class', 'Neighborhood food walk'],
    'road-trip': ['Scenic drive', 'Village lunch stop', 'Panoramic viewpoint'],
};

export const TRIP_ITINERARIES = Object.fromEntries(TRIPS.map(trip => {
    const centers = CENTERS[trip.id];
    const places = trip.route.split(' · ');
    const days: TripDay[] = Array.from({length: trip.durationDays}, (_, index) => {
        const stopIndex = Math.min(centers.length - 1, Math.floor(index * centers.length / trip.durationDays));
        const previousIndex = index === 0 ? stopIndex : Math.floor((index - 1) * centers.length / trip.durationDays);
        const [lng, lat] = centers[stopIndex];
        const place = places[stopIndex];
        const offset = (index % 3) * 0.003;
        const points: MapPoint[] = [
            {id: 'stay', name: `Sample ${place} guesthouse`, coordinate: [lng, lat], kind: 'stay'},
            {id: 'morning', name: ACTIVITIES[trip.typeId][0], coordinate: [lng + 0.012 + offset, lat + 0.008], kind: 'activity'},
            {id: 'afternoon', name: ACTIVITIES[trip.typeId][1], coordinate: [lng - 0.009, lat + 0.016 + offset], kind: 'activity'},
            {id: 'evening', name: ACTIVITIES[trip.typeId][2], coordinate: [lng - 0.014 - offset, lat - 0.006], kind: 'activity'},
        ];
        if (previousIndex !== stopIndex) points.unshift({id: 'departure', name: `Depart ${places[previousIndex]}`, coordinate: centers[previousIndex], kind: 'activity'});
        return {day: index + 1, place, points, events: [
            {time: '08:00–09:00', title: index === 0 ? 'Arrival and breakfast' : 'Breakfast', detail: `Start the day in ${places[previousIndex]}.`},
            {time: '09:00–12:00', title: previousIndex !== stopIndex ? `Transfer to ${place}` : ACTIVITIES[trip.typeId][0], detail: previousIndex !== stopIndex ? 'Illustrative transfer window; actual travel time may differ.' : `Explore the surroundings of ${place} at an easy pace.`},
            {time: '12:00–13:00', title: 'Lunch break', detail: 'Try a local cafe and take time to rest.'},
            {time: '13:00–16:00', title: ACTIVITIES[trip.typeId][1], detail: `A mock afternoon experience near ${place}.`},
            {time: '16:00–18:00', title: ACTIVITIES[trip.typeId][2], detail: 'Free time and a relaxed return route.'},
            {time: '18:00–20:00', title: 'Dinner and free time', detail: 'Enjoy dinner and plan the next day.'},
            {time: '20:00–22:00', title: index === trip.durationDays - 1 ? 'Wrap up and departure preparation' : 'Return to accommodation', detail: index === trip.durationDays - 1 ? 'Check out and finish the trip, or arrange an optional extra night.' : `Overnight at Sample ${place} guesthouse.`},
        ]};
    });
    return [trip.id, days];
})) as Record<typeof TRIPS[number]['id'], TripDay[]>;

export function dayRoute(day: TripDay): Feature<LineString> {
    return {type: 'Feature', properties: {}, geometry: {type: 'LineString', coordinates: [...day.points.map(point => point.coordinate), day.points.find(point => point.kind === 'stay')!.coordinate]}};
}

export function dayBounds(day: TripDay): [[number, number], [number, number]] {
    const lng = day.points.map(point => point.coordinate[0]);
    const lat = day.points.map(point => point.coordinate[1]);
    return [[Math.min(...lng) - 0.005, Math.min(...lat) - 0.005], [Math.max(...lng) + 0.005, Math.max(...lat) + 0.005]];
}
