import {Camera, GeoJSONSource, Layer, Map, Marker} from '@maplibre/maplibre-react-native';
import {BedDouble, MapPin} from 'lucide-react-native';
import {useState} from 'react';
import {View} from 'react-native';

import {ThemedText} from '@/shared/ui/themed-text';
import {dayBounds, dayRoute} from '../data/trip-itineraries';
import {TRIP_MAP_STYLE, type TripDay} from './trip-map-style';

export function TripMap({day}: {day: TripDay}) {
    const [southwest, northeast] = dayBounds(day);
    const [failed, setFailed] = useState(false);
    return <View style={{height: 320, borderRadius: 18, overflow: 'hidden'}}>
        <Map style={{flex: 1}} mapStyle={TRIP_MAP_STYLE} onDidFailLoadingMap={() => setFailed(true)}>
            <Camera initialViewState={{bounds: [...southwest, ...northeast], padding: {top: 40, bottom: 40, left: 40, right: 40}}} />
            <GeoJSONSource id="day-route" data={dayRoute(day)}>
                <Layer id="route-line" type="line" paint={{'line-color': '#3467CC', 'line-width': 4, 'line-dasharray': [2, 2]}} />
            </GeoJSONSource>
            {day.points.map(point => <Marker key={point.id} id={point.id} lngLat={point.coordinate}>
                <View accessibilityLabel={point.name} style={{backgroundColor: point.kind === 'stay' ? '#30491E' : '#3467CC', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#FFFFFF'}}>
                    {point.kind === 'stay' ? <BedDouble size={20} color="#FFFFFF" /> : <MapPin size={20} color="#FFFFFF" />}
                </View>
            </Marker>)}
        </Map>
        {failed && <View style={{position: 'absolute', top: 8, left: 8, right: 8, backgroundColor: '#FFFFFF', padding: 8}}>
            <ThemedText style={{color: '#30491E'}}>Map unavailable. See the stops and schedule below.</ThemedText>
        </View>}
    </View>;
}
