import {router, useLocalSearchParams} from 'expo-router';
import {ArrowLeft} from 'lucide-react-native';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useActiveTrip} from '@/pages/journey/active-trip';
import {useAppTheme} from '@/shared/theme/provider';
import {MaxContentWidth} from '@/shared/theme/tokens';
import {ThemedText} from '@/shared/ui/themed-text';
import {TripItinerary} from './components/trip-itinerary';
import {LikeTripButton} from './components/like-trip-button';
import {COUNTRIES} from './data/countries';
import {TRIPS} from './data/trips';
import {TRIP_TYPES} from './data/trip-types';

export default function TripDetailsScreen() {
    const {id} = useLocalSearchParams<{id: string}>();
    const trip = TRIPS.find(item => item.id === id);
    return <TripDetailsView trip={trip} />;
}

export function TripDetailsView({trip, journey = false}: {trip: typeof TRIPS[number] | undefined; journey?: boolean}) {
    const {startTrip} = useActiveTrip();
    const type = TRIP_TYPES.find(item => item.id === trip?.typeId);
    const {colors} = useAppTheme();
    return (
        <SafeAreaView edges={journey ? ['top', 'left', 'right'] : undefined} style={[styles.screen, {backgroundColor: colors.background}]}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.toolbar}>
                    {journey ? <ThemedText type="smallBold">Your active trip</ThemedText> : <Pressable accessibilityRole="button" accessibilityLabel="Back to Explore"
                        onPress={() => router.dismissTo('/explore')}
                        style={[styles.back, {backgroundColor: colors.backgroundElement}]}>
                        <ArrowLeft size={20} color={colors.text} /><ThemedText>Back</ThemedText>
                    </Pressable>}
                    {trip && <LikeTripButton id={trip.id} name={trip.name} />}
                </View>
                {trip ? <>
                    <ThemedText type="subtitle">{trip.name}</ThemedText>
                    <ThemedText themeColor="textSecondary">
                        {trip.countryCodes.map(code => COUNTRIES.find(country => country.code === code)?.name).join(' · ')}
                    </ThemedText>
                    <View style={[styles.panel, {backgroundColor: colors.tabSurface}]}>
                        <ThemedText type="smallBold" style={{color: colors.tabTextSelected}}>
                            {trip.currency} {trip.totalPrice.toLocaleString('en-US')}
                        </ThemedText>
                        <ThemedText style={{color: colors.tabTextSelected}}>Estimated trip total per person · {trip.durationDays} days</ThemedText>
                    </View>
                    <ThemedText type="smallBold">Travel style</ThemedText>
                    <ThemedText>{type?.name}</ThemedText>
                    <ThemedText themeColor="textSecondary">{type?.description}</ThemedText>
                    <ThemedText type="smallBold">Route</ThemedText>
                    {trip.route.split(' · ').map((stop, index) => (
                        <View key={stop} style={[styles.stop, {borderColor: colors.backgroundSelected}]}>
                            <ThemedText themeColor="textSecondary">{index + 1}</ThemedText>
                            <ThemedText style={styles.stopName}>{stop}</ThemedText>
                        </View>
                    ))}
                    <TripItinerary key={trip.id} tripId={trip.id} />
                    <ThemedText type="smallBold">About this budget</ThemedText>
                    <ThemedText themeColor="textSecondary">
                        This sample itinerary includes an illustrative budget for accommodation, meals, activities,
                        and transport within the route. Travel to and from the itinerary is excluded.
                        Prices are estimates, not bookable offers.
                    </ThemedText>
                </> : <>
                    <ThemedText type="subtitle">Trip not found</ThemedText>
                    <ThemedText themeColor="textSecondary">Return to Explore to choose another trip.</ThemedText>
                </>}
            </ScrollView>
            {trip && !journey && <View style={[styles.footer, {backgroundColor: colors.background, borderColor: colors.backgroundSelected}]}>
                <Pressable accessibilityRole="button" accessibilityLabel="Start trip"
                    onPress={() => {startTrip(trip.id); router.dismissTo('/journey');}}
                    style={({pressed}) => [styles.startButton, {backgroundColor: colors.tabTextSelected, opacity: pressed ? 0.7 : 1}]}>
                    <ThemedText type="smallBold" style={{color: colors.background}}>Start trip</ThemedText>
                </Pressable>
            </View>}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1},
    footer: {padding: 20, borderTopWidth: 1},
    startButton: {width: '100%', minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center'},
    content: {width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: 20, gap: 16},
    toolbar: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    back: {minHeight: 44, paddingHorizontal: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8},
    panel: {padding: 20, borderRadius: 18, gap: 8},
    stop: {flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderWidth: 1, borderRadius: 14},
    stopName: {flex: 1},
});
