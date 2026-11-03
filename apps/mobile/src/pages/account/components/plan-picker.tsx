import {Check, Sparkles, X} from 'lucide-react-native';
import {Modal, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAppTheme} from '@/shared/theme/provider';
import {MaxContentWidth, Spacing} from '@/shared/theme/tokens';
import {ThemedText} from '@/shared/ui/themed-text';
import {PLANS, type PlanId} from '../plans';

type Props = {
    selectedPlan: PlanId;
    onSelect: (plan: PlanId) => void;
    onClose: () => void;
};

export function PlanPicker({selectedPlan, onSelect, onClose}: Props) {
    const {colors} = useAppTheme();

    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose}>
            <SafeAreaView style={styles.overlay}>
                <View accessibilityViewIsModal style={[styles.sheet, {backgroundColor: colors.background}]}>
                    <View style={styles.modalHeading}>
                        <ThemedText type="smallBold">Choose a plan</ThemedText>
                        <Pressable accessibilityRole="button" accessibilityLabel="Close plan selection" onPress={onClose} style={styles.close}>
                            <X color={colors.text} size={22} />
                        </Pressable>
                    </View>
                    <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.heading}>
                    <ThemedText type="smallBold" themeColor="textSecondary">ACCOUNT / MEMBERSHIP</ThemedText>
                    <ThemedText type="subtitle" style={styles.centerText}>A plan for every journey</ThemedText>
                    <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                        Start exploring for free, or give your travel plans a little more possibility.
                    </ThemedText>
                </View>

                <View style={styles.plans}>
                    {PLANS.map(plan => {
                        const isSelected = selectedPlan === plan.id;
                        return (
                            <View key={plan.id} style={[
                                styles.card,
                                {
                                    backgroundColor: isSelected ? colors.tabSurface : colors.background,
                                    borderColor: isSelected ? colors.tabText : colors.backgroundSelected,
                                },
                            ]}>
                                <View style={styles.cardHeading}>
                                    <ThemedText style={styles.planName}>{plan.name}</ThemedText>
                                    {plan.id === 'plus' && <Sparkles color={colors.tabText} size={22} />}
                                </View>
                                <View style={styles.priceRow}>
                                    <ThemedText style={styles.price}>{plan.price}</ThemedText>
                                    <ThemedText themeColor="textSecondary" style={styles.pricePeriod}>/ month</ThemedText>
                                </View>
                                <ThemedText type="small" themeColor="textSecondary">{plan.description}</ThemedText>

                                <Pressable accessibilityRole="button"
                                    accessibilityLabel={isSelected ? `${plan.name} plan selected` : `Select ${plan.name} plan`}
                                    accessibilityState={{selected: isSelected, disabled: isSelected}}
                                    disabled={isSelected} onPress={() => {onSelect(plan.id); onClose();}}
                                    style={({pressed}) => [
                                        styles.chooseButton,
                                        {backgroundColor: isSelected ? colors.tabSurfaceSelected : colors.themeToggleSurface},
                                        pressed && styles.pressed,
                                    ]}>
                                    {isSelected && <Check color={colors.tabTextSelected} size={18} />}
                                    <ThemedText type="smallBold" style={{color: isSelected ? colors.tabTextSelected : colors.themeToggleText}}>
                                        {isSelected ? 'Selected plan' : `Choose ${plan.name}`}
                                    </ThemedText>
                                </Pressable>

                                <View style={[styles.benefits, {borderTopColor: colors.backgroundSelected}]}>
                                    <ThemedText type="smallBold">{plan.featureHeading}</ThemedText>
                                    {plan.features.map(feature => (
                                        <View key={feature} style={styles.feature}>
                                            <Check color={colors.tabText} size={17} style={styles.featureIcon} />
                                            <ThemedText type="small" style={styles.featureText}>{feature}</ThemedText>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        );
                    })}
                </View>

                <View style={styles.footnote}>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
                        Preview only. Selecting a plan does not start a subscription or charge you.
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
                        Benefits are examples. Final plan details and billing currency will be confirmed before checkout.
                    </ThemedText>
                </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.45)', padding: 16, justifyContent: 'center', alignItems: 'center'},
    sheet: {width: '100%', maxWidth: MaxContentWidth + 32, maxHeight: '90%', borderRadius: 24, overflow: 'hidden', flexShrink: 1},
    modalHeading: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8},
    close: {minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center'},
    content: {width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.five},
    heading: {alignItems: 'center', gap: 12, paddingTop: Spacing.three},
    subtitle: {textAlign: 'center', maxWidth: 480},
    plans: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: 12},
    card: {flexGrow: 1, flexBasis: 220, minWidth: 0, padding: 20, borderWidth: 1, borderRadius: 24, gap: 16},
    cardHeading: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8},
    planName: {fontSize: 24, lineHeight: 30, fontWeight: '600'},
    priceRow: {flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 8},
    price: {fontSize: 44, lineHeight: 52, fontWeight: '600'},
    pricePeriod: {fontSize: 14},
    chooseButton: {minHeight: 48, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8},
    benefits: {borderTopWidth: 1, paddingTop: 16, gap: 14},
    feature: {flexDirection: 'row', alignItems: 'flex-start', gap: 8},
    featureIcon: {marginTop: 2, flexShrink: 0},
    featureText: {flex: 1},
    footnote: {gap: 8, alignItems: 'center'},
    centerText: {textAlign: 'center'},
    pressed: {opacity: 0.75},
});
