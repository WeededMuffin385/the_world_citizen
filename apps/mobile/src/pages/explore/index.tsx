import {CalendarDays, ChevronDown, Globe2, Map, MapPin, RotateCcw, Search, SlidersHorizontal, X} from 'lucide-react-native';
import {useState, type PropsWithChildren} from 'react';
import {FlatList, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAppTheme} from '@/shared/theme/provider';
import {MaxContentWidth, Spacing} from '@/shared/theme/tokens';
import {ThemedText} from '@/shared/ui/themed-text';
import {CountryPicker} from './components/country-picker';
import {CountryMapPicker} from './components/country-map-picker';
import {TravelCalendar} from './components/travel-calendar';
import {COUNTRIES} from './data/countries';
import {formatDate, startOfDay, tripDays} from './date-utils';

const DURATIONS = ['Any duration', '1–3 days', '4–7 days', '8–14 days', '15+ days'] as const;
type DateField = 'start' | 'end';

function FilterChip({children, selected, onPress}: PropsWithChildren<{selected: boolean; onPress: () => void}>) {
    const {colors} = useAppTheme();
    return (
        <Pressable accessibilityRole="button" accessibilityState={{selected}} onPress={onPress}
            style={({pressed}) => [styles.chip, {
                backgroundColor: selected ? colors.tabSurfaceSelected : colors.backgroundElement,
            }, pressed && styles.pressed]}>
            <ThemedText type="small" style={{color: selected ? colors.tabTextSelected : colors.textSecondary}}>
                {children}
            </ThemedText>
        </Pressable>
    );
}

export default function ExploreScreen() {
    const {colors} = useAppTheme();
    const [query, setQuery] = useState('');
    const [countryCode, setCountryCode] = useState<string | null>(null);
    const [duration, setDuration] = useState<string>(DURATIONS[0]);
    const [start, setStart] = useState<Date | null>(null);
    const [end, setEnd] = useState<Date | null>(null);
    const [dateField, setDateField] = useState<DateField | null>(null);
    const [countryPickerOpen, setCountryPickerOpen] = useState(false);
    const [countryMapOpen, setCountryMapOpen] = useState(false);
    const today = startOfDay(new Date());
    const country = COUNTRIES.find(item => item.code === countryCode);
    const destinations = COUNTRIES.filter(item =>
        (!countryCode || item.code === countryCode) && item.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
    const days = start && end ? tripDays(start, end) : null;
    const hasFilters = query !== '' || countryCode !== null || duration !== DURATIONS[0] || start !== null || end !== null;

    function reset() {
        setQuery('');
        setCountryCode(null);
        setDuration(DURATIONS[0]);
        setStart(null);
        setEnd(null);
        setDateField(null);
    }

    function selectDate(date: Date) {
        setDuration(DURATIONS[0]);
        if (dateField === 'start') {
            setStart(date);
            if (end && end < date) setEnd(null);
            setDateField('end');
        } else {
            setEnd(date);
            setDateField(null);
        }
    }

    const header = (
        <View style={styles.header}>
            <View style={[styles.searchBar, {backgroundColor: colors.backgroundElement}]}>
                <Search size={22} color={colors.tabText} />
                <TextInput accessibilityLabel="Search destinations" placeholder="Where would you like to go?"
                    placeholderTextColor={colors.textSecondary} value={query} onChangeText={setQuery}
                    autoCorrect={false} returnKeyType="search" underlineColorAndroid="transparent"
                    style={[styles.searchInput, {color: colors.text}]} />
                {query !== '' && (
                    <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={styles.iconButton}>
                        <X color={colors.textSecondary} size={20} />
                    </Pressable>
                )}
            </View>

            <View style={styles.intro}>
                <ThemedText type="subtitle">Find your next journey</ThemedText>
                <ThemedText themeColor="textSecondary">Pick a country. Make time to explore.</ThemedText>
            </View>

            <View style={[styles.filters, {borderColor: colors.backgroundSelected}]}>
                <View style={styles.sectionHeading}>
                    <View style={styles.inline}>
                        <SlidersHorizontal color={colors.tabText} size={18} />
                        <ThemedText type="smallBold">Trip preferences</ThemedText>
                    </View>
                    <Pressable accessibilityRole="button" accessibilityLabel="Reset search and filters" disabled={!hasFilters}
                        onPress={reset} style={[styles.reset, !hasFilters && styles.disabled]}>
                        <RotateCcw color={colors.textSecondary} size={14} />
                        <ThemedText type="small" themeColor="textSecondary">Reset</ThemedText>
                    </Pressable>
                </View>

                <View style={styles.fieldGroup}>
                    <ThemedText type="smallBold">Country</ThemedText>
                    <View style={styles.countryActions}>
                        <Pressable accessibilityRole="button" accessibilityLabel={`Country: ${country?.name ?? 'Any country'}`}
                            onPress={() => setCountryPickerOpen(true)}
                            style={[styles.countryField, {backgroundColor: colors.backgroundElement}]}>
                            <Globe2 color={colors.tabText} size={20} />
                            <ThemedText style={styles.flex}>{country?.name ?? 'Any country'}</ThemedText>
                            <ChevronDown color={colors.textSecondary} size={18} />
                        </Pressable>
                        <Pressable accessibilityRole="button" accessibilityLabel="Choose a country on the map"
                            onPress={() => setCountryMapOpen(true)}
                            style={[styles.mapButton, {backgroundColor: colors.tabSurface}]}>
                            <Map color={colors.tabText} size={20} />
                            <ThemedText type="smallBold" style={{color: colors.tabTextSelected}}>Choose on map</ThemedText>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.fieldGroup}>
                    <ThemedText type="smallBold">Trip duration</ThemedText>
                    <View style={styles.chips}>
                        {DURATIONS.map(option => (
                            <FilterChip key={option} selected={duration === option && !start && !end} onPress={() => {
                                setDuration(option);
                                setStart(null);
                                setEnd(null);
                                setDateField(null);
                            }}>{option}</FilterChip>
                        ))}
                        {days !== null && <FilterChip selected onPress={() => setDateField('start')}>{days} {days === 1 ? 'day' : 'days'}</FilterChip>}
                    </View>
                </View>

                <View style={styles.fieldGroup}>
                    <View style={styles.sectionHeading}>
                        <ThemedText type="smallBold">Travel dates</ThemedText>
                        {(start || end) && (
                            <Pressable accessibilityRole="button" accessibilityLabel="Clear travel dates" style={styles.reset}
                                onPress={() => {setStart(null); setEnd(null); setDateField(null);}}>
                                <ThemedText type="small" themeColor="textSecondary">Clear dates</ThemedText>
                            </Pressable>
                        )}
                    </View>
                    <ThemedText type="small" themeColor="textSecondary">Choose a duration above or set exact dates below.</ThemedText>
                    <View style={styles.dateFields}>
                        {(['start', 'end'] as const).map(field => (
                            <Pressable key={field} accessibilityRole="button" disabled={field === 'end' && !start}
                                accessibilityState={{expanded: dateField === field, disabled: field === 'end' && !start}}
                                accessibilityLabel={`${field === 'start' ? 'Departure' : 'Return'}: ${formatDate(field === 'start' ? start : end)}`}
                                onPress={() => setDateField(dateField === field ? null : field)} style={[
                                    styles.dateField,
                                    {backgroundColor: dateField === field ? colors.tabSurface : colors.backgroundElement},
                                    field === 'end' && !start && styles.disabled,
                                ]}>
                                <CalendarDays color={colors.tabText} size={18} />
                                <View style={styles.flex}>
                                    <ThemedText type="small" themeColor="textSecondary">{field === 'start' ? 'From' : 'To'}</ThemedText>
                                    <ThemedText type="smallBold">{formatDate(field === 'start' ? start : end)}</ThemedText>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                    {dateField && (
                        <View style={styles.fieldGroup}>
                            <ThemedText type="smallBold">{dateField === 'start' ? 'Choose your departure date' : 'Choose your return date'}</ThemedText>
                            <TravelCalendar key={dateField} minimum={dateField === 'end' && start ? start : today}
                                selected={dateField === 'start' ? start : end} start={start} end={end} onSelect={selectDate} />
                        </View>
                    )}
                </View>
            </View>

            <View style={[styles.summary, {backgroundColor: colors.tabSurface}]} accessibilityLiveRegion="polite">
                <MapPin color={colors.tabText} size={20} />
                <View style={styles.flex}>
                    <ThemedText type="smallBold" style={{color: colors.tabTextSelected}}>{country?.name ?? 'Anywhere in the world'}</ThemedText>
                    <ThemedText type="small" style={{color: colors.tabText}}>
                        {start && end ? `${formatDate(start)} – ${formatDate(end)} · ${days} ${days === 1 ? 'day' : 'days'}`
                            : start ? `From ${formatDate(start)} · Choose a return date`
                                : duration === DURATIONS[0] ? 'Flexible dates and duration' : `${duration} · Flexible dates`}
                    </ThemedText>
                </View>
            </View>
            <View style={styles.sectionHeading}>
                <ThemedText type="smallBold">Destinations</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">{destinations.length} found</ThemedText>
            </View>
        </View>
    );

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={[styles.screen, {backgroundColor: colors.background}]}>
            <FlatList data={destinations} keyExtractor={item => item.code} ListHeaderComponent={header}
                keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
                contentContainerStyle={styles.content} ListEmptyComponent={
                    <View style={styles.empty}>
                        <ThemedText type="smallBold">No matching destinations</ThemedText>
                        <ThemedText themeColor="textSecondary">Try another name or reset your filters.</ThemedText>
                    </View>
                }
                renderItem={({item}) => (
                    <Pressable accessibilityRole="button" accessibilityLabel={`Choose ${item.name}`}
                        accessibilityState={{selected: countryCode === item.code}} onPress={() => setCountryCode(item.code)}
                        style={({pressed}) => [styles.destination, {borderColor: colors.backgroundSelected}, pressed && styles.pressed]}>
                        <View style={[styles.destinationIcon, {backgroundColor: colors.tabSurface}]}>
                            <Globe2 color={colors.tabText} size={22} />
                        </View>
                        <ThemedText style={styles.flex}>{item.name}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">{item.code}</ThemedText>
                    </Pressable>
                )} />
            {countryPickerOpen && <CountryPicker selected={countryCode} onSelect={setCountryCode} onClose={() => setCountryPickerOpen(false)} />}
            {countryMapOpen && <CountryMapPicker selected={countryCode} onSelect={setCountryCode} onClose={() => setCountryMapOpen(false)} />}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1},
    content: {width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.three, gap: 10, paddingBottom: Spacing.four},
    header: {gap: Spacing.four, marginBottom: 4},
    searchBar: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 16, paddingRight: 4, borderRadius: 18},
    searchInput: {flex: 1, minWidth: 0, minHeight: 56, fontSize: 16, paddingVertical: 12},
    iconButton: {minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center'},
    intro: {gap: 8},
    filters: {borderWidth: 1, borderRadius: 24, padding: 16, gap: 20},
    sectionHeading: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap'},
    inline: {flexDirection: 'row', alignItems: 'center', gap: 8},
    reset: {flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44},
    fieldGroup: {gap: 10},
    countryActions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
    countryField: {flexGrow: 1, flexBasis: 180, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 52, borderRadius: 14},
    mapButton: {flexGrow: 1, minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14},
    flex: {flex: 1, minWidth: 0},
    chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
    chip: {minHeight: 44, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, justifyContent: 'center'},
    dateFields: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
    dateField: {flex: 1, minWidth: 120, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14},
    summary: {flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18},
    destination: {flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1, borderRadius: 18},
    destinationIcon: {width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
    empty: {paddingVertical: 32, gap: 8, alignItems: 'center'},
    pressed: {opacity: 0.7},
    disabled: {opacity: 0.4},
});
