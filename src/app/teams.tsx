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
  CURRENT_SEASON,
  getRegionForSeason,
  initialSeasonRegions,
  initialTeams,
  SeasonRegion,
  Team,
} from '@/data/mock-teams';
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

  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [seasonRegions, setSeasonRegions] = useState<SeasonRegion[]>(initialSeasonRegions);

  const [isFormVisible, setFormVisible] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [dancerCountInput, setDancerCountInput] = useState('');
  const [regionInput, setRegionInput] = useState('');

  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);

  const canSubmit = nameInput.trim().length > 0 && regionInput.trim().length > 0;
  const formAccent = editingTeamId ? getAccentColor(editingTeamId) : PRIMARY_COLOR;

  function openAddForm() {
    setEditingTeamId(null);
    setNameInput('');
    setDancerCountInput('');
    setRegionInput('');
    setFormVisible(true);
  }

  function openEditForm(team: Team) {
    setEditingTeamId(team.id);
    setNameInput(team.name);
    setDancerCountInput(String(team.dancerCount));
    setRegionInput(getRegionForSeason(seasonRegions, team.id) ?? '');
    setFormVisible(true);
  }

  function handleSaveTeam() {
    if (!canSubmit) return;

    const dancerCount = Number.parseInt(dancerCountInput, 10) || 0;

    if (editingTeamId) {
      setTeams((prev) =>
        prev.map((team) =>
          team.id === editingTeamId ? { ...team, name: nameInput.trim(), dancerCount } : team,
        ),
      );
      setSeasonRegions((prev) => {
        const hasCurrentSeasonRecord = prev.some(
          (region) => region.teamId === editingTeamId && region.season === CURRENT_SEASON,
        );
        if (hasCurrentSeasonRecord) {
          return prev.map((region) =>
            region.teamId === editingTeamId && region.season === CURRENT_SEASON
              ? { ...region, regionName: regionInput.trim() }
              : region,
          );
        }
        return [
          ...prev,
          { teamId: editingTeamId, season: CURRENT_SEASON, regionName: regionInput.trim() },
        ];
      });
    } else {
      const newTeam: Team = {
        id: Date.now().toString(),
        name: nameInput.trim(),
        dancerCount,
      };
      setTeams((prev) => [...prev, newTeam]);
      setSeasonRegions((prev) => [
        ...prev,
        { teamId: newTeam.id, season: CURRENT_SEASON, regionName: regionInput.trim() },
      ]);
    }

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
              <ThemedText type="small" themeColor="textSecondary">
                {teams.length} ekip · {CURRENT_SEASON} sezonu
              </ThemedText>
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
                regionName={getRegionForSeason(seasonRegions, team.id)}
                onEdit={() => openEditForm(team)}
                onDelete={() => setDeletingTeam(team)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

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
                👥 Dansçı Sayısı
              </ThemedText>
              <TextInput
                value={dancerCountInput}
                onChangeText={setDancerCountInput}
                placeholder="örn. 12"
                keyboardType="number-pad"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                📍 Bu Sezonki Yöre ({CURRENT_SEASON})
              </ThemedText>
              <TextInput
                value={regionInput}
                onChangeText={setRegionInput}
                placeholder="örn. Zeybek"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
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
