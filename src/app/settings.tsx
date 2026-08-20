import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { ThemePreference, useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';

const PRIMARY_COLOR = '#3c87f7';

const THEME_OPTIONS: { value: ThemePreference; label: string; emoji: string }[] = [
  { value: 'light', label: 'Açık', emoji: '☀️' },
  { value: 'dark', label: 'Koyu', emoji: '🌙' },
  { value: 'system', label: 'Sistem', emoji: '⚙️' },
];

export default function SettingsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();
  const { themePreference, setThemePreference } = useAppData();

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Ayarlar</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" themeColor="textSecondary">
            🎨 Görünüm
          </ThemedText>
          <View style={styles.optionRow}>
            {THEME_OPTIONS.map((option) => {
              const isSelected = option.value === themePreference;
              return (
                <Pressable key={option.value} onPress={() => setThemePreference(option.value)}>
                  <ThemedView
                    type={isSelected ? undefined : 'backgroundElement'}
                    style={[styles.optionChip, isSelected && { backgroundColor: PRIMARY_COLOR }]}>
                    <ThemedText style={styles.optionEmoji}>{option.emoji}</ThemedText>
                    <ThemedText style={isSelected ? styles.optionLabelSelected : undefined}>
                      {option.label}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.half,
    paddingTop: Spacing.six,
  },
  section: {
    gap: Spacing.two,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  optionEmoji: {
    fontSize: 14,
  },
  optionLabelSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
