import { StyleSheet, View } from 'react-native';

import { getAccentColor } from '@/components/team-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Dancer, getAge } from '@/data/mock-dancers';

type DancerCardProps = {
  dancer: Dancer;
};

export function DancerCard({ dancer }: DancerCardProps) {
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
      </View>
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
});
