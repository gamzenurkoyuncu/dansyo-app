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
