import {COUNTRIES} from '../data/countries';

export type MapError = 'configuration' | 'boundaries' | 'network' | 'selection';
export type MapMessage =
    | {type: 'loading' | 'ready' | 'selecting'}
    | {type: 'selection'; code: string}
    | {type: 'error'; reason: MapError};

export function readMapMessage(value: unknown, channel: string): MapMessage | null {
    try {
        const message = typeof value === 'string' ? JSON.parse(value) : value;
        if (!message || typeof message !== 'object' || message.channel !== channel) return null;
        if (message.type === 'loading' || message.type === 'ready' || message.type === 'selecting') return {type: message.type};
        if (message.type === 'selection' && COUNTRIES.some(country => country.code === message.code)) {
            return {type: 'selection', code: message.code};
        }
        if (message.type === 'error' && ['configuration', 'boundaries', 'network', 'selection'].includes(message.reason)) {
            return {type: 'error', reason: message.reason};
        }
        return null;
    } catch {
        return null;
    }
}

export type CountryMapSurfaceProps = {
    path: string;
    channel: string;
    onMessage: (message: MapMessage) => void;
    onError: (reason: MapError) => void;
};
