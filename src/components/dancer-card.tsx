import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { getAccentColor } from '@/components/team-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Dancer, getAge } from '@/data/mock-dancers';
import { useTheme } from '@/hooks/use-theme';

const CONSECUTIVE_ABSENCE_THRESHOLD = 3;

type DancerCardProps = {
  dancer: Dancer;
  teamName?: string;
  consecutiveAbsences?: number;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function DancerCard({
  dancer,
  teamName,
  consecutiveAbsences,
  onPress,
  onEdit,
  onDelete,
}: DancerCardProps) {
  const theme = useTheme();
  const accent = getAccentColor(dancer.id);
  const age = getAge(dancer.birthDate);
  const initials = `${dancer.firstName.charAt(0)}${dancer.lastName.charAt(0)}`.toUpperCase();

  return (
    <Pressable
      disabled={!onPress}
      style={({ pressed }) => pressed && styles.pressed}
      onPress={onPress}>
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
          {consecutiveAbsences !== undefined &&
            consecutiveAbsences >= CONSECUTIVE_ABSENCE_THRESHOLD && (
              <ThemedText type="small" themeColor="danger" style={styles.absenceWarning}>
                ⚠️ {consecutiveAbsences} kez üst üste devamsız
              </ThemedText>
            )}
        </View>

        {(dancer.parentPhone.length > 0 || onEdit || onDelete) && (
          <View style={styles.actions}>
            {dancer.parentPhone.length > 0 && (
              <Pressable
                hitSlop={8}
                style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                onPress={() => Linking.openURL(`tel:${dancer.parentPhone.replace(/\s+/g, '')}`)}>
                <ThemedText style={styles.iconGlyph}>📞</ThemedText>
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
                  { backgroundColor: theme.dangerSoft },
                  pressed && styles.pressed,
                ]}
                onPress={onDelete}>
                <ThemedText style={styles.iconGlyph}>🗑️</ThemedText>
              </Pressable>
            )}
          </View>
        )}
      </ThemedView>
    </Pressable>
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
  iconGlyph: {
    fontSize: 14,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.6,
  },
});
