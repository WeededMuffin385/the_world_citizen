import {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAppTheme} from '@/shared/theme/provider';
import {MaxContentWidth, Spacing} from '@/shared/theme/tokens';
import {ThemedText} from '@/shared/ui/themed-text';
import {PlanPicker} from './components/plan-picker';
import {PLANS, type PlanId} from './plans';

export default function AccountScreen() {
    const {colors} = useAppTheme();
    const [selectedPlan, setSelectedPlan] = useState<PlanId>('free');
    const [planPickerOpen, setPlanPickerOpen] = useState(false);
    const selected = PLANS.find(plan => plan.id === selectedPlan)!;

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={[styles.screen, {backgroundColor: colors.background}]}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.planRow, {backgroundColor: colors.backgroundElement}]}>
                    <View style={styles.planInfo} accessibilityLiveRegion="polite">
                        <ThemedText type="small" themeColor="textSecondary">Current plan</ThemedText>
                        <ThemedText type="smallBold">
                            {selected.name}{selected.price > 0 ? ` · ${selected.price} / month` : ''}
                        </ThemedText>
                    </View>
                    <Pressable accessibilityRole="button" accessibilityLabel="Choose a subscription plan"
                        onPress={() => setPlanPickerOpen(true)} style={({pressed}) => [
                            styles.chooseButton,
                            {backgroundColor: colors.tabSurfaceSelected},
                            pressed && styles.pressed,
                        ]}>
                        <ThemedText type="smallBold" style={{color: colors.tabTextSelected}}>Choose plan</ThemedText>
                    </Pressable>
                </View>
            </ScrollView>
            {planPickerOpen && (
                <PlanPicker selectedPlan={selectedPlan} onSelect={setSelectedPlan} onClose={() => setPlanPickerOpen(false)} />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {flex: 1},
    content: {width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.three},
    planRow: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: 16, borderRadius: 18},
    planInfo: {flex: 1, minWidth: 100, gap: 4},
    chooseButton: {minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
    pressed: {opacity: 0.75},
});
