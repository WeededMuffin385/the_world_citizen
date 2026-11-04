import {Camera, GeoJSONSource, Layer, Map, type StyleSpecification} from '@maplibre/maplibre-react-native';
import {useMemo, useState} from 'react';
import {StyleSheet} from 'react-native';

import {COUNTRY_BOUNDARIES, countryBounds, countryMapStyle, readCountryCode} from './country-map-data';
import type {CountryMapSurfaceProps} from './map-messages';

// Keep the native style stable so selection does not reload the country geometry.
const BASE_STYLE: StyleSpecification = {version: 8, sources: {}, layers: []};

export function CountryMapSurface({selected, dark, onMessage, onError}: CountryMapSurfaceProps) {
    const [draft, setDraft] = useState(selected);
    const style = useMemo(() => countryMapStyle(dark, draft), [dark, draft]);
    const initialViewState = useMemo(() => {
        const bounds = countryBounds(selected);
        return bounds ? {bounds, padding: {top: 32, bottom: 32, left: 32, right: 32}} : {center: [10, 20] as [number, number], zoom: 0.5};
    }, [selected]);

    return (
        <Map style={styles.map} mapStyle={BASE_STYLE}
            onDidFinishLoadingMap={() => onMessage({type: 'ready'})}
            onDidFailLoadingMap={() => onError('boundaries')}>
            {style.layers.filter(layer => layer.type === 'background').map(layer => (
                <Layer key={layer.id} {...layer} />
            ))}
            <GeoJSONSource id="countries" data={COUNTRY_BOUNDARIES} onPress={event => {
                const code = readCountryCode(event.nativeEvent.features[0]?.properties?.code);
                if (!code) return;
                setDraft(code);
                onMessage({type: 'selection', code});
            }}>
                {style.layers.filter(layer => layer.type !== 'background').map(layer => (
                    <Layer key={layer.id} {...layer} />
                ))}
            </GeoJSONSource>
            <Camera initialViewState={initialViewState} minZoom={0} maxZoom={8} />
        </Map>
    );
}

const styles = StyleSheet.create({map: {flex: 1}});
