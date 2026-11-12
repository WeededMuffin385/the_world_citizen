import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/navigation/components/splash-overlay';
import {ActiveTripProvider} from '@/pages/journey/active-trip';
import {LikedTripsProvider} from '@/pages/explore/state/liked-trips';
import { AppThemeProvider, useAppTheme } from '@/shared/theme/provider';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <AppThemeProvider>
      <LikedTripsProvider><ActiveTripProvider><ThemedLayout /></ActiveTripProvider></LikedTripsProvider>
    </AppThemeProvider>
  );
}

function ThemedLayout() {
  const { scheme, colors } = useAppTheme();
  const navigationTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <ThemeProvider
      value={{
        ...navigationTheme,
        colors: { ...navigationTheme.colors, background: colors.background, card: colors.background },
      }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <AnimatedSplashOverlay />
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="trip/[id]" />
      </Stack>
    </ThemeProvider>
  );
}
