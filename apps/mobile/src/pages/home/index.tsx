import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {ThemeBackground} from './components/theme-background';
import {TitleCloud} from './components/title-cloud';
import {ThemedText} from '@/shared/ui/themed-text';
import {ThemedView} from '@/shared/ui/themed-view';
import {BottomTabInset, MaxContentWidth, Spacing} from '@/shared/theme/tokens';

export default function HomeScreen() {
    return (
        <ThemedView style={styles.container}>
            <ThemeBackground/>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.heroSection}>
                    <TitleCloud>
                        <ThemedText type="title" style={styles.title}>
                            Welcome to Local&nbsp;Lands
                        </ThemedText>
                    </TitleCloud>
                </View>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: Spacing.four,
        alignItems: 'center',
        gap: Spacing.three,
        paddingBottom: BottomTabInset + Spacing.three,
        maxWidth: MaxContentWidth,
    },
    heroSection: {
        alignSelf: 'stretch',
        alignItems: 'center',
        paddingTop: Spacing.four,
        gap: Spacing.four,
    },
    title: {
        textAlign: 'center',
        color: '#243D10',
    },
    code: {
        textTransform: 'uppercase',
    },
    stepContainer: {
        gap: Spacing.three,
        alignSelf: 'stretch',
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.four,
        borderRadius: Spacing.four,
    },
});
