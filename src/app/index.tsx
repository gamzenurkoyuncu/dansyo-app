import { Href, Link } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { Dancer, getDaysUntilNextBirthday, getTodayISO } from '@/data/mock-dancers';
import { getCurrentMonthISO, getUnpaidCount } from '@/data/mock-payments';
import { getAttendanceForTeamDate, getTeamsPracticingToday } from '@/data/mock-teams';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';

const DANGER_COLOR = '#e05252';
const SUCCESS_COLOR = '#27ae60';
const UPCOMING_BIRTHDAY_WINDOW_DAYS = 7;

function formatDaysUntil(days: number): string {
  if (days === 0) return 'Bugün! 🎉';
  if (days === 1) return 'Yarın';
  return `${days} gün sonra`;
}

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
  const { teams, dancers, currentSeason, paymentRecords, practiceSlots, attendanceRecords } =
    useAppData();
  const unpaidCount = getUnpaidCount(paymentRecords, getCurrentMonthISO());
  const teamsToday = getTeamsPracticingToday(practiceSlots, teams, currentSeason);

  const upcomingBirthdays: { dancer: Dancer; days: number }[] = [];
  for (const dancer of dancers) {
    const days = getDaysUntilNextBirthday(dancer.birthDate);
    if (days !== null && days <= UPCOMING_BIRTHDAY_WINDOW_DAYS) {
      upcomingBirthdays.push({ dancer, days });
    }
  }
  upcomingBirthdays.sort((a, b) => a.days - b.days);

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

        {teamsToday.length > 0 && (
          <ThemedView type="backgroundElement" style={styles.dailyCard}>
            <ThemedText type="small" themeColor="textSecondary">
              📅 Bugünün çalışmaları
            </ThemedText>
            {teamsToday.map((team) => {
              const taken = getAttendanceForTeamDate(attendanceRecords, team.id, getTodayISO()).length > 0;
              return (
                <View key={team.id} style={styles.dailyRow}>
                  <ThemedText type="small">{team.name}</ThemedText>
                  <ThemedText type="small" style={taken ? styles.dailyTaken : styles.dailyPending}>
                    {taken ? '✅ Alındı' : '⏳ Henüz alınmadı'}
                  </ThemedText>
                </View>
              );
            })}
          </ThemedView>
        )}

        {upcomingBirthdays.length > 0 && (
          <ThemedView type="backgroundElement" style={styles.dailyCard}>
            <ThemedText type="small" themeColor="textSecondary">
              🎂 Yaklaşan doğum günleri
            </ThemedText>
            {upcomingBirthdays.map(({ dancer, days }) => (
              <View key={dancer.id} style={styles.dailyRow}>
                <ThemedText type="small">
                  {dancer.firstName} {dancer.lastName}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatDaysUntil(days)}
                </ThemedText>
              </View>
            ))}
          </ThemedView>
        )}

        {unpaidCount > 0 && (
          <Link href="/payments" asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <View style={styles.alertCard}>
                <ThemedText style={styles.alertEmoji}>⚠️</ThemedText>
                <ThemedText type="small" style={styles.alertText}>
                  Bu ay {unpaidCount} dansçının ödemesi yapılmadı
                </ThemedText>
              </View>
            </Pressable>
          </Link>
        )}

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

          <QuickLinkCard
            href="/costumes"
            emoji="👗"
            title="Kostüm Listesi"
            subtitle="Boy, kilo, beden bilgisi"
          />

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
  dailyCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.four,
  },
  dailyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyTaken: {
    color: SUCCESS_COLOR,
    fontWeight: '700',
  },
  dailyPending: {
    color: DANGER_COLOR,
    fontWeight: '700',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    backgroundColor: 'rgba(224,82,82,0.14)',
  },
  alertEmoji: {
    fontSize: 18,
  },
  alertText: {
    flex: 1,
    color: DANGER_COLOR,
    fontWeight: '700',
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
