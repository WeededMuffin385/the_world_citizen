import {Check, Search, X} from 'lucide-react-native';
import {useState} from 'react';
import {FlatList, Modal, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useAppTheme} from '@/shared/theme/provider';
import {ThemedText} from '@/shared/ui/themed-text';
import {COUNTRIES} from '../data/countries';

type Props = {selected: string | null; onSelect: (code: string | null) => void; onClose: () => void};

export function CountryPicker({selected, onSelect, onClose}: Props) {
    const {colors} = useAppTheme();
    const [query, setQuery] = useState('');
    const countries = COUNTRIES.filter(country => country.name.toLowerCase().includes(query.trim().toLowerCase()));

    function choose(code: string | null) {
        onSelect(code);
        onClose();
    }

    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose}>
            <SafeAreaView style={styles.overlay}>
                <View accessibilityViewIsModal style={[styles.sheet, {backgroundColor: colors.background}]}>
                    <View style={styles.heading}>
                        <ThemedText type="smallBold">Choose a country</ThemedText>
                        <Pressable accessibilityRole="button" accessibilityLabel="Close country picker" onPress={onClose} style={styles.close}>
                            <X color={colors.text} size={22} />
                        </Pressable>
                    </View>
                    <View style={[styles.search, {backgroundColor: colors.backgroundElement}]}>
                        <Search color={colors.textSecondary} size={20} />
                        <TextInput accessibilityLabel="Search countries" placeholder="Search countries" value={query}
                            onChangeText={setQuery} placeholderTextColor={colors.textSecondary} autoCorrect={false}
                            style={[styles.input, {color: colors.text}]} underlineColorAndroid="transparent" />
                    </View>
                    <FlatList data={countries} keyExtractor={item => item.code} keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag" style={styles.list}
                        ListHeaderComponent={
                            <Pressable accessibilityRole="button" accessibilityState={{selected: selected === null}}
                                onPress={() => choose(null)} style={styles.row}>
                                <ThemedText>Any country</ThemedText>
                                {selected === null && <Check color={colors.tabTextSelected} size={20} />}
                            </Pressable>
                        }
                        ListEmptyComponent={<ThemedText style={styles.empty}>No countries found.</ThemedText>}
                        renderItem={({item}) => (
                            <Pressable accessibilityRole="button" accessibilityState={{selected: selected === item.code}}
                                onPress={() => choose(item.code)} style={[
                                    styles.row, selected === item.code && {backgroundColor: colors.tabSurface},
                                ]}>
                                <ThemedText style={styles.countryName}>{item.name}</ThemedText>
                                {selected === item.code && <Check color={colors.tabTextSelected} size={20} />}
                            </Pressable>
                        )} />
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.45)', padding: 16, alignItems: 'center', justifyContent: 'center'},
    sheet: {width: '100%', maxWidth: 560, height: '85%', borderRadius: 24, padding: 16, gap: 12},
    heading: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    close: {minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center'},
    search: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 14, gap: 8},
    input: {flex: 1, minWidth: 0, minHeight: 48, fontSize: 16},
    list: {flex: 1},
    row: {minHeight: 48, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderRadius: 12},
    countryName: {flex: 1},
    empty: {padding: 16},
});
