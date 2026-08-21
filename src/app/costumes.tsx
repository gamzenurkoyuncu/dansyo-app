import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccentColor } from '@/components/team-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import {
  CostumeArchiveEntry,
  getArchiveEntriesFor,
  getArchiveRegionNames,
} from '@/data/mock-costume-archive';
import { getAssignedDancerIds, getAvailableSeasons } from '@/data/mock-teams';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';
import { shareText } from '@/utils/share';

export default function CostumesScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const { teams, dancers, assignments, currentSeason, seasons, seasonRegions, costumeArchive, setCostumeArchive } =
    useAppData();

  const [viewMode, setViewMode] = useState<'olcu' | 'arsiv'>('olcu');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teams[0]?.id ?? null);
  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;

  const availableSeasons = getAvailableSeasons(seasons, seasonRegions);
  const [archiveSeason, setArchiveSeason] = useState(currentSeason);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [newRegionInput, setNewRegionInput] = useState('');
  const [viewingEntry, setViewingEntry] = useState<CostumeArchiveEntry | null>(null);

  const archiveRegionNames = getArchiveRegionNames(costumeArchive, seasonRegions);
  const archiveEntries = selectedRegion
    ? getArchiveEntriesFor(costumeArchive, selectedRegion, archiveSeason)
    : [];

  async function handleAddPhoto() {
    if (!selectedRegion.trim()) return;
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled || result.assets.length === 0) return;

    setCostumeArchive((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        regionName: selectedRegion.trim(),
        season: archiveSeason,
        imageUri: result.assets[0].uri,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  function handleAddRegion() {
    const name = newRegionInput.trim();
    if (!name) return;
    setSelectedRegion(name);
    setNewRegionInput('');
  }

  function handleDeletePhoto() {
    if (!viewingEntry) return;
    setCostumeArchive((prev) => prev.filter((entry) => entry.id !== viewingEntry.id));
    setViewingEntry(null);
  }

  const teamDancers = selectedTeam
    ? getAssignedDancerIds(assignments, selectedTeam.id, currentSeason)
        .map((dancerId) => dancers.find((dancer) => dancer.id === dancerId))
        .filter((dancer) => dancer !== undefined)
    : [];

  const sizeDistribution = Object.entries(
    teamDancers.reduce<Record<string, number>>((counts, dancer) => {
      const size = dancer.costumeSize.trim();
      if (!size) return counts;
      counts[size] = (counts[size] ?? 0) + 1;
      return counts;
    }, {}),
  ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'tr'));

  function handleShare() {
    if (!selectedTeam || teamDancers.length === 0) return;
    const lines = teamDancers.map((dancer) => {
      const parts = [
        `${dancer.firstName} ${dancer.lastName}`,
        dancer.height ? `Boy: ${dancer.height} cm` : null,
        dancer.weight ? `Kilo: ${dancer.weight} kg` : null,
        dancer.costumeSize ? `Beden: ${dancer.costumeSize}` : null,
      ].filter((part): part is string => Boolean(part));
      return `- ${parts.join(' · ')}`;
    });
    const message = `DansYo - Kostüm Listesi - ${selectedTeam.name} (${currentSeason})\n\n${lines.join('\n')}`;
    shareText(message);
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
          <ThemedText type="subtitle">Kostüm Listesi</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {currentSeason} sezonu
          </ThemedText>
        </View>

        <View style={styles.viewModeRow}>
          <Pressable onPress={() => setViewMode('olcu')}>
            <View
              style={[
                styles.viewModeChip,
                viewMode === 'olcu' && { backgroundColor: theme.primary },
              ]}>
              <ThemedText
                type="small"
                style={viewMode === 'olcu' && styles.viewModeChipSelectedText}>
                📏 Ölçüler
              </ThemedText>
            </View>
          </Pressable>
          <Pressable onPress={() => setViewMode('arsiv')}>
            <View
              style={[
                styles.viewModeChip,
                viewMode === 'arsiv' && { backgroundColor: theme.primary },
              ]}>
              <ThemedText
                type="small"
                style={viewMode === 'arsiv' && styles.viewModeChipSelectedText}>
                🗄️ Arşiv
              </ThemedText>
            </View>
          </Pressable>
        </View>

        {viewMode === 'olcu' && (
        <>
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
                      style={[styles.teamChipText, { color: isSelected ? '#ffffff' : accent }]}>
                      {team.name}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.list}>
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
              <Pressable
                style={({ pressed }) => pressed && styles.pressed}
                onPress={handleShare}>
                <View style={[styles.shareButton, { backgroundColor: theme.primary }]}>
                  <ThemedText style={styles.shareButtonText}>📤 Listeyi Paylaş</ThemedText>
                </View>
              </Pressable>

              {sizeDistribution.length > 0 && (
                <View style={styles.sizeDistributionRow}>
                  {sizeDistribution.map(([size, count]) => (
                    <View
                      key={size}
                      style={[styles.sizeDistributionChip, { backgroundColor: theme.primarySoft }]}>
                      <ThemedText type="small" themeColor="primary" style={styles.sizeDistributionText}>
                        {count}x {size}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.tableHeader}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.nameCol}>
                  Dansçı
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.measureCol}>
                  Boy
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.measureCol}>
                  Kilo
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.sizeCol}>
                  Beden
                </ThemedText>
              </View>
              {teamDancers.map((dancer) => (
                <ThemedView key={dancer.id} type="backgroundElement" style={styles.row}>
                  <ThemedText style={styles.nameCol}>
                    {dancer.firstName} {dancer.lastName}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.measureCol}>
                    {dancer.height ? `${dancer.height} cm` : '-'}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.measureCol}>
                    {dancer.weight ? `${dancer.weight} kg` : '-'}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.sizeCol}>
                    {dancer.costumeSize || '-'}
                  </ThemedText>
                </ThemedView>
              ))}
            </>
          )}
        </View>
        </>
        )}

        {viewMode === 'arsiv' && (
          <>
            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                🗓️ Sezon
              </ThemedText>
              <View style={styles.teamChipRow}>
                {availableSeasons.map((season) => {
                  const isSelected = season === archiveSeason;
                  return (
                    <Pressable key={season} onPress={() => setArchiveSeason(season)}>
                      <View
                        style={[styles.teamChip, isSelected && { backgroundColor: theme.primary }]}>
                        <ThemedText
                          type="small"
                          style={isSelected && styles.archiveChipSelectedText}>
                          {season}
                        </ThemedText>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                📍 Yöre
              </ThemedText>
              {archiveRegionNames.length > 0 && (
                <View style={styles.teamChipRow}>
                  {archiveRegionNames.map((name) => {
                    const isSelected = name === selectedRegion;
                    return (
                      <Pressable key={name} onPress={() => setSelectedRegion(name)}>
                        <View
                          style={[
                            styles.teamChip,
                            isSelected && { backgroundColor: theme.primary },
                          ]}>
                          <ThemedText
                            type="small"
                            style={isSelected && styles.archiveChipSelectedText}>
                            {name}
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
              <View style={styles.newRegionRow}>
                <TextInput
                  value={newRegionInput}
                  onChangeText={setNewRegionInput}
                  placeholder="Yeni yöre adı (örn. Halay)"
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.input,
                    styles.newRegionInput,
                    { color: theme.text, borderColor: theme.backgroundSelected },
                  ]}
                />
                <Pressable
                  disabled={newRegionInput.trim().length === 0}
                  style={({ pressed }) => pressed && styles.pressed}
                  onPress={handleAddRegion}>
                  <View
                    style={[
                      styles.newRegionButton,
                      { backgroundColor: theme.primary },
                      newRegionInput.trim().length === 0 && styles.disabledButton,
                    ]}>
                    <ThemedText style={styles.newRegionButtonText}>Ekle</ThemedText>
                  </View>
                </Pressable>
              </View>
            </View>

            {!selectedRegion ? (
              <ThemedText type="small" themeColor="textSecondary">
                Önce bir yöre seç veya yeni bir yöre adı ekle.
              </ThemedText>
            ) : (
              <View style={styles.list}>
                <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={handleAddPhoto}>
                  <View style={[styles.shareButton, { backgroundColor: theme.primary }]}>
                    <ThemedText style={styles.shareButtonText}>📷 Fotoğraf Ekle</ThemedText>
                  </View>
                </Pressable>

                {archiveEntries.length === 0 ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {selectedRegion} · {archiveSeason} için henüz fotoğraf yok.
                  </ThemedText>
                ) : (
                  <View style={styles.photoGrid}>
                    {archiveEntries.map((entry) => (
                      <Pressable key={entry.id} onPress={() => setViewingEntry(entry)}>
                        <Image source={{ uri: entry.imageUri }} style={styles.photoThumb} />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>

    <Modal
      visible={viewingEntry !== null}
      animationType="fade"
      transparent
      onRequestClose={() => setViewingEntry(null)}>
      <View style={styles.viewerOverlay}>
        {viewingEntry && (
          <Image source={{ uri: viewingEntry.imageUri }} style={styles.viewerImage} contentFit="contain" />
        )}
        <View style={styles.viewerActions}>
          <Pressable
            style={({ pressed }) => [styles.viewerButton, pressed && styles.pressed]}
            onPress={() => setViewingEntry(null)}>
            <ThemedText style={styles.viewerButtonText}>Kapat</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.viewerButton,
              { backgroundColor: theme.danger },
              pressed && styles.pressed,
            ]}
            onPress={handleDeletePhoto}>
            <ThemedText style={styles.viewerButtonText}>🗑️ Sil</ThemedText>
          </Pressable>
        </View>
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
  viewModeRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  viewModeChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    backgroundColor: 'rgba(128,128,128,0.14)',
  },
  viewModeChipSelectedText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  archiveChipSelectedText: {
    color: '#ffffff',
    fontWeight: '700',
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
  newRegionRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    alignItems: 'center',
  },
  newRegionInput: {
    flex: 1,
  },
  newRegionButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.small,
  },
  newRegionButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.4,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  photoThumb: {
    width: 104,
    height: 104,
    borderRadius: Radius.small,
    backgroundColor: 'rgba(128,128,128,0.14)',
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.four,
  },
  viewerImage: {
    width: '100%',
    height: '75%',
  },
  viewerActions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  viewerButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  viewerButtonText: {
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
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
  shareButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    marginBottom: Spacing.one,
  },
  shareButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  sizeDistributionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginBottom: Spacing.one,
  },
  sizeDistributionChip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
  },
  sizeDistributionText: {
    fontWeight: '700',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.medium,
    gap: Spacing.two,
  },
  nameCol: {
    flex: 2,
    fontWeight: '700',
  },
  measureCol: {
    flex: 1,
  },
  sizeCol: {
    flex: 1,
    fontWeight: '700',
  },
});
