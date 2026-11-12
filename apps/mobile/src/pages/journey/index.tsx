import {router} from 'expo-router';
import {Pressable, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {TRIPS} from '@/pages/explore/data/trips';
import {TripDetailsView} from '@/pages/explore/trip-details';
import {useAppTheme} from '@/shared/theme/provider';
import {ThemedText} from '@/shared/ui/themed-text';
import {useActiveTrip} from './active-trip';

export default function JourneyScreen() {
    const {activeTripId} = useActiveTrip();
    const {colors} = useAppTheme();
    const trip = TRIPS.find(item => item.id === activeTripId);
    if (trip) return <TripDetailsView key={trip.id} trip={trip} journey />;
    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={[styles.empty, {backgroundColor: colors.background}]}>
            <ThemedText type="subtitle">Your journey starts here</ThemedText>
            <ThemedText themeColor="textSecondary">Choose a trip in Explore and tap Start trip.</ThemedText>
            <Pressable accessibilityRole="button" onPress={() => router.navigate('/explore')}
                style={[styles.button, {backgroundColor: colors.tabSurface}]}>
                <ThemedText type="smallBold" style={{color: colors.tabTextSelected}}>Explore trips</ThemedText>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    empty: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16},
    button: {minHeight: 48, paddingHorizontal: 24, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
});
