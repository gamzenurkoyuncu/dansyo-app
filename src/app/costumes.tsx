import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAccentColor } from '@/components/team-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { getAssignedDancerIds } from '@/data/mock-teams';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';
import { shareText } from '@/utils/share';

const PRIMARY_COLOR = '#3c87f7';

export default function CostumesScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const { teams, dancers, assignments, currentSeason } = useAppData();

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teams[0]?.id ?? null);
  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;

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
                <View style={styles.shareButton}>
                  <ThemedText style={styles.shareButtonText}>📤 Listeyi Paylaş</ThemedText>
                </View>
              </Pressable>

              {sizeDistribution.length > 0 && (
                <View style={styles.sizeDistributionRow}>
                  {sizeDistribution.map(([size, count]) => (
                    <View key={size} style={styles.sizeDistributionChip}>
                      <ThemedText type="small" style={styles.sizeDistributionText}>
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
    backgroundColor: PRIMARY_COLOR,
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
    backgroundColor: PRIMARY_COLOR + '1a',
  },
  sizeDistributionText: {
    color: PRIMARY_COLOR,
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
    borderRadius: Spacing.three,
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
