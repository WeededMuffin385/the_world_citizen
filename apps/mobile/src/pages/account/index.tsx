import {ThemedView} from "@/shared/ui/themed-view";
import {StyleSheet} from "react-native";

export default function AccountScreen() {
    <ThemedView style={styles.container}>
        Hello world
    </ThemedView>
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
    },
})
