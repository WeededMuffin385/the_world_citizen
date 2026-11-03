import {Camera, Map, type MapRef} from '@maplibre/maplibre-react-native';
import {useMemo, useRef, useState} from 'react';
import {StyleSheet} from 'react-native';

import {countryBounds, countryMapStyle, readCountryCode} from './country-map-data';
import type {CountryMapSurfaceProps} from './map-messages';

export function CountryMapSurface({selected, dark, onMessage, onError}: CountryMapSurfaceProps) {
    const map = useRef<MapRef>(null);
    const request = useRef(0);
    const [draft, setDraft] = useState(selected);
    const style = useMemo(() => countryMapStyle(dark, draft), [dark, draft]);
    const initialViewState = useMemo(() => {
        const bounds = countryBounds(selected);
        return bounds ? {bounds, padding: {top: 32, bottom: 32, left: 32, right: 32}} : {center: [10, 20] as [number, number], zoom: 0.5};
    }, [selected]);

    return (
        <Map ref={map} style={styles.map} mapStyle={style}
            onDidFinishLoadingMap={() => onMessage({type: 'ready'})}
            onDidFailLoadingMap={() => onError('boundaries')}
            onPress={async event => {
                const current = ++request.current;
                try {
                    const features = await map.current?.queryRenderedFeatures(event.nativeEvent.point, {layers: ['countries']});
                    if (current !== request.current) return;
                    const code = readCountryCode(features?.[0]?.properties?.code);
                    if (!code) return;
                    setDraft(code);
                    onMessage({type: 'selection', code});
                } catch {
                    if (current === request.current) onError('selection');
                }
            }}>
            <Camera initialViewState={initialViewState} minZoom={0} maxZoom={8} />
        </Map>
    );
}

const styles = StyleSheet.create({map: {flex: 1}});
