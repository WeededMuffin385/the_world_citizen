import {MapPin, RotateCcw, X} from 'lucide-react-native';
import {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Modal, Pressable, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAppTheme} from '@/shared/theme/provider';
import {ThemedText} from '@/shared/ui/themed-text';
import {COUNTRIES} from '../data/countries';
import {CountryMapSurface} from '../maps/country-map-surface';
import type {MapError, MapMessage} from '../maps/map-messages';

type Props = {selected: string | null; onSelect: (code: string) => void; onClose: () => void};
type MapState = {status: 'loading' | 'ready' | 'selecting' | 'error'; draft: string | null; error: MapError | null};

const ERRORS: Record<MapError, string> = {
    configuration: 'The map is not available yet. You can still choose a country from the list in your filters.',
    boundaries: 'Country boundaries are unavailable. Please choose a country from the list in your filters.',
    network: 'Could not render the map. Try again or choose a country from the list.',
    selection: 'Could not select this country. Try another country or choose from the list in your filters.',
};

export function CountryMapPicker({selected, onSelect, onClose}: Props) {
    const {colors, scheme} = useAppTheme();
    const [attempt, setAttempt] = useState(0);
    const [state, setState] = useState<MapState>({status: 'loading', draft: selected, error: null});
    const country = COUNTRIES.find(item => item.code === state.draft);

    const onError = useCallback((reason: MapError) => {
        setState(previous => ({...previous, status: reason === 'selection' ? 'ready' : 'error', error: reason}));
    }, []);
    const onMessage = useCallback((message: MapMessage) => {
        switch (message.type) {
            case 'loading':
                setState(previous => ({...previous, status: 'loading', error: null}));
                break;
            case 'ready':
                setState(previous => ({...previous, status: 'ready', error: null}));
                break;
            case 'selecting':
                setState(previous => ({...previous, status: 'selecting', error: null}));
                break;
            case 'selection':
                setState({status: 'ready', draft: message.code, error: null});
                break;
            case 'error':
                onError(message.reason);
                break;
        }
    }, [onError]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setState(previous => previous.status === 'loading'
                ? {...previous, status: 'error', error: 'boundaries'} : previous);
        }, 25000);
        return () => clearTimeout(timeout);
    }, [attempt]);

    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose}>
            <SafeAreaView style={[styles.overlay, {backgroundColor: colors.background}]}>
                <View accessibilityViewIsModal style={styles.sheet}>
                    <View style={styles.heading}>
                        <View style={styles.flex}>
                            <ThemedText type="smallBold">Choose on map</ThemedText>
                            <ThemedText type="small" themeColor="textSecondary">Tap or click a country to select it.</ThemedText>
                        </View>
                        <Pressable accessibilityRole="button" accessibilityLabel="Close map" onPress={onClose} style={styles.iconButton}>
                            <X color={colors.text} size={22} />
                        </Pressable>
                    </View>
                    <View style={[styles.map, {backgroundColor: colors.backgroundElement}]}>
                        <CountryMapSurface key={attempt} selected={selected} dark={scheme === 'dark'} onMessage={onMessage} onError={onError} />
                        {(state.status === 'loading' || state.status === 'selecting') && (
                            <View pointerEvents="none" style={[styles.loading, {backgroundColor: colors.background}]}>
                                <ActivityIndicator color={colors.tabText} />
                                <ThemedText type="small">{state.status === 'loading' ? 'Loading map…' : 'Selecting country…'}</ThemedText>
                            </View>
                        )}
                    </View>
                    <ThemedText type="small" themeColor="textSecondary">Country outlines: Natural Earth (public domain)</ThemedText>
                    {state.error && (
                        <View style={styles.error} accessibilityLiveRegion="polite">
                            <ThemedText type="small" themeColor="textSecondary">{ERRORS[state.error]}</ThemedText>
                            <View style={styles.actions}>
                                <Pressable accessibilityRole="button" onPress={() => {
                                    setState({status: 'loading', draft: selected, error: null});
                                    setAttempt(value => value + 1);
                                }} style={styles.secondaryButton}>
                                    <RotateCcw color={colors.tabText} size={16} />
                                    <ThemedText type="small">Retry map</ThemedText>
                                </Pressable>
                                <Pressable accessibilityRole="button" onPress={onClose} style={styles.secondaryButton}>
                                    <ThemedText type="small">Back to filters</ThemedText>
                                </Pressable>
                            </View>
                        </View>
                    )}
                    <View style={[styles.footer, {backgroundColor: colors.tabSurface}]}>
                        <MapPin color={colors.tabText} size={22} />
                        <View style={styles.flex} accessibilityLiveRegion="polite">
                            <ThemedText type="small" style={{color: colors.tabText}}>Selected country</ThemedText>
                            <ThemedText type="smallBold" style={{color: colors.tabTextSelected}}>{country?.name ?? 'Tap a country on the map'}</ThemedText>
                        </View>
                        <Pressable accessibilityRole="button" disabled={!country || state.status !== 'ready'}
                            accessibilityState={{disabled: !country || state.status !== 'ready'}}
                            onPress={() => {if (country) {onSelect(country.code); onClose();}}}
                            style={[styles.confirm, {backgroundColor: colors.tabSurfaceSelected}, (!country || state.status !== 'ready') && styles.disabled]}>
                            <ThemedText type="smallBold" style={{color: colors.tabTextSelected}}>Select country</ThemedText>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {flex: 1, padding: 16, alignItems: 'center'},
    sheet: {flex: 1, width: '100%', maxWidth: 1100, gap: 12},
    heading: {flexDirection: 'row', alignItems: 'center', gap: 8},
    flex: {flex: 1, minWidth: 100, gap: 4},
    iconButton: {minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center'},
    map: {flex: 1, minHeight: 160, borderRadius: 18, overflow: 'hidden'},
    loading: {position: 'absolute', top: 12, left: 12, right: 12, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10},
    error: {gap: 4},
    actions: {flexDirection: 'row', flexWrap: 'wrap', gap: 16},
    secondaryButton: {minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8},
    footer: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: 16, borderRadius: 18},
    confirm: {minHeight: 48, padding: 12, borderRadius: 14, justifyContent: 'center'},
    disabled: {opacity: 0.4},
});
