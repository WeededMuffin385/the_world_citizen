import { createContext, useContext, useState, type PropsWithChildren } from 'react';

import { Colors } from '@/shared/theme/tokens';
import { useColorScheme } from '@/shared/theme/use-color-scheme';

type ThemeScheme = 'light' | 'dark';

const AppThemeContext = createContext<{
  scheme: ThemeScheme;
  colors: (typeof Colors)[ThemeScheme];
  toggleTheme: () => void;
} | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [selectedScheme, setSelectedScheme] = useState<ThemeScheme | null>(null);
  const scheme = selectedScheme ?? (systemScheme === 'dark' ? 'dark' : 'light');

  return (
    <AppThemeContext.Provider
      value={{
        scheme,
        colors: Colors[scheme],
        toggleTheme: () => setSelectedScheme((previousScheme) => {
          const currentScheme = previousScheme ?? (systemScheme === 'dark' ? 'dark' : 'light');
          return currentScheme === 'dark' ? 'light' : 'dark';
        }),
      }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const theme = useContext(AppThemeContext);
  if (!theme) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return theme;
}
