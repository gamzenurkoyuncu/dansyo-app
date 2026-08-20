import { Pressable, StyleSheet, View } from 'react-native';

import { getAccentColor } from '@/components/team-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Dancer, getAge } from '@/data/mock-dancers';

const DANGER_COLOR = '#e05252';
const CONSECUTIVE_ABSENCE_THRESHOLD = 3;

type DancerCardProps = {
  dancer: Dancer;
  teamName?: string;
  consecutiveAbsences?: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewAttendance?: () => void;
  onViewPayments?: () => void;
};

export function DancerCard({
  dancer,
  teamName,
  consecutiveAbsences,
  onEdit,
  onDelete,
  onViewAttendance,
  onViewPayments,
}: DancerCardProps) {
  const accent = getAccentColor(dancer.id);
  const age = getAge(dancer.birthDate);
  const initials = `${dancer.firstName.charAt(0)}${dancer.lastName.charAt(0)}`.toUpperCase();

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: accent + '33' }]}>
        <ThemedText style={[styles.avatarText, { color: accent }]}>{initials}</ThemedText>
      </View>

      <View style={styles.info}>
        <ThemedText type="default" style={styles.name}>
          {dancer.firstName} {dancer.lastName}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {age !== null ? `${age} yaş` : 'Doğum tarihi geçersiz'}
          {dancer.school ? ` · ${dancer.school}` : ''}
        </ThemedText>
        {teamName && (
          <View style={[styles.teamPill, { backgroundColor: accent + '26' }]}>
            <ThemedText type="small" style={[styles.teamPillText, { color: accent }]}>
              {teamName}
            </ThemedText>
          </View>
        )}
        {consecutiveAbsences !== undefined && consecutiveAbsences >= CONSECUTIVE_ABSENCE_THRESHOLD && (
          <ThemedText type="small" style={styles.absenceWarning}>
            ⚠️ {consecutiveAbsences} kez üst üste devamsız
          </ThemedText>
        )}
      </View>

      {(onViewAttendance || onViewPayments || onEdit || onDelete) && (
        <View style={styles.actions}>
          {onViewAttendance && (
            <Pressable
              hitSlop={8}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              onPress={onViewAttendance}>
              <ThemedText style={styles.iconGlyph}>🕐</ThemedText>
            </Pressable>
          )}
          {onViewPayments && (
            <Pressable
              hitSlop={8}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
              onPress={onViewPayments}>
              <ThemedText style={styles.iconGlyph}>💰</ThemedText>
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '700',
    fontSize: 16,
  },
  info: {
    flex: 1,
    gap: Spacing.half,
  },
  name: {
    fontWeight: '700',
  },
  teamPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.five,
    marginTop: Spacing.half,
  },
  teamPillText: {
    fontWeight: '700',
  },
  absenceWarning: {
    color: DANGER_COLOR,
    fontWeight: '700',
    marginTop: Spacing.half,
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
  pressed: {
    opacity: 0.6,
  },
});
