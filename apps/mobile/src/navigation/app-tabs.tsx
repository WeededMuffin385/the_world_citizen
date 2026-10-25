import { Tabs } from 'expo-router';
import { BottomTabBar, type BottomTabBarProps } from 'expo-router/tabs';
import { Easing, Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useAppTheme } from '@/shared/theme/provider';
import { ThemedText } from '@/shared/ui/themed-text';
import { useTheme } from '@/shared/theme/use-theme';

function AppTabBar(props: BottomTabBarProps) {
  const { colors, scheme, toggleTheme } = useAppTheme();

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.background }]}>
      <View style={styles.fill}>
        <BottomTabBar {...props} insets={{ ...props.insets, right: 0 }} />
      </View>
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel="Dark theme"
        accessibilityState={{ checked: scheme === 'dark' }}
        onPress={toggleTheme}
        style={({ pressed }) => [
          styles.themeToggle,
          {
            minHeight: 49 + props.insets.bottom,
            paddingRight: 16 + props.insets.right,
            paddingBottom: props.insets.bottom,
            borderTopColor: colors.backgroundElement,
            opacity: pressed ? 0.6 : 1,
          },
        ]}>
        <ThemedText style={styles.themeIcon}>
          {scheme === 'dark' ? '☾' : '☀'}
        </ThemedText>
        <ThemedText style={styles.themeLabel}>
          {scheme === 'dark' ? 'Dark' : 'Light'}
        </ThemedText>
      </Pressable>
    </View>
  );
}

export default function AppTabs() {
  const colors = useTheme();
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Tabs
        tabBar={(props) => <AppTabBar {...props} />}
        detachInactiveScreens={false}
        screenOptions={{
          headerShown: false,
          animation: 'shift',
          // The built-in shift also fades and only moves scenes by 50px.
          // Keep both scenes opaque so the incoming page replaces the outgoing one.
          sceneStyleInterpolator: ({ current }) => ({
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
          sceneStyle: { backgroundColor: colors.background },
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarActiveBackgroundColor: colors.backgroundElement,
          tabBarStyle: { backgroundColor: colors.background },
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require('@/assets/images/tabIcons/home.png')}
                style={{ width: size, height: size, tintColor: color }}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require('@/assets/images/tabIcons/explore.png')}
                style={{ width: size, height: size, tintColor: color }}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: { flex: 1, overflow: 'hidden' },
  tabBar: { flexDirection: 'row' },
  themeToggle: {
    minWidth: 88,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
  },
  themeIcon: { fontSize: 24, lineHeight: 28 },
  themeLabel: { fontSize: 12, lineHeight: 16 },
});
