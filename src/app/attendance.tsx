import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccentColor } from '@/components/team-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { addDaysToISO, formatTurkishDate, getTodayISO, parseTurkishDate } from '@/data/mock-dancers';
import { getAssignedDancerIds, getAttendanceStatus, setAttendance } from '@/data/mock-teams';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';

const PRIMARY_COLOR = '#3c87f7';
const SUCCESS_COLOR = '#27ae60';
const DANGER_COLOR = '#e05252';

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

  const [dateInput, setDateInput] = useState(formatTurkishDate(getTodayISO()));
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teams[0]?.id ?? null);

  const parsedDate = parseTurkishDate(dateInput);
  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;

  const teamDancers = selectedTeam
    ? getAssignedDancerIds(assignments, selectedTeam.id, currentSeason)
        .map((dancerId) => dancers.find((dancer) => dancer.id === dancerId))
        .filter((dancer) => dancer !== undefined)
    : [];

  const rows = teamDancers.map((dancer) => ({
    dancer,
    present:
      selectedTeam && parsedDate
        ? getAttendanceStatus(attendanceRecords, selectedTeam.id, dancer.id, parsedDate)
        : undefined,
  }));
  const presentCount = rows.filter((row) => row.present === true).length;
  const absentCount = rows.filter((row) => row.present === false).length;

  function handleMark(dancerId: string, present: boolean) {
    if (!selectedTeam || !parsedDate) return;
    setAttendanceRecords((prev) =>
      setAttendance(prev, selectedTeam.id, dancerId, parsedDate, present),
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
            📅 Tarih (gg.aa.yyyy)
          </ThemedText>
          <TextInput
            value={dateInput}
            onChangeText={setDateInput}
            placeholder="örn. 20.08.2026"
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
          <View style={styles.quickDateRow}>
            {QUICK_DATE_OFFSETS.map(({ label, offset }) => {
              const optionDate = addDaysToISO(getTodayISO(), offset);
              const isSelected = parsedDate === optionDate;
              return (
                <Pressable
                  key={label}
                  onPress={() => setDateInput(formatTurkishDate(optionDate))}>
                  <View style={[styles.quickDateChip, isSelected && styles.quickDateChipSelected]}>
                    <ThemedText
                      type="small"
                      style={isSelected ? styles.quickDateChipSelectedText : undefined}>
                      {label}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>
          {dateInput.trim().length > 0 && !parsedDate && (
            <ThemedText type="small" style={styles.errorText}>
              Geçerli bir tarih gir (gg.aa.yyyy)
            </ThemedText>
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

        {selectedTeam && parsedDate && (
          <ThemedText type="small" themeColor="textSecondary">
            ✅ {presentCount} var · ❌ {absentCount} yok · {rows.length - presentCount - absentCount}{' '}
            işaretlenmedi
          </ThemedText>
        )}

        <View style={styles.list}>
          {!selectedTeam ? (
            <ThemedText type="small" themeColor="textSecondary">
              Önce bir ekip seç.
            </ThemedText>
          ) : !parsedDate ? (
            <ThemedText type="small" themeColor="textSecondary">
              Yoklama almak için geçerli bir tarih gir.
            </ThemedText>
          ) : rows.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              Bu ekibe {currentSeason} sezonu için atanmış dansçı yok.
            </ThemedText>
          ) : (
            rows.map(({ dancer, present }) => (
              <ThemedView key={dancer.id} type="backgroundElement" style={styles.dancerCard}>
                <ThemedText style={styles.dancerName}>
                  {dancer.firstName} {dancer.lastName}
                </ThemedText>
                <View style={styles.markButtons}>
                  <Pressable onPress={() => handleMark(dancer.id, true)}>
                    <View
                      style={[
                        styles.markButton,
                        present === true && { backgroundColor: SUCCESS_COLOR },
                      ]}>
                      <ThemedText
                        type="small"
                        style={present === true ? styles.markButtonSelectedText : styles.successText}>
                        Var
                      </ThemedText>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => handleMark(dancer.id, false)}>
                    <View
                      style={[
                        styles.markButton,
                        present === false && { backgroundColor: DANGER_COLOR },
                      ]}>
                      <ThemedText
                        type="small"
                        style={present === false ? styles.markButtonSelectedText : styles.errorText}>
                        Yok
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
  quickDateChipSelected: {
    backgroundColor: PRIMARY_COLOR,
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
  dancerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  dancerName: {
    fontWeight: '700',
    flexShrink: 1,
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
});
