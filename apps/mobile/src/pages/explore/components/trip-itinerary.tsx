import {BedDouble, MapPin, Route} from 'lucide-react-native';
import {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';

import {useAppTheme} from '@/shared/theme/provider';
import {ThemedText} from '@/shared/ui/themed-text';
import {TRIP_ITINERARIES} from '../data/trip-itineraries';
import type {TRIPS} from '../data/trips';
import {TripMap} from '../maps/trip-map';

export function TripItinerary({tripId}: {tripId: typeof TRIPS[number]['id']}) {
    const [selectedDay, setSelectedDay] = useState(0);
    const {colors} = useAppTheme();
    const days = TRIP_ITINERARIES[tripId];
    const day = days[selectedDay] ?? days[0];
    return <View style={styles.section}>
        <ThemedText type="smallBold">Daily itinerary & map</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
            Mock itinerary · Approximate local times, fictional accommodation and activity locations.
            Dashed lines show schematic routes, not navigation directions.
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
            {days.map((item, index) => <Pressable key={item.day} accessibilityRole="button"
                accessibilityLabel={`Day ${item.day}: ${item.place}`} accessibilityState={{selected: day.day === item.day}}
                onPress={() => setSelectedDay(index)} style={[styles.day, {backgroundColor: day.day === item.day ? colors.tabSurfaceSelected : colors.backgroundElement}]}>
                <ThemedText type="smallBold">Day {item.day}</ThemedText>
            </Pressable>)}
        </ScrollView>
        <ThemedText type="smallBold">Day {day.day} · {day.place}</ThemedText>
        <TripMap key={`${tripId}-${day.day}`} day={day} />
        <View style={styles.legend}>
            <View style={styles.inline}><BedDouble size={18} color={colors.tabText} /><ThemedText type="small">Accommodation</ThemedText></View>
            <View style={styles.inline}><MapPin size={18} color="#3467CC" /><ThemedText type="small">Activities</ThemedText></View>
            <View style={styles.inline}><Route size={18} color="#3467CC" /><ThemedText type="small">Mock route</ThemedText></View>
        </View>
        {day.points.map(point => <View key={point.id} style={styles.inline}>
            {point.kind === 'stay' ? <BedDouble size={16} color={colors.tabText} /> : <MapPin size={16} color="#3467CC" />}
            <ThemedText type="small" style={styles.flex}>{point.name}</ThemedText>
        </View>)}
        <ThemedText type="smallBold">Approximate schedule</ThemedText>
        {day.events.map(event => <View key={event.time} style={[styles.event, {borderColor: colors.backgroundSelected}]}>
            <ThemedText type="smallBold" style={{color: colors.tabText}}>{event.time}</ThemedText>
            <ThemedText type="smallBold">{event.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{event.detail}</ThemedText>
        </View>)}
    </View>;
}

const styles = StyleSheet.create({
    section: {gap: 14},
    days: {gap: 8},
    day: {minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 14},
    legend: {flexDirection: 'row', flexWrap: 'wrap', gap: 16},
    inline: {flexDirection: 'row', alignItems: 'center', gap: 8},
    flex: {flex: 1},
    event: {borderLeftWidth: 3, paddingLeft: 16, paddingVertical: 8, gap: 6},
});
