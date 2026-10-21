import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AppThemeProvider, useAppTheme } from '@/components/app-theme-provider';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <AppThemeProvider>
      <ThemedLayout />
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
      <AppTabs />
    </ThemeProvider>
  );
}
