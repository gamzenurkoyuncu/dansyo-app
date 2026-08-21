import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DraggablePawn } from '@/components/draggable-pawn';
import { getAccentColor } from '@/components/team-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import {
  ChoreographyPawnPosition,
  ChoreographyPlan,
  ChoreographyPlanRow,
  getPlansForTeam,
} from '@/data/mock-choreography-plans';
import { Dancer } from '@/data/mock-dancers';
import { getAssignedDancerIds } from '@/data/mock-teams';
import { Venue } from '@/data/mock-venues';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';

const DEFAULT_WIDTH_SPACING = '0.75';
const DEFAULT_DEPTH_SPACING = '1.2';

export default function ChoreographyScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const {
    teams,
    dancers,
    assignments,
    currentSeason,
    venues,
    setVenues,
    choreographyPlans,
    setChoreographyPlans,
  } = useAppData();
  const [noteInput, setNoteInput] = useState('');

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

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [pawnPositions, setPawnPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [layoutVersion, setLayoutVersion] = useState(0);

  function computeAutoLayout(): Record<string, { x: number; y: number }> {
    if (dancersWithHeight.length === 0) return {};
    // Use the venue-derived row capacity when available; otherwise fall back
    // to a roughly square grid so pawns never stack on top of each other.
    const layoutPerRow = perRow ?? Math.max(1, Math.ceil(Math.sqrt(dancersWithHeight.length * 1.5)));
    const layoutRows: { dancer: Dancer; height: number }[][] = [];
    for (let i = 0; i < dancersWithHeight.length; i += layoutPerRow) {
      layoutRows.push(dancersWithHeight.slice(i, i + layoutPerRow));
    }

    const layout: Record<string, { x: number; y: number }> = {};
    const rowCount = layoutRows.length || 1;
    layoutRows.forEach((row, rowIndex) => {
      // Front row (shortest, index 0) sits near the bottom of the stage view
      // (closest to the audience), back row near the top.
      const y = 1 - (rowIndex + 0.5) / rowCount;
      row.forEach((entry, colIndex) => {
        const x = (colIndex + 0.5) / row.length;
        layout[entry.dancer.id] = { x, y };
      });
    });
    return layout;
  }

  const autoLayout = computeAutoLayout();

  function getPawnPosition(dancerId: string): { x: number; y: number } {
    return pawnPositions[dancerId] ?? autoLayout[dancerId] ?? { x: 0.5, y: 0.5 };
  }

  function handlePawnDragEnd(dancerId: string, x: number, y: number) {
    setPawnPositions((prev) => ({ ...prev, [dancerId]: { x, y } }));
  }

  function handleAutoArrange() {
    setPawnPositions({});
    setLayoutVersion((v) => v + 1);
  }

  const teamPlans = selectedTeam ? getPlansForTeam(choreographyPlans, selectedTeam.id) : [];

  function handleSavePlan() {
    if (!selectedTeam) return;
    const planRows: ChoreographyPlanRow[] = rows.map((row, index) => ({
      rowNumber: index + 1,
      summary: row
        .map((entry) => `${entry.dancer.firstName} ${entry.dancer.lastName} (${entry.height}cm)`)
        .join(', '),
    }));
    const planPositions: ChoreographyPawnPosition[] = teamDancers.map((dancer) => {
      const pos = getPawnPosition(dancer.id);
      return {
        dancerId: dancer.id,
        label: `${dancer.firstName.charAt(0)}${dancer.lastName.charAt(0)}`.toUpperCase(),
        color: getAccentColor(dancer.id),
        x: pos.x,
        y: pos.y,
      };
    });
    const newPlan: ChoreographyPlan = {
      id: Date.now().toString(),
      teamId: selectedTeam.id,
      teamName: selectedTeam.name,
      season: currentSeason,
      venueName: selectedVenue
        ? `${selectedVenue.name} (${selectedVenue.width}×${selectedVenue.depth}m)`
        : null,
      note: noteInput.trim(),
      dancerCount: teamDancers.length,
      maleCount,
      femaleCount,
      unspecifiedGenderCount,
      avgHeight,
      fitsVenue,
      rows: planRows,
      positions: planPositions,
      createdAt: new Date().toISOString(),
    };
    setChoreographyPlans((prev) => [...prev, newPlan]);
    setNoteInput('');
  }

  function handleDeletePlan(planId: string) {
    setChoreographyPlans((prev) => prev.filter((plan) => plan.id !== planId));
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
                    <View
                      style={[styles.chip, isSelected && { backgroundColor: theme.primary }]}>
                      <ThemedText type="small" style={isSelected && styles.chipSelectedText}>
                        {venue.name} ({venue.width}×{venue.depth}m)
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })}
              <Pressable onPress={openVenueForm}>
                <View style={[styles.addChip, { borderColor: theme.primary }]}>
                  <ThemedText type="small" themeColor="primary" style={styles.addChipText}>
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
                    <ThemedText type="small" themeColor="danger">
                      Geçerli bir kişi başı genişlik/derinlik değeri gir.
                    </ThemedText>
                  ) : (
                    <>
                      <ThemedText type="small" themeColor="textSecondary">
                        Sırada {perRow} kişi × {rowsNeeded} sıra = {depthNeeded?.toFixed(1)}m derinlik
                        gerekir ({selectedVenue.name}: {selectedVenue.width}×{selectedVenue.depth}m)
                      </ThemedText>
                      <ThemedText type="small" themeColor={fitsVenue ? 'success' : 'danger'}>
                        {fitsVenue
                          ? '✅ Bu mekan bu ekip için yeterli.'
                          : `⚠️ Mekan yetersiz — derinlik ${((depthNeeded ?? 0) - selectedVenue.depth).toFixed(1)}m fazla geliyor.`}
                      </ThemedText>
                    </>
                  )}
                </ThemedView>
              )}

              <View style={styles.field}>
                <View style={styles.stageHeaderRow}>
                  <ThemedText type="smallBold">💃 Sahne Düzeni</ThemedText>
                  <Pressable
                    style={({ pressed }) => pressed && styles.pressed}
                    onPress={handleAutoArrange}>
                    <ThemedText type="small" themeColor="primary" style={styles.autoArrangeLink}>
                      🔄 Boya Göre Otomatik Diz
                    </ThemedText>
                  </Pressable>
                </View>
                <ThemedText type="small" themeColor="textSecondary">
                  Piyonları sürükleyerek dansçıları sahnede istediğin yere yerleştir.
                </ThemedText>
                <View
                  style={[
                    styles.stage,
                    { aspectRatio: selectedVenue ? selectedVenue.width / selectedVenue.depth : 1.5 },
                  ]}
                  onLayout={(event) => {
                    const { width, height } = event.nativeEvent.layout;
                    setStageSize({ width, height });
                  }}>
                  {stageSize.width > 0 &&
                    teamDancers.map((dancer) => {
                      const position = getPawnPosition(dancer.id);
                      const initials =
                        `${dancer.firstName.charAt(0)}${dancer.lastName.charAt(0)}`.toUpperCase();
                      return (
                        <DraggablePawn
                          key={`${dancer.id}-${layoutVersion}`}
                          label={initials}
                          color={getAccentColor(dancer.id)}
                          initialX={position.x}
                          initialY={position.y}
                          stageWidth={stageSize.width}
                          stageHeight={stageSize.height}
                          onPositionChange={(x, y) => handlePawnDragEnd(dancer.id, x, y)}
                        />
                      );
                    })}
                  <ThemedText type="small" style={styles.stageBackLabel}>
                    Sahne Arkası
                  </ThemedText>
                  <ThemedText type="small" style={styles.stageFrontLabel}>
                    Sahne Önü · Seyirci
                  </ThemedText>
                </View>
              </View>

              <View style={styles.field}>
                <ThemedText type="small" themeColor="textSecondary">
                  📝 Not (opsiyonel)
                </ThemedText>
                <TextInput
                  value={noteInput}
                  onChangeText={setNoteInput}
                  placeholder="örn. 2. figür değişti, kızlar öne geçti"
                  placeholderTextColor={theme.textSecondary}
                  style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                />
              </View>

              <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={handleSavePlan}>
                <View
                  style={[
                    styles.primaryButton,
                    styles.primaryButtonFull,
                    { backgroundColor: theme.primary },
                  ]}>
                  <ThemedText style={styles.primaryButtonText}>💾 Bu Planı Kaydet</ThemedText>
                </View>
              </Pressable>
            </>
          )}

          {selectedTeam && teamPlans.length > 0 && (
            <View style={styles.field}>
              <ThemedText type="smallBold">🕘 Geçmiş Planlar</ThemedText>
              {teamPlans.map((plan) => (
                <ThemedView key={plan.id} type="backgroundElement" style={styles.planCard}>
                  <View style={styles.planHeader}>
                    <ThemedText type="small" themeColor="textSecondary">
                      {new Date(plan.createdAt).toLocaleString('tr-TR', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}{' '}
                      · {plan.season}
                    </ThemedText>
                    <Pressable hitSlop={8} onPress={() => handleDeletePlan(plan.id)}>
                      <ThemedText style={styles.deleteGlyph}>🗑️</ThemedText>
                    </Pressable>
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    👥 {plan.dancerCount} dansçı · 🚹 {plan.maleCount} · 🚺 {plan.femaleCount}
                    {plan.unspecifiedGenderCount > 0 ? ` · ❔ ${plan.unspecifiedGenderCount}` : ''}
                    {plan.avgHeight !== null ? ` · Ort. boy ${plan.avgHeight}cm` : ''}
                  </ThemedText>
                  {plan.venueName && (
                    <ThemedText type="small" themeColor="textSecondary">
                      🏟️ {plan.venueName}
                      {plan.fitsVenue !== null ? (plan.fitsVenue ? ' · ✅ yeterli' : ' · ⚠️ yetersiz') : ''}
                    </ThemedText>
                  )}
                  {plan.note.length > 0 && <ThemedText style={styles.planNote}>{plan.note}</ThemedText>}
                  {plan.positions.length > 0 && (
                    <View style={styles.miniStage}>
                      {plan.positions.map((position) => (
                        <View
                          key={position.dancerId}
                          style={[
                            styles.miniPawn,
                            {
                              backgroundColor: position.color,
                              left: `${position.x * 100}%`,
                              top: `${position.y * 100}%`,
                            },
                          ]}>
                          <ThemedText style={styles.miniPawnLabel}>{position.label}</ThemedText>
                        </View>
                      ))}
                    </View>
                  )}
                </ThemedView>
              ))}
            </View>
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
                style={[
                  styles.primaryButton,
                  styles.primaryButtonFull,
                  { backgroundColor: theme.primary },
                  !canSaveVenue && styles.disabledButton,
                ]}>
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
  chipSelectedText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  addChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    borderWidth: 1,
  },
  addChipText: {
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
  stageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autoArrangeLink: {
    fontWeight: '700',
  },
  stage: {
    width: '100%',
    backgroundColor: '#1B2A20',
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    position: 'relative',
  },
  stageBackLabel: {
    position: 'absolute',
    top: Spacing.one,
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.4)',
  },
  stageFrontLabel: {
    position: 'absolute',
    bottom: Spacing.one,
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.4)',
  },
  miniStage: {
    width: '100%',
    aspectRatio: 1.5,
    backgroundColor: '#1B2A20',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    position: 'relative',
    marginTop: Spacing.half,
  },
  miniPawn: {
    position: 'absolute',
    width: 22,
    height: 22,
    marginLeft: -11,
    marginTop: -11,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  miniPawnLabel: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 8,
  },
  planCard: {
    gap: Spacing.half,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteGlyph: {
    fontSize: 14,
  },
  planNote: {
    fontStyle: 'italic',
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
