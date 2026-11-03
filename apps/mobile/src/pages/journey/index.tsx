import {StyleSheet} from 'react-native';

import {ThemedText} from '@/shared/ui/themed-text';
import {ThemedView} from '@/shared/ui/themed-view';

export default function JourneyScreen() {
    return (
        <ThemedView style={styles.container}>
            <ThemedText type="subtitle">Journey</ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
