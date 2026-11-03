import {Tabs} from 'expo-router';
import {BottomTabBar} from 'expo-router/tabs';
import {Compass, House, Map, Moon, Settings, Sun, UserRound} from 'lucide-react-native';
import {Easing, Pressable, StyleSheet, useWindowDimensions, View} from 'react-native';

import {useAppTheme} from '@/shared/theme/provider';
import {ThemedText} from '@/shared/ui/themed-text';
import {AnimatedTabButton} from './components/animated-tab-button';

export default function App_tabs() {
    const {colors, scheme, toggleTheme} = useAppTheme();
    const {width} = useWindowDimensions();

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <Tabs
                tabBar={(props) => {
                    return (
                        <View style={[styles.safeArea, {
                            backgroundColor: colors.background,
                            paddingBottom: props.insets.bottom,
                            paddingLeft: props.insets.left,
                            paddingRight: props.insets.right,
                        }]}>
                            <View style={[styles.tabBar, {backgroundColor: colors.background}]}>
                                <View style={styles.fill}>
                                    <BottomTabBar {...props} insets={{top: 0, bottom: 0, left: 0, right: 0}}/>
                                </View>
                                <View style={styles.themeSlot}>
                                    <Pressable
                                        accessibilityRole="switch"
                                        accessibilityLabel="Dark theme"
                                        accessibilityState={{checked: scheme === 'dark'}}
                                        onPress={toggleTheme}
                                        style={({pressed}) => [
                                            styles.themeToggle,
                                            styles.tabButton,
                                            {backgroundColor: colors.themeToggleSurface},
                                            pressed && styles.pressed,
                                        ]}>
                                        <View style={styles.themeIcon}>
                                            {scheme === 'dark'
                                                ? <Moon color={colors.themeToggleText} size={25} />
                                                : <Sun color={colors.themeToggleText} size={25} />}
                                        </View>
                                        <ThemedText style={[styles.buttonLabel, {color: colors.themeToggleText}]}>
                                            {scheme === 'dark' ? 'Dark' : 'Light'}
                                        </ThemedText>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    );
                }}
                detachInactiveScreens={false}
                screenOptions={{
                    tabBarButton: (props) => <AnimatedTabButton {...props} />,
                    tabBarActiveBackgroundColor: 'transparent',
                    tabBarInactiveBackgroundColor: 'transparent',

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
                    tabBarItemStyle: styles.tabButton,
                    tabBarLabelPosition: 'below-icon',
                    tabBarLabelStyle: styles.buttonLabel,
                    tabBarStyle: [styles.navigationBar, {
                        backgroundColor: colors.background,
                    }],

                    tabBarActiveTintColor: colors.tabTextSelected,
                    tabBarInactiveTintColor: colors.tabText,
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
                    name="explore"
                    options={{
                        title: 'Explore',
                        tabBarIcon: ({color, size}) => (
                            <Compass color={color} size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="journey"
                    options={{
                        title: 'Journey',
                        tabBarIcon: ({color, size}) => (
                            <Map color={color} size={size} />
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
                    name="settings"
                    options={{
                        title: 'Settings',
                        tabBarIcon: ({color, size}) => (
                            <Settings color={color} size={size} />
                        ),
                    }}
                />
            </Tabs>
        </View>
    );
}

const styles = StyleSheet.create({
    // The five navigation tabs and the theme control each receive one equal share.
    fill: {flex: 5, minWidth: 0},
    themeSlot: {flex: 1, minWidth: 0},
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    safeArea: {flexShrink: 0},
    pressed: {opacity: 0.6},
    tabBar: {
        flexDirection: 'row',
        padding: 8,
    },
    navigationBar: {
        height: 'auto',
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
    },
    tabButton: {
        borderWidth: 0,
        borderRadius: 14,
        marginHorizontal: 2,
        overflow: 'hidden',
    },
    themeToggle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    themeIcon: {height: 28, alignItems: 'center', justifyContent: 'center'},
    buttonLabel: {fontSize: 10, lineHeight: 14, fontWeight: '500', textAlign: 'center'},
});
