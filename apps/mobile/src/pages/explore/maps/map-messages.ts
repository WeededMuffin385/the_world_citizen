export type MapError = 'configuration' | 'boundaries' | 'network' | 'selection';
export type MapMessage =
    | {type: 'loading' | 'ready' | 'selecting'}
    | {type: 'selection'; code: string}
    | {type: 'error'; reason: MapError};

export type CountryMapSurfaceProps = {
    selected: string | null;
    dark: boolean;
    onMessage: (message: MapMessage) => void;
    onError: (reason: MapError) => void;
};
