import {usePathname} from 'expo-router';
import {TabList, Tabs, TabTrigger} from 'expo-router/ui';
import {Moon, Sun} from 'lucide-react-native';
import {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useAppTheme} from '@/shared/theme/provider';
import {ThemedText} from '@/shared/ui/themed-text';
import {TabButtonBackground} from './components/tab-button-background';
import {TabPager} from './components/tab-pager';
import {TAB_ROUTES} from './tab-routes';

const TAB_BAR_PADDING = 8;

export default function App_tabs() {
    const {colors, scheme, toggleTheme} = useAppTheme();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const [visibleIndex, setVisibleIndex] = useState(() => Math.max(0, TAB_ROUTES.findIndex(tab => tab.href === pathname)));

    return (
        <Tabs style={[styles.container, {backgroundColor: colors.background}]}>
            <TabPager onVisiblePageChange={setVisibleIndex}/>
            <TabList style={[styles.tabBar, {paddingBottom: TAB_BAR_PADDING + insets.bottom}]}>
                <TabTrigger name="index" href="/" style={styles.hidden}/>
                {TAB_ROUTES.map(({name, href, title, icon: Icon}, index) => {
                    const selected = visibleIndex === index;
                    const color = selected ? colors.tabTextSelected : colors.tabText;
                    return (
                        <TabTrigger key={name} name={name} href={href} asChild>
                            <Pressable accessibilityRole="tab" accessibilityLabel={title}
                                       accessibilityState={{selected}} style={styles.tabButton}>
                                <TabButtonBackground selected={selected}/>
                                <View style={styles.icon}><Icon color={color} size={25}/></View>
                                <ThemedText style={[styles.buttonLabel, {color}]}>{title}</ThemedText>
                            </Pressable>
                        </TabTrigger>
                    );
                })}
                <Pressable accessibilityRole="switch" accessibilityLabel="Dark theme"
                           accessibilityState={{checked: scheme === 'dark'}} onPress={toggleTheme}
                           style={({pressed}) => [styles.tabButton,
                               {backgroundColor: colors.themeToggleSurface}, pressed && styles.pressed]}>
                    <View style={styles.icon}>
                        {scheme === 'dark' ? <Moon color={colors.themeToggleText} size={25}/>
                            : <Sun color={colors.themeToggleText} size={25}/>}
                    </View>
                    <ThemedText style={[styles.buttonLabel, {color: colors.themeToggleText}]}>
                        {scheme === 'dark' ? 'Dark' : 'Light'}
                    </ThemedText>
                </Pressable>
            </TabList>
        </Tabs>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, overflow: 'hidden'},
    hidden: {display: 'none'},
    tabBar: {flexShrink: 0, padding: TAB_BAR_PADDING, gap: TAB_BAR_PADDING},
    tabButton: {
        flex: 1, minWidth: 0, borderRadius: 14,
        flexDirection: 'column', gap: 4,
        overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 6, paddingHorizontal: 4,
    },
    icon: {width: 28, height: 28, flexShrink: 0, alignItems: 'center', justifyContent: 'center'},
    buttonLabel: {flexShrink: 0, maxWidth: '100%', fontSize: 10, lineHeight: 14, fontWeight: '500', textAlign: 'center'},
    pressed: {opacity: 0.6},
});
