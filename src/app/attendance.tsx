import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DatePickerField } from '@/components/date-picker-field';
import { getAccentColor } from '@/components/team-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { addDaysToISO, formatTurkishDate, getTodayISO } from '@/data/mock-dancers';
import {
  getAssignedDancerIds,
  getAttendanceDatesForTeam,
  getAttendanceSummary,
  getConsecutiveAbsences,
  setAttendance,
} from '@/data/mock-teams';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';


const QUICK_DATE_OFFSETS: { label: string; offset: number }[] = [
  { label: 'Bugün', offset: 0 },
  { label: 'Dün', offset: -1 },
  { label: 'Geçen hafta bu gün', offset: -7 },
];

export default function AttendanceScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const { teams, dancers, assignments, currentSeason, attendanceRecords, setAttendanceRecords } =
    useAppData();

  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teams[0]?.id ?? null);
  const [expandedDancerId, setExpandedDancerId] = useState<string | null>(null);

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;

  const teamDancers = selectedTeam
    ? getAssignedDancerIds(assignments, selectedTeam.id, currentSeason)
        .map((dancerId) => dancers.find((dancer) => dancer.id === dancerId))
        .filter((dancer) => dancer !== undefined)
    : [];

  const unsortedRows = teamDancers.map((dancer) => {
    const record = selectedTeam
      ? attendanceRecords.find(
          (item) =>
            item.teamId === selectedTeam.id && item.dancerId === dancer.id && item.date === selectedDate,
        )
      : undefined;
    return { dancer, present: record?.present, note: record?.note };
  });
  const rows = [
    ...unsortedRows.filter((row) => row.present === undefined),
    ...unsortedRows.filter((row) => row.present !== undefined),
  ];
  const presentCount = rows.filter((row) => row.present === true).length;
  const absentCount = rows.filter((row) => row.present === false).length;

  const pastDates = selectedTeam ? getAttendanceDatesForTeam(attendanceRecords, selectedTeam.id) : [];

  function handleMark(dancerId: string, present: boolean, note?: string) {
    if (!selectedTeam) return;
    setAttendanceRecords((prev) =>
      setAttendance(prev, selectedTeam.id, dancerId, selectedDate, present, note),
    );
  }

  function handleMarkAllPresent() {
    if (!selectedTeam) return;
    setAttendanceRecords((prev) =>
      teamDancers.reduce(
        (acc, dancer) => setAttendance(acc, selectedTeam.id, dancer.id, selectedDate, true),
        prev,
      ),
    );
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
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Yoklama</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {currentSeason} sezonu
          </ThemedText>
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            📅 Tarih
          </ThemedText>
          <DatePickerField value={selectedDate} onChange={setSelectedDate} />
          <View style={styles.quickDateRow}>
            {QUICK_DATE_OFFSETS.map(({ label, offset }) => {
              const optionDate = addDaysToISO(getTodayISO(), offset);
              const isSelected = selectedDate === optionDate;
              return (
                <Pressable key={label} onPress={() => setSelectedDate(optionDate)}>
                  <View
                    style={[styles.quickDateChip, isSelected && { backgroundColor: theme.primary }]}>
                    <ThemedText
                      type="small"
                      style={isSelected && styles.quickDateChipSelectedText}>
                      {label}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>
          {pastDates.length > 0 && (
            <View style={styles.pastDatesBlock}>
              <ThemedText type="small" themeColor="textSecondary">
                🕘 Bu ekibin geçmiş yoklama tarihleri
              </ThemedText>
              <View style={styles.quickDateRow}>
                {pastDates.slice(0, 8).map((isoDate) => {
                  const isSelected = selectedDate === isoDate;
                  return (
                    <Pressable key={isoDate} onPress={() => setSelectedDate(isoDate)}>
                      <View
                        style={[styles.quickDateChip, isSelected && { backgroundColor: theme.primary }]}>
                        <ThemedText
                          type="small"
                          style={isSelected && styles.quickDateChipSelectedText}>
                          {formatTurkishDate(isoDate)}
                        </ThemedText>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            🎽 Ekip
          </ThemedText>
          <View style={styles.teamChipRow}>
            {teams.map((team) => {
              const accent = getAccentColor(team.id);
              const isSelected = team.id === selectedTeamId;
              return (
                <Pressable key={team.id} onPress={() => setSelectedTeamId(team.id)}>
                  <View
                    style={[
                      styles.teamChip,
                      { backgroundColor: accent + '26' },
                      isSelected && { backgroundColor: accent },
                    ]}>
                    <ThemedText
                      type="small"
                      style={[
                        styles.teamChipText,
                        { color: isSelected ? '#ffffff' : accent },
                      ]}>
                      {team.name}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {selectedTeam && rows.length > 0 && (
          <View style={styles.summaryRow}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.summaryText}>
              ✅ {presentCount} var · ❌ {absentCount} yok · {rows.length - presentCount - absentCount}{' '}
              işaretlenmedi
            </ThemedText>
            <Pressable onPress={handleMarkAllPresent}>
              <View style={[styles.markAllButton, { backgroundColor: theme.primary }]}>
                <ThemedText type="small" style={styles.markAllButtonText}>
                  Tümünü Var İşaretle
                </ThemedText>
              </View>
            </Pressable>
          </View>
        )}

        <View style={styles.list}>
          {!selectedTeam ? (
            <ThemedText type="small" themeColor="textSecondary">
              Önce bir ekip seç.
            </ThemedText>
          ) : rows.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              Bu ekibe {currentSeason} sezonu için atanmış dansçı yok.
            </ThemedText>
          ) : (
            rows.map(({ dancer, present, note }) => {
              const isExpanded = expandedDancerId === dancer.id;
              const summary = getAttendanceSummary(attendanceRecords, dancer.id);
              const consecutiveAbsences = getConsecutiveAbsences(attendanceRecords, dancer.id);
              const attendanceRate =
                summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : null;
              return (
                <ThemedView key={dancer.id} type="backgroundElement" style={styles.dancerCard}>
                  <Pressable
                    style={styles.dancerRow}
                    onPress={() => setExpandedDancerId(isExpanded ? null : dancer.id)}>
                    <ThemedText style={styles.dancerName}>
                      {dancer.firstName} {dancer.lastName}
                    </ThemedText>
                    <View style={styles.markButtons}>
                      <Pressable onPress={() => handleMark(dancer.id, true)}>
                        <View
                          style={[
                            styles.markButton,
                            present === true && { backgroundColor: theme.success },
                          ]}>
                          <ThemedText
                            type="small"
                            themeColor="success"
                            style={present === true && styles.markButtonSelectedText}>
                            Var
                          </ThemedText>
                        </View>
                      </Pressable>
                      <Pressable onPress={() => handleMark(dancer.id, false)}>
                        <View
                          style={[
                            styles.markButton,
                            present === false && { backgroundColor: theme.danger },
                          ]}>
                          <ThemedText
                            type="small"
                            themeColor="danger"
                            style={present === false && styles.markButtonSelectedText}>
                            Yok
                          </ThemedText>
                        </View>
                      </Pressable>
                    </View>
                  </Pressable>

                  {present === false && (
                    <TextInput
                      value={note ?? ''}
                      onChangeText={(text) => handleMark(dancer.id, false, text)}
                      placeholder="Not ekle (örn. hasta, izinli)"
                      placeholderTextColor={theme.textSecondary}
                      style={[styles.noteInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
                    />
                  )}

                  {isExpanded && (
                    <View style={styles.detailBlock}>
                      <ThemedText type="small" themeColor="textSecondary">
                        {summary.total === 0
                          ? 'Henüz yoklama kaydı yok.'
                          : `Toplam ${summary.total} yoklama · %${attendanceRate} katılım${
                              consecutiveAbsences > 0
                                ? ` · Üst üste ${consecutiveAbsences} devamsızlık`
                                : ''
                            }`}
                      </ThemedText>
                    </View>
                  )}
                </ThemedView>
              );
            })
          )}
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
  field: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.small,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  quickDateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  quickDateChip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
    backgroundColor: 'rgba(128,128,128,0.14)',
  },
  quickDateChipSelectedText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  teamChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  teamChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  teamChipText: {
    fontWeight: '700',
  },
  list: {
    gap: Spacing.three,
  },
  pastDatesBlock: {
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  summaryText: {
    flexShrink: 1,
  },
  markAllButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  markAllButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  dancerCard: {
    padding: Spacing.three,
    borderRadius: Radius.medium,
    gap: Spacing.two,
  },
  dancerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dancerName: {
    fontWeight: '700',
    flexShrink: 1,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: Radius.small,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    fontSize: 14,
  },
  detailBlock: {
    paddingTop: Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.24)',
  },
  markButtons: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  markButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.small,
    backgroundColor: 'rgba(128,128,128,0.14)',
  },
  markButtonSelectedText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
