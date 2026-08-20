import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccentColor, TeamCard } from '@/components/team-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import {
  assignDancerToTeam,
  DAY_ABBREVIATIONS,
  DAYS_OF_WEEK,
  DayOfWeek,
  formatPracticeSlot,
  getAssignedDancerIds,
  getAvailableSeasons,
  getNextSeasonLabel,
  getPracticeSlotsForTeam,
  getRegionForSeason,
  getTeamDancerCount,
  getTeamForDancer,
  isValidTime,
  Team,
  unassignDancer,
} from '@/data/mock-teams';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';

const PRIMARY_COLOR = '#3c87f7';
const DANGER_COLOR = '#e05252';

export default function TeamsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const {
    teams,
    setTeams,
    seasonRegions,
    setSeasonRegions,
    dancers,
    assignments,
    setAssignments,
    seasons,
    setSeasons,
    currentSeason,
    setCurrentSeason,
    practiceSlots,
    setPracticeSlots,
  } = useAppData();
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);
  const [isSeasonPickerVisible, setSeasonPickerVisible] = useState(false);
  const [isNewSeasonFormVisible, setNewSeasonFormVisible] = useState(false);
  const [newSeasonInput, setNewSeasonInput] = useState('');

  const [isFormVisible, setFormVisible] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [regionInput, setRegionInput] = useState('');
  const [slotDrafts, setSlotDrafts] = useState<
    { day: DayOfWeek; startTime: string; endTime: string }[]
  >([]);

  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [assigningTeam, setAssigningTeam] = useState<Team | null>(null);
  const [historyTeam, setHistoryTeam] = useState<Team | null>(null);

  const availableSeasons = getAvailableSeasons(seasons, seasonRegions);
  const canCreateSeason =
    newSeasonInput.trim().length > 0 && !availableSeasons.includes(newSeasonInput.trim());
  const canSubmit = nameInput.trim().length > 0 && regionInput.trim().length > 0;
  const formAccent = editingTeamId ? getAccentColor(editingTeamId) : PRIMARY_COLOR;
  const assigningTeamAccent = assigningTeam ? getAccentColor(assigningTeam.id) : PRIMARY_COLOR;
  const historyTeamAccent = historyTeam ? getAccentColor(historyTeam.id) : PRIMARY_COLOR;
  const assignedDancerIds = assigningTeam
    ? getAssignedDancerIds(assignments, assigningTeam.id, selectedSeason)
    : [];

  function openNewSeasonForm() {
    setNewSeasonInput(getNextSeasonLabel(availableSeasons));
    setSeasonPickerVisible(false);
    setNewSeasonFormVisible(true);
  }

  function handleCancelNewSeason() {
    setNewSeasonFormVisible(false);
  }

  function handleCreateSeason() {
    if (!canCreateSeason) return;
    const season = newSeasonInput.trim();
    setSeasons((prev) => [...prev, season]);
    setCurrentSeason(season);
    setSelectedSeason(season);
    setNewSeasonFormVisible(false);
  }

  function toggleDancerAssignment(dancerId: string) {
    if (!assigningTeam) return;
    if (assignedDancerIds.includes(dancerId)) {
      setAssignments((prev) => unassignDancer(prev, dancerId, selectedSeason));
    } else {
      setAssignments((prev) =>
        assignDancerToTeam(prev, dancerId, assigningTeam.id, selectedSeason),
      );
    }
  }

  function openAddForm() {
    setEditingTeamId(null);
    setNameInput('');
    setRegionInput('');
    setSlotDrafts([]);
    setFormVisible(true);
  }

  function openEditForm(team: Team) {
    setEditingTeamId(team.id);
    setNameInput(team.name);
    setRegionInput(getRegionForSeason(seasonRegions, team.id, selectedSeason) ?? '');
    setSlotDrafts(
      getPracticeSlotsForTeam(practiceSlots, team.id, selectedSeason).map((slot) => ({
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    );
    setFormVisible(true);
  }

  function toggleSlotDay(day: DayOfWeek) {
    setSlotDrafts((prev) =>
      prev.some((slot) => slot.day === day)
        ? prev.filter((slot) => slot.day !== day)
        : [...prev, { day, startTime: '', endTime: '' }],
    );
  }

  function updateSlotDraftTime(day: DayOfWeek, field: 'startTime' | 'endTime', value: string) {
    setSlotDrafts((prev) =>
      prev.map((slot) => (slot.day === day ? { ...slot, [field]: value } : slot)),
    );
  }

  function handleSaveTeam() {
    if (!canSubmit) return;

    const teamId = editingTeamId ?? Date.now().toString();

    if (editingTeamId) {
      setTeams((prev) =>
        prev.map((team) => (team.id === editingTeamId ? { ...team, name: nameInput.trim() } : team)),
      );
      setSeasonRegions((prev) => {
        const hasSeasonRecord = prev.some(
          (region) => region.teamId === editingTeamId && region.season === selectedSeason,
        );
        if (hasSeasonRecord) {
          return prev.map((region) =>
            region.teamId === editingTeamId && region.season === selectedSeason
              ? { ...region, regionName: regionInput.trim() }
              : region,
          );
        }
        return [
          ...prev,
          { teamId: editingTeamId, season: selectedSeason, regionName: regionInput.trim() },
        ];
      });
    } else {
      const newTeam: Team = {
        id: teamId,
        name: nameInput.trim(),
      };
      setTeams((prev) => [...prev, newTeam]);
      setSeasonRegions((prev) => [
        ...prev,
        { teamId: newTeam.id, season: selectedSeason, regionName: regionInput.trim() },
      ]);
    }

    setPracticeSlots((prev) => {
      const withoutTeamSeason = prev.filter(
        (slot) => !(slot.teamId === teamId && slot.season === selectedSeason),
      );
      const newSlots = slotDrafts
        .filter((slot) => isValidTime(slot.startTime) && isValidTime(slot.endTime))
        .map((slot) => ({
          id: `${teamId}-${selectedSeason}-${slot.day}`,
          teamId,
          season: selectedSeason,
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }));
      return [...withoutTeamSeason, ...newSlots];
    });

    setFormVisible(false);
  }

  function handleCancelForm() {
    setFormVisible(false);
  }

  function handleConfirmDelete() {
    if (!deletingTeam) return;
    const teamId = deletingTeam.id;
    setTeams((prev) => prev.filter((team) => team.id !== teamId));
    setSeasonRegions((prev) => prev.filter((region) => region.teamId !== teamId));
    setAssignments((prev) => prev.filter((assignment) => assignment.teamId !== teamId));
    setPracticeSlots((prev) => prev.filter((slot) => slot.teamId !== teamId));
    setDeletingTeam(null);
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
          <View style={styles.header}>
            <View style={styles.headerText}>
              <ThemedText type="subtitle">Ekip Listesi</ThemedText>
              <Pressable
                style={({ pressed }) => pressed && styles.pressed}
                onPress={() => setSeasonPickerVisible(true)}>
                <View style={styles.seasonChip}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {teams.length} ekip · {selectedSeason} sezonu ⌄
                  </ThemedText>
                </View>
              </Pressable>
            </View>

            <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={openAddForm}>
              <View style={styles.addButton}>
                <ThemedText style={styles.addButtonText}>+ Ekip Ekle</ThemedText>
              </View>
            </Pressable>
          </View>

          <View style={styles.list}>
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                regionName={getRegionForSeason(seasonRegions, team.id, selectedSeason)}
                dancerCount={getTeamDancerCount(assignments, team.id, selectedSeason)}
                scheduleSummary={getPracticeSlotsForTeam(practiceSlots, team.id, selectedSeason)
                  .map(formatPracticeSlot)
                  .join(', ')}
                onEdit={() => openEditForm(team)}
                onDelete={() => setDeletingTeam(team)}
                onAssignDancers={() => setAssigningTeam(team)}
                onViewHistory={() => setHistoryTeam(team)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isSeasonPickerVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setSeasonPickerVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSeasonPickerVisible(false)}>
          <ThemedView type="backgroundElement" style={styles.seasonModalCard}>
            <ThemedText type="subtitle" style={styles.seasonModalTitle}>
              Sezon Seç
            </ThemedText>
            {availableSeasons.map((season) => (
              <Pressable
                key={season}
                style={({ pressed }) => pressed && styles.pressed}
                onPress={() => {
                  setSelectedSeason(season);
                  setSeasonPickerVisible(false);
                }}>
                <View
                  style={[
                    styles.seasonOption,
                    season === selectedSeason && styles.seasonOptionSelected,
                  ]}>
                  <ThemedText
                    style={season === selectedSeason ? styles.seasonOptionSelectedText : undefined}>
                    {season}
                    {season === currentSeason ? ' · aktif' : ''}
                  </ThemedText>
                  {season === selectedSeason && (
                    <ThemedText style={styles.seasonOptionSelectedText}>✓</ThemedText>
                  )}
                </View>
              </Pressable>
            ))}

            <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={openNewSeasonForm}>
              <View style={styles.seasonOption}>
                <ThemedText style={styles.newSeasonText}>+ Yeni Sezon Başlat</ThemedText>
              </View>
            </Pressable>
          </ThemedView>
        </Pressable>
      </Modal>

      <Modal
        visible={isNewSeasonFormVisible}
        animationType="slide"
        transparent
        onRequestClose={handleCancelNewSeason}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <View style={styles.formHeader}>
              <View style={[styles.formIcon, { backgroundColor: PRIMARY_COLOR + '26' }]}>
                <ThemedText style={styles.formIconGlyph}>🗓️</ThemedText>
              </View>
              <View style={styles.formHeaderText}>
                <ThemedText type="subtitle">Yeni Sezon Başlat</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Aktif sezon olarak ayarlanır
                </ThemedText>
              </View>
              <Pressable
                hitSlop={8}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                onPress={handleCancelNewSeason}>
                <ThemedText style={styles.closeGlyph}>✕</ThemedText>
              </Pressable>
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                🗓️ Sezon Adı
              </ThemedText>
              <TextInput
                value={newSeasonInput}
                onChangeText={setNewSeasonInput}
                placeholder="örn. 2027-2028"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
              {newSeasonInput.trim().length > 0 && !canCreateSeason && (
                <ThemedText type="small" style={styles.errorText}>
                  Bu sezon zaten var
                </ThemedText>
              )}
            </View>

            <ThemedText type="small" themeColor="textSecondary">
              Yeni sezonda hiçbir ekibe henüz yöre veya dansçı atanmamış olur — bunları ekip
              kartlarından tek tek ayarlayabilirsin.
            </ThemedText>

            <Pressable
              disabled={!canCreateSeason}
              style={({ pressed }) => pressed && styles.pressed}
              onPress={handleCreateSeason}>
              <View
                style={[
                  styles.primaryButton,
                  styles.primaryButtonFull,
                  !canCreateSeason && styles.disabledButton,
                ]}>
                <ThemedText style={styles.primaryButtonText}>Sezonu Başlat</ThemedText>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              onPress={handleCancelNewSeason}>
              <ThemedText themeColor="textSecondary">İptal</ThemedText>
            </Pressable>
          </ThemedView>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={isFormVisible}
        animationType="slide"
        transparent
        onRequestClose={handleCancelForm}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <View style={styles.formHeader}>
              <View style={[styles.formIcon, { backgroundColor: formAccent + '26' }]}>
                <ThemedText style={styles.formIconGlyph}>{editingTeamId ? '✏️' : '➕'}</ThemedText>
              </View>
              <View style={styles.formHeaderText}>
                <ThemedText type="subtitle">{editingTeamId ? 'Ekibi Düzenle' : 'Yeni Ekip'}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {editingTeamId ? 'Bilgileri güncelle' : 'Ekip bilgilerini gir'}
                </ThemedText>
              </View>
              <Pressable
                hitSlop={8}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                onPress={handleCancelForm}>
                <ThemedText style={styles.closeGlyph}>✕</ThemedText>
              </Pressable>
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                🏷️ Yaş Grubu / Ekip Adı
              </ThemedText>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="örn. 7-9 Yaş"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                📍 {selectedSeason} Sezonu Yöresi
              </ThemedText>
              <TextInput
                value={regionInput}
                onChangeText={setRegionInput}
                placeholder="örn. Zeybek"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                🗓️ Çalışma Günleri ({selectedSeason})
              </ThemedText>
              <View style={styles.dayChipRow}>
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = slotDrafts.some((slot) => slot.day === day);
                  return (
                    <Pressable
                      key={day}
                      style={({ pressed }) => pressed && styles.pressed}
                      onPress={() => toggleSlotDay(day)}>
                      <View style={[styles.dayChip, isSelected && styles.dayChipSelected]}>
                        <ThemedText
                          type="small"
                          style={isSelected ? styles.dayChipSelectedText : undefined}>
                          {DAY_ABBREVIATIONS[day]}
                        </ThemedText>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {slotDrafts.map((slot) => (
                <View key={slot.day} style={styles.slotTimeRow}>
                  <ThemedText type="small" style={styles.slotDayLabel}>
                    {slot.day}
                  </ThemedText>
                  <TextInput
                    value={slot.startTime}
                    onChangeText={(value) => updateSlotDraftTime(slot.day, 'startTime', value)}
                    placeholder="18:00"
                    placeholderTextColor={theme.textSecondary}
                    style={[
                      styles.input,
                      styles.slotTimeInput,
                      { color: theme.text, borderColor: theme.backgroundSelected },
                    ]}
                  />
                  <ThemedText themeColor="textSecondary">–</ThemedText>
                  <TextInput
                    value={slot.endTime}
                    onChangeText={(value) => updateSlotDraftTime(slot.day, 'endTime', value)}
                    placeholder="19:30"
                    placeholderTextColor={theme.textSecondary}
                    style={[
                      styles.input,
                      styles.slotTimeInput,
                      { color: theme.text, borderColor: theme.backgroundSelected },
                    ]}
                  />
                </View>
              ))}
              {slotDrafts.some(
                (slot) =>
                  (slot.startTime.length > 0 && !isValidTime(slot.startTime)) ||
                  (slot.endTime.length > 0 && !isValidTime(slot.endTime)),
              ) && (
                <ThemedText type="small" style={styles.errorText}>
                  Saatleri sa:dk (örn. 18:00) formatında gir
                </ThemedText>
              )}
            </View>

            <Pressable
              disabled={!canSubmit}
              style={({ pressed }) => pressed && styles.pressed}
              onPress={handleSaveTeam}>
              <View
                style={[
                  styles.primaryButton,
                  styles.primaryButtonFull,
                  { backgroundColor: formAccent },
                  !canSubmit && styles.disabledButton,
                ]}>
                <ThemedText style={styles.primaryButtonText}>
                  {editingTeamId ? 'Kaydet' : 'Ekip Ekle'}
                </ThemedText>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              onPress={handleCancelForm}>
              <ThemedText themeColor="textSecondary">İptal</ThemedText>
            </Pressable>
          </ThemedView>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={deletingTeam !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setDeletingTeam(null)}>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <ThemedText type="subtitle">Ekibi Sil</ThemedText>
            <ThemedText>
              &quot;{deletingTeam?.name}&quot; ekibini silmek istediğine emin misin? Bu işlem geri
              alınamaz.
            </ThemedText>
            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => pressed && styles.pressed}
                onPress={() => setDeletingTeam(null)}>
                <ThemedText themeColor="textSecondary">Vazgeç</ThemedText>
              </Pressable>
              <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={handleConfirmDelete}>
                <View style={styles.dangerButton}>
                  <ThemedText style={styles.primaryButtonText}>Sil</ThemedText>
                </View>
              </Pressable>
            </View>
          </ThemedView>
        </ThemedView>
      </Modal>

      <Modal
        visible={assigningTeam !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setAssigningTeam(null)}>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <View style={styles.formHeader}>
              <View style={[styles.formIcon, { backgroundColor: assigningTeamAccent + '26' }]}>
                <ThemedText style={styles.formIconGlyph}>🧑‍🤝‍🧑</ThemedText>
              </View>
              <View style={styles.formHeaderText}>
                <ThemedText type="subtitle">{assigningTeam?.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {selectedSeason} sezonu · {assignedDancerIds.length} dansçı atandı
                </ThemedText>
              </View>
              <Pressable
                hitSlop={8}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                onPress={() => setAssigningTeam(null)}>
                <ThemedText style={styles.closeGlyph}>✕</ThemedText>
              </Pressable>
            </View>

            <ScrollView style={styles.assignList}>
              {dancers.length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Henüz dansçı yok. Önce Dansçılar ekranından ekleyebilirsin.
                </ThemedText>
              ) : (
                dancers.map((dancer) => {
                  const isAssignedHere = assignedDancerIds.includes(dancer.id);
                  const otherTeam = !isAssignedHere
                    ? getTeamForDancer(assignments, teams, dancer.id, selectedSeason)
                    : undefined;

                  return (
                    <Pressable
                      key={dancer.id}
                      style={({ pressed }) => pressed && styles.pressed}
                      onPress={() => toggleDancerAssignment(dancer.id)}>
                      <View style={[styles.dancerRow, isAssignedHere && styles.dancerRowSelected]}>
                        <View style={styles.dancerRowText}>
                          <ThemedText>
                            {dancer.firstName} {dancer.lastName}
                          </ThemedText>
                          {otherTeam && (
                            <ThemedText type="small" themeColor="textSecondary">
                              Şu an: {otherTeam.name}
                            </ThemedText>
                          )}
                        </View>
                        {isAssignedHere && (
                          <ThemedText style={styles.seasonOptionSelectedText}>✓</ThemedText>
                        )}
                      </View>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            <Pressable
              style={({ pressed }) => pressed && styles.pressed}
              onPress={() => setAssigningTeam(null)}>
              <View
                style={[
                  styles.primaryButton,
                  styles.primaryButtonFull,
                  { backgroundColor: assigningTeamAccent },
                ]}>
                <ThemedText style={styles.primaryButtonText}>Tamam</ThemedText>
              </View>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </Modal>

      <Modal
        visible={historyTeam !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setHistoryTeam(null)}>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <View style={styles.formHeader}>
              <View style={[styles.formIcon, { backgroundColor: historyTeamAccent + '26' }]}>
                <ThemedText style={styles.formIconGlyph}>🕐</ThemedText>
              </View>
              <View style={styles.formHeaderText}>
                <ThemedText type="subtitle">{historyTeam?.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Sezon geçmişi
                </ThemedText>
              </View>
              <Pressable
                hitSlop={8}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                onPress={() => setHistoryTeam(null)}>
                <ThemedText style={styles.closeGlyph}>✕</ThemedText>
              </Pressable>
            </View>

            <ScrollView style={styles.assignList}>
              {historyTeam &&
                availableSeasons.map((season) => {
                  const region = getRegionForSeason(seasonRegions, historyTeam.id, season);
                  const dancerNames = getAssignedDancerIds(assignments, historyTeam.id, season)
                    .map((dancerId) => dancers.find((dancer) => dancer.id === dancerId))
                    .filter((dancer) => dancer !== undefined)
                    .map((dancer) => `${dancer.firstName} ${dancer.lastName}`);

                  return (
                    <View key={season} style={styles.historyRow}>
                      <View style={styles.historySeasonHeader}>
                        <ThemedText type="smallBold">{season}</ThemedText>
                        {season === selectedSeason && (
                          <ThemedText type="small" style={styles.seasonOptionSelectedText}>
                            görüntülenen sezon
                          </ThemedText>
                        )}
                      </View>
                      <View style={[styles.regionPill, { backgroundColor: historyTeamAccent + '26' }]}>
                        <ThemedText
                          type="small"
                          style={[styles.regionText, { color: historyTeamAccent }]}>
                          {region ?? 'Yöre atanmadı'}
                        </ThemedText>
                      </View>
                      <ThemedText type="small" themeColor="textSecondary">
                        {dancerNames.length > 0 ? dancerNames.join(', ') : 'Dansçı atanmadı'}
                      </ThemedText>
                    </View>
                  );
                })}
            </ScrollView>

            <Pressable
              style={({ pressed }) => pressed && styles.pressed}
              onPress={() => setHistoryTeam(null)}>
              <View
                style={[
                  styles.primaryButton,
                  styles.primaryButtonFull,
                  { backgroundColor: historyTeamAccent },
                ]}>
                <ThemedText style={styles.primaryButtonText}>Kapat</ThemedText>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.six,
  },
  headerText: {
    gap: Spacing.half,
  },
  seasonChip: {
    alignSelf: 'flex-start',
  },
  addButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  list: {
    gap: Spacing.three,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: Spacing.four,
  },
  seasonModalCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  seasonModalTitle: {
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.two,
  },
  seasonOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
  newSeasonText: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  errorText: {
    color: DANGER_COLOR,
  },
  seasonOptionSelected: {
    backgroundColor: PRIMARY_COLOR + '20',
  },
  seasonOptionSelectedText: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  assignList: {
    maxHeight: 320,
  },
  dancerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
  dancerRowSelected: {
    backgroundColor: PRIMARY_COLOR + '14',
  },
  dancerRowText: {
    gap: Spacing.half,
  },
  historyRow: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  historySeasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  regionPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.five,
  },
  regionText: {
    fontWeight: '700',
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
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
  dayChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  dayChip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
    backgroundColor: 'rgba(128,128,128,0.14)',
  },
  dayChipSelected: {
    backgroundColor: PRIMARY_COLOR,
  },
  dayChipSelectedText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  slotTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  slotDayLabel: {
    width: 88,
  },
  slotTimeInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.four,
    paddingTop: Spacing.two,
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
  cancelButton: {
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  dangerButton: {
    backgroundColor: DANGER_COLOR,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  disabledButton: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
