import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Team } from '@/data/mock-teams';

type TeamCardProps = {
  team: Team;
  regionName?: string;
  dancerCount: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onAssignDancers?: () => void;
};

const ACCENT_PALETTE = ['#F2994A', '#2F80ED', '#9B51E0', '#14B8A6', '#F2C94C'];

export function getAccentColor(id: string) {
  const sum = id.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  return ACCENT_PALETTE[sum % ACCENT_PALETTE.length];
}

export function TeamCard({
  team,
  regionName,
  dancerCount,
  onEdit,
  onDelete,
  onAssignDancers,
}: TeamCardProps) {
  const accent = getAccentColor(team.id);

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <ThemedText type="default" style={styles.name}>
            {team.name}
          </ThemedText>

          {(onAssignDancers || onEdit || onDelete) && (
            <View style={styles.actions}>
              {onAssignDancers && (
                <Pressable
                  hitSlop={8}
                  style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                  onPress={onAssignDancers}>
                  <ThemedText style={styles.iconGlyph}>🧑‍🤝‍🧑</ThemedText>
                </Pressable>
              )}
              {onEdit && (
                <Pressable
                  hitSlop={8}
                  style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                  onPress={onEdit}>
                  <ThemedText style={styles.iconGlyph}>✏️</ThemedText>
                </Pressable>
              )}
              {onDelete && (
                <Pressable
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.iconButton,
                    styles.deleteButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={onDelete}>
                  <ThemedText style={styles.iconGlyph}>🗑️</ThemedText>
                </Pressable>
              )}
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.regionPill, { backgroundColor: accent + '26' }]}>
            <ThemedText type="small" style={[styles.regionText, { color: accent }]}>
              {regionName ?? 'Yöre atanmadı'}
            </ThemedText>
          </View>

          <ThemedText type="small" themeColor="textSecondary">
            👥 {dancerCount} dansçı
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: Spacing.three,
  },
  accentBar: {
    width: 5,
  },
  body: {
    flex: 1,
    gap: Spacing.two,
    padding: Spacing.three,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  name: {
    fontWeight: '700',
    fontSize: 18,
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128,128,128,0.14)',
  },
  deleteButton: {
    backgroundColor: 'rgba(224,82,82,0.14)',
  },
  iconGlyph: {
    fontSize: 14,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  regionPill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.five,
  },
  regionText: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.6,
  },
});
