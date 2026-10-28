import * as Device from 'expo-device';
import {Platform, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {HintRow} from './components/hint-row';
import {ThemeBackground} from './components/theme-background';
import {ThemedText} from '@/shared/ui/themed-text';
import {ThemedView} from '@/shared/ui/themed-view';
import {BottomTabInset, MaxContentWidth, Spacing} from '@/shared/theme/tokens';

function getDevMenuHint() {
    if (Platform.OS === 'web') {
        return <ThemedText type="small">use browser devtools</ThemedText>;
    }
    if (Device.isDevice) {
        return (
            <ThemedText type="small">
                shake device or press <ThemedText type="code">m</ThemedText> in terminal
            </ThemedText>
        );
    }
    const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
    return (
        <ThemedText type="small">
            press <ThemedText type="code">{shortcut}</ThemedText>
        </ThemedText>
    );
}

export default function HomeScreen() {
    return (
        <ThemedView style={styles.container}>
            <ThemeBackground/>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.heroSection}>
                    <ThemedText type="title" style={styles.title}>
                        Welcome to&nbsp;Expo
                    </ThemedText>
                </View>

                <ThemedText type="code" style={styles.code}>
                    get started
                </ThemedText>

                <ThemedView type="backgroundElement" style={styles.stepContainer}>
                    <HintRow
                        title="Try editing"
                        hint={<ThemedText type="code">src/pages/home/index.tsx</ThemedText>}
                    />
                    <HintRow title="Dev tools" hint={getDevMenuHint()}/>
                    <HintRow
                        title="Fresh start"
                        hint={<ThemedText type="code">pnpm reset-project</ThemedText>}
                    />
                </ThemedView>

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
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingHorizontal: Spacing.four,
        gap: Spacing.four,
    },
    title: {
        textAlign: 'center',
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
