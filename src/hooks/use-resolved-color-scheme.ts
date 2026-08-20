import { useAppData } from '@/hooks/use-app-data';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useResolvedColorScheme(): 'light' | 'dark' {
  const { themePreference } = useAppData();
  const deviceScheme = useColorScheme();

  if (themePreference !== 'system') return themePreference;
  return deviceScheme === 'dark' ? 'dark' : 'light';
}
