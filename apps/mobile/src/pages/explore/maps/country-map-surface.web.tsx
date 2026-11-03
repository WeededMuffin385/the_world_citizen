import {useEffect, useRef} from 'react';

import {readMapMessage, type CountryMapSurfaceProps} from './map-messages';

export function CountryMapSurface({path, channel, onMessage, onError}: CountryMapSurfaceProps) {
    const frame = useRef<HTMLIFrameElement>(null);
    useEffect(() => {
        function receive(event: MessageEvent) {
            if (event.source !== frame.current?.contentWindow || event.origin !== window.location.origin) return;
            const message = readMapMessage(event.data, channel);
            if (message) onMessage(message);
        }
        window.addEventListener('message', receive);
        return () => window.removeEventListener('message', receive);
    }, [channel, onMessage]);

    return (
        <iframe ref={frame} src={path} title="Choose a country on Google Maps"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            onError={() => onError('network')}
            style={{display: 'block', width: '100%', height: '100%', border: 0, flex: 1}} />
    );
}
