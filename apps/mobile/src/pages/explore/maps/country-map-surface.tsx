import {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';

import {readMapMessage, type CountryMapSurfaceProps} from './map-messages';

export function CountryMapSurface({path, channel, onMessage, onError}: CountryMapSurfaceProps) {
    const origin = process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_ORIGIN?.trim();
    let uri: string | null = null;
    try {
        const url = origin ? new URL(path, origin) : null;
        if (url && ['https:', 'http:'].includes(url.protocol)) uri = url.href;
    } catch {
        // Keep the list picker available when the map host is not configured.
    }

    useEffect(() => {
        if (!uri) onError('configuration');
    }, [uri, onError]);

    if (!uri) return <View style={styles.map} />;

    return (
        <WebView source={{uri}} style={styles.map} javaScriptEnabled domStorageEnabled
            onMessage={event => {
                const message = readMapMessage(event.nativeEvent.data, channel);
                if (message) onMessage(message);
            }}
            onError={() => onError('network')}
            onHttpError={() => onError('network')}
            onContentProcessDidTerminate={() => onError('network')}
            onRenderProcessGone={() => onError('network')}
        />
    );
}

const styles = StyleSheet.create({map: {flex: 1, backgroundColor: 'transparent'}});
