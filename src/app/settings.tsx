import Constants from 'expo-constants';
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
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

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
        <View style={styles.heroSection}>
          <ThemedText style={styles.heroEmoji}>⚙️</ThemedText>
          <ThemedText type="title" style={styles.title}>
            Ayarlar
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Uygulama tercihleri
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
            GÖRÜNÜM
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.card}>
            {THEME_OPTIONS.map((option, index) => {
              const isSelected = option.value === themePreference;
              const isLast = index === THEME_OPTIONS.length - 1;
              return (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => pressed && styles.pressed}
                  onPress={() => setThemePreference(option.value)}>
                  <View style={[styles.row, !isLast && styles.rowDivider]}>
                    <View style={styles.rowLeft}>
                      <ThemedText style={styles.rowEmoji}>{option.emoji}</ThemedText>
                      <ThemedText>{option.label}</ThemedText>
                    </View>
                    {isSelected && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                  </View>
                </Pressable>
              );
            })}
          </ThemedView>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionTitle}>
            HAKKINDA
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.aboutRow}>
              <View style={styles.aboutIcon}>
                <ThemedText style={styles.aboutEmoji}>🩰</ThemedText>
              </View>
              <View>
                <ThemedText style={styles.aboutName}>DansYo</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Sürüm {appVersion}
                </ThemedText>
              </View>
            </View>
          </ThemedView>
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
  heroSection: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.six,
  },
  heroEmoji: {
    fontSize: 40,
  },
  title: {
    textAlign: 'center',
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.one,
  },
  card: {
    borderRadius: Spacing.four,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowEmoji: {
    fontSize: 16,
  },
  checkmark: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
    fontSize: 16,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  aboutIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(60,135,247,0.16)',
  },
  aboutEmoji: {
    fontSize: 20,
  },
  aboutName: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.6,
  },
});
