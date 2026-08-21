import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AppDataProvider } from '@/hooks/use-app-data';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppDataProvider>
        <ThemedNavigation />
      </AppDataProvider>
    </GestureHandlerRootView>
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
