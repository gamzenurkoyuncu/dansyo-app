import { Href, Link } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';

type QuickLinkCardProps = {
  href: Href;
  emoji: string;
  title: string;
  subtitle: string;
};

function QuickLinkCard({ href, emoji, title, subtitle }: QuickLinkCardProps) {
  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.quickLinkPressable, pressed && styles.pressed]}>
        <ThemedView type="backgroundElement" style={styles.quickLink}>
          <View style={styles.quickLinkIcon}>
            <ThemedText style={styles.quickLinkEmoji}>{emoji}</ThemedText>
          </View>
          <View style={styles.quickLinkText}>
            <ThemedText type="default" style={styles.quickLinkTitle}>
              {title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {subtitle}
            </ThemedText>
          </View>
          <ThemedText themeColor="textSecondary">›</ThemedText>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();
  const { teams, dancers, currentSeason } = useAppData();

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
          <ThemedText style={styles.heroEmoji}>🩰</ThemedText>
          <ThemedText type="title" style={styles.title}>
            DansYo
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Dans okulu yönetimi
          </ThemedText>
        </View>

        <ThemedView type="backgroundElement" style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <ThemedText type="subtitle" style={styles.summaryValue}>
              {teams.length}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Ekip
            </ThemedText>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <ThemedText type="subtitle" style={styles.summaryValue}>
              {dancers.length}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Dansçı
            </ThemedText>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <ThemedText type="subtitle" style={styles.summaryValue}>
              {currentSeason}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Aktif sezon
            </ThemedText>
          </View>
        </ThemedView>

        <View style={styles.linkList}>
          <QuickLinkCard
            href="/teams"
            emoji="💃"
            title="Ekip Listesi"
            subtitle="Ekipleri görüntüle, düzenle"
          />

          <QuickLinkCard
            href="/dancers"
            emoji="🧑‍🤝‍🧑"
            title="Dansçılar"
            subtitle="Dansçıları görüntüle, ekle"
          />

          <QuickLinkCard href="/attendance" emoji="✅" title="Yoklama" subtitle="Yoklama al" />

          <QuickLinkCard href="/payments" emoji="💰" title="Aidat" subtitle="Ödemeleri takip et" />

          <QuickLinkCard href="/settings" emoji="⚙️" title="Ayarlar" subtitle="Görünüm tercihleri" />
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
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  summaryItem: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  summaryValue: {
    fontSize: 20,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: 'rgba(128,128,128,0.3)',
  },
  linkList: {
    gap: Spacing.three,
  },
  quickLinkPressable: {
    alignSelf: 'stretch',
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
  },
  quickLinkIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(60,135,247,0.16)',
  },
  quickLinkEmoji: {
    fontSize: 20,
  },
  quickLinkText: {
    flex: 1,
    gap: Spacing.half,
  },
  quickLinkTitle: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
