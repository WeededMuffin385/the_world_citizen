import {Tabs} from 'expo-router';
import {BottomTabBar} from 'expo-router/tabs';
import {Compass, House, Moon, Sun, UserRound} from 'lucide-react-native';
import {Easing, Pressable, StyleSheet, useWindowDimensions, View} from 'react-native';

import {useAppTheme} from '@/shared/theme/provider';
import {ThemedText} from '@/shared/ui/themed-text';

const TAB_BAR_HEIGHT = 60;
const TAB_BAR_BORDER_WIDTH = 1;

export default function App_tabs() {
    const {colors, scheme, toggleTheme} = useAppTheme();
    const {width} = useWindowDimensions();

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <Tabs
                tabBar={(props) => {
                    return (
                        <View style={[styles.safeArea, {backgroundColor: colors.background, paddingBottom: props.insets.bottom}]}>
                            <View style={[styles.tabBar, {backgroundColor: colors.background, borderTopColor: colors.backgroundSelected}]}>
                                <View style={styles.fill}>
                                    <BottomTabBar {...props} insets={{...props.insets, top: 0, bottom: 0, right: 0}}/>
                                </View>
                                <Pressable
                                    accessibilityRole="switch"
                                    accessibilityLabel="Dark theme"
                                    accessibilityState={{checked: scheme === 'dark'}}
                                    onPress={toggleTheme}
                                    style={({pressed}) => [
                                        styles.themeToggle,
                                        {backgroundColor: colors.background, paddingRight: 16 + props.insets.right},
                                        pressed && styles.pressed,
                                    ]}>
                                    {scheme === 'dark' ? <Moon color={colors.text} /> : <Sun color={colors.text} />}
                                    <ThemedText style={styles.themeLabel}>
                                        {scheme === 'dark' ? 'Dark' : 'Light'}
                                    </ThemedText>
                                </Pressable>
                            </View>
                        </View>
                    );
                }}
                detachInactiveScreens={false}
                screenOptions={{
                    headerShown: false,
                    animation: 'shift',
                    // The built-in shift also fades and only moves scenes by 50px.
                    // Keep both scenes opaque so the incoming page replaces the outgoing one.
                    sceneStyleInterpolator: ({current}) => ({
                        sceneStyle: {
                            opacity: 1,
                            transform: [
                                {
                                    translateX: current.progress.interpolate({
                                        inputRange: [-1, 0, 1],
                                        outputRange: [-width, 0, width],
                                        extrapolate: 'clamp',
                                    }),
                                },
                            ],
                        },
                    }),
                    transitionSpec: {
                        animation: 'timing',
                        config: {
                            duration: 350,
                            easing: Easing.inOut(Easing.cubic),
                        },
                    },
                    sceneStyle: {backgroundColor: colors.background},
                    tabBarActiveTintColor: colors.text,
                    tabBarInactiveTintColor: colors.textSecondary,
                    tabBarActiveBackgroundColor: colors.backgroundElement,
                    tabBarInactiveBackgroundColor: colors.background,
                    tabBarItemStyle: [styles.tabButton, {borderRightColor: colors.backgroundSelected}],
                    tabBarStyle: [styles.navigationBar, {backgroundColor: colors.background}],
                }}>
                <Tabs.Screen
                    name="home"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({color, size}) => (
                            <House color={color} size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="account"
                    options={{
                        title: 'Account',
                        tabBarIcon: ({color, size}) => (
                            <UserRound color={color} size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="explore"
                    options={{
                        title: 'Explore',
                        tabBarIcon: ({color, size}) => (
                            <Compass color={color} size={size} />
                        ),
                    }}
                />
            </Tabs>
        </View>
    );
}

const styles = StyleSheet.create({
    fill: {flex: 1},
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    safeArea: {flexShrink: 0},
    pressed: {opacity: 0.6},
    tabBar: {
        flexDirection: 'row',
        height: TAB_BAR_HEIGHT,
        borderTopWidth: TAB_BAR_BORDER_WIDTH,
    },
    navigationBar: {
        height: TAB_BAR_HEIGHT - TAB_BAR_BORDER_WIDTH,
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
    },
    tabButton: {
        borderRightWidth: TAB_BAR_BORDER_WIDTH,
    },
    themeToggle: {
        minWidth: 88,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    themeLabel: {fontSize: 12, lineHeight: 16},
});
