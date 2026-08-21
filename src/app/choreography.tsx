import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccentColor } from '@/components/team-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { Dancer } from '@/data/mock-dancers';
import { getAssignedDancerIds } from '@/data/mock-teams';
import { Venue } from '@/data/mock-venues';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';

const PRIMARY_COLOR = '#3c87f7';
const DANGER_COLOR = '#e05252';
const SUCCESS_COLOR = '#27ae60';

const DEFAULT_WIDTH_SPACING = '0.75';
const DEFAULT_DEPTH_SPACING = '1.2';

export default function ChoreographyScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const { teams, dancers, assignments, currentSeason, venues, setVenues } = useAppData();

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teams[0]?.id ?? null);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(venues[0]?.id ?? null);
  const [widthSpacingInput, setWidthSpacingInput] = useState(DEFAULT_WIDTH_SPACING);
  const [depthSpacingInput, setDepthSpacingInput] = useState(DEFAULT_DEPTH_SPACING);

  const [isVenueFormVisible, setVenueFormVisible] = useState(false);
  const [venueNameInput, setVenueNameInput] = useState('');
  const [venueWidthInput, setVenueWidthInput] = useState('');
  const [venueDepthInput, setVenueDepthInput] = useState('');

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;
  const selectedVenue = venues.find((venue) => venue.id === selectedVenueId) ?? null;

  const teamDancers: Dancer[] = selectedTeam
    ? getAssignedDancerIds(assignments, selectedTeam.id, currentSeason)
        .map((dancerId) => dancers.find((dancer) => dancer.id === dancerId))
        .filter((dancer) => dancer !== undefined)
    : [];

  const maleCount = teamDancers.filter((dancer) => dancer.gender === 'Erkek').length;
  const femaleCount = teamDancers.filter((dancer) => dancer.gender === 'Kız').length;
  const unspecifiedGenderCount = teamDancers.length - maleCount - femaleCount;

  const dancersWithHeight = teamDancers
    .map((dancer) => ({ dancer, height: Number(dancer.height) }))
    .filter((entry): entry is { dancer: Dancer; height: number } =>
      Number.isFinite(entry.height) && entry.height > 0,
    )
    .sort((a, b) => a.height - b.height);
  const dancersWithoutHeight = teamDancers.filter(
    (dancer) => !(Number.isFinite(Number(dancer.height)) && Number(dancer.height) > 0),
  );

  const minHeight = dancersWithHeight[0]?.height;
  const maxHeight = dancersWithHeight[dancersWithHeight.length - 1]?.height;
  const avgHeight =
    dancersWithHeight.length > 0
      ? Math.round(
          dancersWithHeight.reduce((sum, entry) => sum + entry.height, 0) / dancersWithHeight.length,
        )
      : null;

  const widthSpacing = Number(widthSpacingInput);
  const depthSpacing = Number(depthSpacingInput);
  const isSpacingValid =
    Number.isFinite(widthSpacing) && widthSpacing > 0 && Number.isFinite(depthSpacing) && depthSpacing > 0;

  const perRow =
    selectedVenue && isSpacingValid ? Math.max(1, Math.floor(selectedVenue.width / widthSpacing)) : null;
  const rowsNeeded = perRow ? Math.ceil(dancersWithHeight.length / perRow) : null;
  const depthNeeded = rowsNeeded && isSpacingValid ? rowsNeeded * depthSpacing : null;
  const fitsVenue =
    selectedVenue && depthNeeded !== null ? depthNeeded <= selectedVenue.depth : null;

  const rows: { dancer: Dancer; height: number }[][] = [];
  if (perRow) {
    for (let i = 0; i < dancersWithHeight.length; i += perRow) {
      rows.push(dancersWithHeight.slice(i, i + perRow));
    }
  }

  function openVenueForm() {
    setVenueNameInput('');
    setVenueWidthInput('');
    setVenueDepthInput('');
    setVenueFormVisible(true);
  }

  function handleSaveVenue() {
    const name = venueNameInput.trim();
    const width = Number(venueWidthInput);
    const depth = Number(venueDepthInput);
    if (!name || !Number.isFinite(width) || width <= 0 || !Number.isFinite(depth) || depth <= 0) return;

    const newVenue: Venue = { id: Date.now().toString(), name, width, depth };
    setVenues((prev) => [...prev, newVenue]);
    setSelectedVenueId(newVenue.id);
    setVenueFormVisible(false);
  }

  const canSaveVenue =
    venueNameInput.trim().length > 0 &&
    Number(venueWidthInput) > 0 &&
    Number(venueDepthInput) > 0;

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
            <ThemedText type="subtitle">Koreografi Planlama</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {currentSeason} sezonu
            </ThemedText>
          </View>

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary">
              🎽 Ekip
            </ThemedText>
            <View style={styles.chipRow}>
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
                        style={[styles.teamChipText, { color: isSelected ? '#ffffff' : accent }]}>
                        {team.name}
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary">
              🏟️ Mekan
            </ThemedText>
            <View style={styles.chipRow}>
              {venues.map((venue) => {
                const isSelected = venue.id === selectedVenueId;
                return (
                  <Pressable key={venue.id} onPress={() => setSelectedVenueId(venue.id)}>
                    <View style={[styles.chip, isSelected && styles.chipSelected]}>
                      <ThemedText type="small" style={isSelected ? styles.chipSelectedText : undefined}>
                        {venue.name} ({venue.width}×{venue.depth}m)
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })}
              <Pressable onPress={openVenueForm}>
                <View style={styles.addChip}>
                  <ThemedText type="small" style={styles.addChipText}>
                    + Mekan Ekle
                  </ThemedText>
                </View>
              </Pressable>
            </View>
          </View>

          {selectedVenue && (
            <View style={styles.spacingRow}>
              <View style={styles.spacingField}>
                <ThemedText type="small" themeColor="textSecondary">
                  ↔️ Kişi başı genişlik (m)
                </ThemedText>
                <TextInput
                  value={widthSpacingInput}
                  onChangeText={setWidthSpacingInput}
                  keyboardType="numeric"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                />
              </View>
              <View style={styles.spacingField}>
                <ThemedText type="small" themeColor="textSecondary">
                  ↕️ Sıra başı derinlik (m)
                </ThemedText>
                <TextInput
                  value={depthSpacingInput}
                  onChangeText={setDepthSpacingInput}
                  keyboardType="numeric"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                />
              </View>
            </View>
          )}

          {!selectedTeam ? (
            <ThemedText type="small" themeColor="textSecondary">
              Önce bir ekip seç.
            </ThemedText>
          ) : teamDancers.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              Bu ekibe {currentSeason} sezonu için atanmış dansçı yok.
            </ThemedText>
          ) : (
            <>
              <View style={styles.statsGrid}>
                <ThemedView type="backgroundElement" style={styles.statCard}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Dansçı
                  </ThemedText>
                  <ThemedText type="subtitle">{teamDancers.length}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    🚹 {maleCount} · 🚺 {femaleCount}
                    {unspecifiedGenderCount > 0 ? ` · ❔ ${unspecifiedGenderCount}` : ''}
                  </ThemedText>
                </ThemedView>

                <ThemedView type="backgroundElement" style={styles.statCard}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Boy (cm)
                  </ThemedText>
                  <ThemedText type="subtitle">{avgHeight ?? '—'}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {minHeight && maxHeight ? `${minHeight}–${maxHeight} arası` : 'Veri yok'}
                  </ThemedText>
                </ThemedView>
              </View>

              {dancersWithoutHeight.length > 0 && (
                <ThemedText type="small" themeColor="textSecondary">
                  ℹ️ Boy bilgisi eksik: {dancersWithoutHeight.map((d) => `${d.firstName} ${d.lastName}`).join(', ')}
                </ThemedText>
              )}

              {selectedVenue && (
                <ThemedView type="backgroundElement" style={styles.capacityCard}>
                  <ThemedText type="smallBold">🎭 Sahne Kapasitesi</ThemedText>
                  {!isSpacingValid ? (
                    <ThemedText type="small" style={styles.errorText}>
                      Geçerli bir kişi başı genişlik/derinlik değeri gir.
                    </ThemedText>
                  ) : (
                    <>
                      <ThemedText type="small" themeColor="textSecondary">
                        Sırada {perRow} kişi × {rowsNeeded} sıra = {depthNeeded?.toFixed(1)}m derinlik
                        gerekir ({selectedVenue.name}: {selectedVenue.width}×{selectedVenue.depth}m)
                      </ThemedText>
                      <ThemedText
                        type="small"
                        style={fitsVenue ? styles.successText : styles.errorText}>
                        {fitsVenue
                          ? '✅ Bu mekan bu ekip için yeterli.'
                          : `⚠️ Mekan yetersiz — derinlik ${((depthNeeded ?? 0) - selectedVenue.depth).toFixed(1)}m fazla geliyor.`}
                      </ThemedText>
                    </>
                  )}
                </ThemedView>
              )}

              {rows.length > 0 && (
                <View style={styles.field}>
                  <ThemedText type="smallBold">📐 Boya Göre Önerilen Sıra Düzeni (önden arkaya)</ThemedText>
                  {rows.map((row, index) => (
                    <ThemedView key={index} type="backgroundElement" style={styles.rowCard}>
                      <ThemedText type="small" themeColor="textSecondary">
                        {index + 1}. Sıra{index === 0 ? ' (ön)' : index === rows.length - 1 ? ' (arka)' : ''}
                      </ThemedText>
                      <ThemedText style={styles.rowNames}>
                        {row.map((entry) => `${entry.dancer.firstName} ${entry.dancer.lastName} (${entry.height}cm)`).join(', ')}
                      </ThemedText>
                    </ThemedView>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isVenueFormVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setVenueFormVisible(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <ThemedText type="subtitle">Yeni Mekan</ThemedText>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                🏷️ Ad
              </ThemedText>
              <TextInput
                value={venueNameInput}
                onChangeText={setVenueNameInput}
                placeholder="örn. Okul Salonu"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
            </View>

            <View style={styles.spacingRow}>
              <View style={styles.spacingField}>
                <ThemedText type="small" themeColor="textSecondary">
                  ↔️ Genişlik (m)
                </ThemedText>
                <TextInput
                  value={venueWidthInput}
                  onChangeText={setVenueWidthInput}
                  placeholder="örn. 8"
                  keyboardType="numeric"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                />
              </View>
              <View style={styles.spacingField}>
                <ThemedText type="small" themeColor="textSecondary">
                  ↕️ Derinlik (m)
                </ThemedText>
                <TextInput
                  value={venueDepthInput}
                  onChangeText={setVenueDepthInput}
                  placeholder="örn. 6"
                  keyboardType="numeric"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                />
              </View>
            </View>

            <Pressable
              disabled={!canSaveVenue}
              style={({ pressed }) => pressed && styles.pressed}
              onPress={handleSaveVenue}>
              <View
                style={[styles.primaryButton, styles.primaryButtonFull, !canSaveVenue && styles.disabledButton]}>
                <ThemedText style={styles.primaryButtonText}>Mekanı Ekle</ThemedText>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              onPress={() => setVenueFormVisible(false)}>
              <ThemedText themeColor="textSecondary">İptal</ThemedText>
            </Pressable>
          </ThemedView>
        </View>
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
    gap: Spacing.half,
    paddingTop: Spacing.six,
  },
  field: {
    gap: Spacing.one,
  },
  chipRow: {
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
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    backgroundColor: 'rgba(128,128,128,0.14)',
  },
  chipSelected: {
    backgroundColor: PRIMARY_COLOR,
  },
  chipSelectedText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  addChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
  },
  addChipText: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  spacingRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  spacingField: {
    flex: 1,
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
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
    gap: Spacing.half,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  capacityCard: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  rowCard: {
    gap: Spacing.half,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  rowNames: {
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.7,
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
  disabledButton: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
});
