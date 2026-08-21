import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccentColor } from '@/components/team-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import {
  formatTurkishMonth,
  getCurrentMonthISO,
  getPaymentStatus,
  parseTurkishMonth,
  setPayment,
} from '@/data/mock-payments';
import { getTeamAttendanceSummary, getTeamDancerCount } from '@/data/mock-teams';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';
import { shareText } from '@/utils/share';

const PRIMARY_COLOR = '#3c87f7';

const SUCCESS_COLOR = '#27ae60';
const DANGER_COLOR = '#e05252';

export default function PaymentsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const {
    dancers,
    paymentRecords,
    setPaymentRecords,
    teams,
    assignments,
    currentSeason,
    attendanceRecords,
  } = useAppData();

  const [monthInput, setMonthInput] = useState(formatTurkishMonth(getCurrentMonthISO()));
  const [isReportVisible, setReportVisible] = useState(false);

  const parsedMonth = parseTurkishMonth(monthInput);

  const rows = dancers.map((dancer) => ({
    dancer,
    paid: parsedMonth ? getPaymentStatus(paymentRecords, dancer.id, parsedMonth) : undefined,
  }));
  const paidCount = rows.filter((row) => row.paid === true).length;
  const unpaidCount = rows.filter((row) => row.paid === false).length;

  const overallAttendanceTotal = attendanceRecords.length;
  const overallAbsentTotal = attendanceRecords.filter((record) => !record.present).length;
  const overallAbsenceRate =
    overallAttendanceTotal > 0 ? overallAbsentTotal / overallAttendanceTotal : null;
  const collectionRate = rows.length > 0 ? paidCount / rows.length : null;

  function handleMark(dancerId: string, paid: boolean) {
    if (!parsedMonth) return;
    setPaymentRecords((prev) => setPayment(prev, dancerId, parsedMonth, paid));
  }

  function handleShareReport() {
    const lines = [
      `DansYo - Sezon Özeti - ${currentSeason}`,
      '',
      `👥 ${teams.length} ekip · ${dancers.length} dansçı`,
      overallAbsenceRate !== null
        ? `📊 Genel devamsızlık oranı: %${Math.round(overallAbsenceRate * 100)}`
        : '📊 Genel devamsızlık oranı: veri yok',
      parsedMonth
        ? `💰 ${formatTurkishMonth(parsedMonth)} tahsilat oranı: %${Math.round((collectionRate ?? 0) * 100)} (${paidCount}/${rows.length})`
        : '💰 Tahsilat oranı: geçerli bir ay seçilmedi',
      '',
      ...teams.map((team) => {
        const summary = getTeamAttendanceSummary(attendanceRecords, team.id);
        const dancerCount = getTeamDancerCount(assignments, team.id, currentSeason);
        return `- ${team.name}: ${dancerCount} dansçı, %${
          summary.total > 0 ? Math.round(summary.absenceRate * 100) : 0
        } devamsızlık`;
      }),
    ];
    shareText(lines.join('\n'));
  }

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
    <>
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <ThemedText type="subtitle">Aidat</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {dancers.length} dansçı
            </ThemedText>
          </View>
          <Pressable
            style={({ pressed }) => pressed && styles.pressed}
            onPress={() => setReportVisible(true)}>
            <View style={styles.reportButton}>
              <ThemedText style={styles.reportButtonText}>📊 Sezon Özeti</ThemedText>
            </View>
          </Pressable>
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            📅 Ay (aa.yyyy)
          </ThemedText>
          <TextInput
            value={monthInput}
            onChangeText={setMonthInput}
            placeholder="örn. 08.2026"
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
          {monthInput.trim().length > 0 && !parsedMonth && (
            <ThemedText type="small" style={styles.errorText}>
              Geçerli bir ay gir (aa.yyyy)
            </ThemedText>
          )}
        </View>

        {parsedMonth && (
          <ThemedText type="small" themeColor="textSecondary">
            ✅ {paidCount} ödedi · ❌ {unpaidCount} ödemedi ·{' '}
            {rows.length - paidCount - unpaidCount} işaretlenmedi
          </ThemedText>
        )}

        <View style={styles.list}>
          {!parsedMonth ? (
            <ThemedText type="small" themeColor="textSecondary">
              Aidat işaretlemek için geçerli bir ay gir.
            </ThemedText>
          ) : rows.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              Henüz kayıtlı dansçı yok.
            </ThemedText>
          ) : (
            rows.map(({ dancer, paid }) => (
              <ThemedView key={dancer.id} type="backgroundElement" style={styles.dancerCard}>
                <View style={styles.dancerInfo}>
                  <ThemedText style={styles.dancerName}>
                    {dancer.firstName} {dancer.lastName}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {dancer.monthlyFee} ₺
                  </ThemedText>
                </View>
                <View style={styles.markButtons}>
                  <Pressable onPress={() => handleMark(dancer.id, true)}>
                    <View
                      style={[styles.markButton, paid === true && { backgroundColor: SUCCESS_COLOR }]}>
                      <ThemedText
                        type="small"
                        style={paid === true ? styles.markButtonSelectedText : styles.successText}>
                        Ödendi
                      </ThemedText>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => handleMark(dancer.id, false)}>
                    <View
                      style={[styles.markButton, paid === false && { backgroundColor: DANGER_COLOR }]}>
                      <ThemedText
                        type="small"
                        style={paid === false ? styles.markButtonSelectedText : styles.errorText}>
                        Ödenmedi
                      </ThemedText>
                    </View>
                  </Pressable>
                </View>
              </ThemedView>
            ))
          )}
        </View>
      </View>
    </ScrollView>

    <Modal
      visible={isReportVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setReportVisible(false)}>
      <ThemedView style={styles.modalOverlay}>
        <ThemedView type="backgroundElement" style={styles.modalCard}>
          <View style={styles.formHeader}>
            <View style={[styles.formIcon, { backgroundColor: PRIMARY_COLOR + '26' }]}>
              <ThemedText style={styles.formIconGlyph}>📊</ThemedText>
            </View>
            <View style={styles.formHeaderText}>
              <ThemedText type="subtitle">Sezon Özeti</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {currentSeason} sezonu
              </ThemedText>
            </View>
            <Pressable
              hitSlop={8}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              onPress={() => setReportVisible(false)}>
              <ThemedText style={styles.closeGlyph}>✕</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.reportScroll}>
            <ThemedText type="small" themeColor="textSecondary">
              👥 {teams.length} ekip · {dancers.length} dansçı
            </ThemedText>

            <View style={styles.reportMetricRow}>
              <ThemedView type="backgroundElement" style={styles.reportMetricCard}>
                <ThemedText type="small" themeColor="textSecondary">
                  Genel Devamsızlık
                </ThemedText>
                <ThemedText type="subtitle">
                  {overallAbsenceRate !== null ? `%${Math.round(overallAbsenceRate * 100)}` : '—'}
                </ThemedText>
              </ThemedView>
              <ThemedView type="backgroundElement" style={styles.reportMetricCard}>
                <ThemedText type="small" themeColor="textSecondary">
                  {parsedMonth ? `${formatTurkishMonth(parsedMonth)} Tahsilat` : 'Tahsilat'}
                </ThemedText>
                <ThemedText type="subtitle">
                  {parsedMonth && collectionRate !== null
                    ? `%${Math.round(collectionRate * 100)}`
                    : '—'}
                </ThemedText>
              </ThemedView>
            </View>

            <ThemedText type="smallBold" style={styles.reportSectionTitle}>
              Ekip Bazlı Devamsızlık
            </ThemedText>
            {teams.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                Henüz kayıtlı ekip yok.
              </ThemedText>
            ) : (
              teams.map((team) => {
                const summary = getTeamAttendanceSummary(attendanceRecords, team.id);
                const accent = getAccentColor(team.id);
                const dancerCount = getTeamDancerCount(assignments, team.id, currentSeason);
                return (
                  <View key={team.id} style={styles.reportTeamRow}>
                    <View style={[styles.reportTeamDot, { backgroundColor: accent }]} />
                    <ThemedText style={styles.reportTeamName}>{team.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {dancerCount} dansçı
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {summary.total > 0 ? `%${Math.round(summary.absenceRate * 100)}` : '—'}
                    </ThemedText>
                  </View>
                );
              })
            )}
          </ScrollView>

          <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={handleShareReport}>
            <View style={[styles.primaryButton, styles.primaryButtonFull]}>
              <ThemedText style={styles.primaryButtonText}>📤 Raporu Paylaş</ThemedText>
            </View>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </Modal>
    </>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.six,
    gap: Spacing.two,
  },
  header: {
    gap: Spacing.half,
  },
  reportButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  reportButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  errorText: {
    color: DANGER_COLOR,
  },
  successText: {
    color: SUCCESS_COLOR,
  },
  list: {
    gap: Spacing.three,
  },
  dancerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  dancerInfo: {
    gap: Spacing.half,
  },
  dancerName: {
    fontWeight: '700',
  },
  markButtons: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  markButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(128,128,128,0.14)',
  },
  markButtonSelectedText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: Spacing.four,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  formIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formIconGlyph: {
    fontSize: 18,
  },
  formHeaderText: {
    flex: 1,
    gap: Spacing.half,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128,128,128,0.14)',
  },
  closeGlyph: {
    fontSize: 13,
  },
  reportScroll: {
    gap: Spacing.three,
  },
  reportMetricRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  reportMetricCard: {
    flex: 1,
    gap: Spacing.half,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  reportSectionTitle: {
    marginTop: Spacing.four,
    marginBottom: Spacing.one,
  },
  reportTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  reportTeamDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reportTeamName: {
    flex: 1,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  primaryButtonFull: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
