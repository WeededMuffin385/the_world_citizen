import 'maplibre-gl/dist/maplibre-gl.css';
import {useEffect, useRef, useState} from 'react';
import type {Map as WebMap} from 'maplibre-gl';

import {dayBounds, dayRoute} from '../data/trip-itineraries';
import {TRIP_MAP_STYLE, type TripDay} from './trip-map-style';

export function TripMap({day}: {day: TripDay}) {
    const container = useRef<HTMLDivElement>(null);
    const [failed, setFailed] = useState(false);
    useEffect(() => {
        let disposed = false;
        let map: WebMap | undefined;
        void import('maplibre-gl').then(({Map, Marker, Popup, NavigationControl, setWorkerUrl, getVersion}) => {
            if (disposed || !container.current) return;
            setWorkerUrl(`${process.env.EXPO_BASE_URL ?? ''}/vendor/maplibre/${getVersion()}/maplibre-gl-worker.mjs`);
            map = new Map({container: container.current, style: TRIP_MAP_STYLE, bounds: dayBounds(day), fitBoundsOptions: {padding: 48}});
            map.addControl(new NavigationControl(), 'top-right');
            map.on('error', () => {if (!disposed) setFailed(true);});
            map.on('load', () => {
                if (!map || disposed) return;
                map.addSource('day-route', {type: 'geojson', data: dayRoute(day)});
                map.addLayer({id: 'route-line', type: 'line', source: 'day-route', paint: {'line-color': '#3467CC', 'line-width': 4, 'line-dasharray': [2, 2]}});
                day.points.forEach(point => {
                    const element = document.createElement('button');
                    element.type = 'button';
                    element.setAttribute('aria-label', point.name);
                    element.textContent = point.kind === 'stay' ? '🛏' : '📍';
                    Object.assign(element.style, {background: point.kind === 'stay' ? '#30491E' : '#3467CC', border: '2px solid white', borderRadius: '50%', width: '38px', height: '38px', fontSize: '20px', cursor: 'pointer'});
                    new Marker({element}).setLngLat(point.coordinate).setPopup(new Popup({offset: 20}).setText(point.name)).addTo(map!);
                });
            });
        }).catch(() => {if (!disposed) setFailed(true);});
        return () => {disposed = true; map?.remove();};
    }, [day]);
    return <div style={{position: 'relative', height: 320, borderRadius: 18, overflow: 'hidden'}}>
        <div ref={container} role="region" aria-label={`Day ${day.day} map of ${day.place}, accommodation and route`} style={{height: '100%'}} />
        {failed && <div role="status" style={{position: 'absolute', top: 8, left: 8, padding: 8, background: 'white', color: '#30491E'}}>Map unavailable. See the stops and schedule below.</div>}
    </div>;
}
