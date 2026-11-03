import {ChevronLeft, ChevronRight} from 'lucide-react-native';
import {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {useAppTheme} from '@/shared/theme/provider';
import {ThemedText} from '@/shared/ui/themed-text';
import {calendarDays, formatDate, startOfDay} from '../date-utils';

type Props = {
    minimum: Date;
    selected: Date | null;
    start: Date | null;
    end: Date | null;
    onSelect: (date: Date) => void;
};

export function TravelCalendar({minimum, selected, start, end, onSelect}: Props) {
    const {colors} = useAppTheme();
    const [month, setMonth] = useState(() => new Date((selected ?? minimum).getFullYear(), (selected ?? minimum).getMonth(), 1));
    const previousMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
    const canGoBack = new Date(month.getFullYear(), month.getMonth(), 0) >= startOfDay(minimum);

    return (
        <View style={[styles.calendar, {borderColor: colors.backgroundSelected}]}>
            <View style={styles.heading}>
                <Pressable accessibilityRole="button" accessibilityLabel="Previous month" disabled={!canGoBack}
                    onPress={() => setMonth(previousMonth)} style={[styles.arrow, !canGoBack && styles.disabled]}>
                    <ChevronLeft color={colors.text} size={20} />
                </Pressable>
                <ThemedText type="smallBold">
                    {month.toLocaleDateString('en-GB', {month: 'long', year: 'numeric'})}
                </ThemedText>
                <Pressable accessibilityRole="button" accessibilityLabel="Next month" style={styles.arrow}
                    onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
                    <ChevronRight color={colors.text} size={20} />
                </Pressable>
            </View>
            <View style={styles.grid}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <View key={day} style={styles.cell}>
                        <ThemedText type="small" themeColor="textSecondary">{day}</ThemedText>
                    </View>
                ))}
                {calendarDays(month).map((date, index) => {
                    if (!date) return <View key={`empty-${index}`} style={styles.cell} />;
                    const disabled = date < startOfDay(minimum);
                    const isSelected = date.getTime() === selected?.getTime();
                    const inRange = start && end && date >= start && date <= end;
                    return (
                        <View key={date.getDate()} style={styles.cell}>
                            <Pressable accessibilityRole="button" accessibilityLabel={formatDate(date)}
                                accessibilityState={{selected: isSelected, disabled}} disabled={disabled}
                                onPress={() => onSelect(date)} style={[
                                    styles.day,
                                    inRange && {backgroundColor: colors.tabSurface},
                                    isSelected && {backgroundColor: colors.tabSurfaceSelected},
                                    disabled && styles.disabled,
                                ]}>
                                <ThemedText type="small" style={isSelected ? {color: colors.tabTextSelected} : undefined}>
                                    {date.getDate()}
                                </ThemedText>
                            </Pressable>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    calendar: {borderWidth: 1, borderRadius: 16, padding: 4, gap: 8},
    heading: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    arrow: {minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center'},
    grid: {flexDirection: 'row', flexWrap: 'wrap'},
    cell: {width: '14.285714%', alignItems: 'center', justifyContent: 'center', minHeight: 44},
    day: {width: '100%', minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
    disabled: {opacity: 0.3},
});
