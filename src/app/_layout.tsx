import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AppDataProvider } from '@/hooks/use-app-data';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <AppDataProvider>
      <ThemedNavigation />
    </AppDataProvider>
  );
}

function ThemedNavigation() {
  const colorScheme = useResolvedColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
