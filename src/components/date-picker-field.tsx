import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatTurkishDate } from '@/data/mock-dancers';
import { useTheme } from '@/hooks/use-theme';

const PRIMARY_COLOR = '#3c87f7';

type DatePickerFieldProps = {
  value: string | null; // ISO date, yyyy-mm-dd
  onChange: (isoDate: string) => void;
  placeholder?: string;
};

function toISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DatePickerField({ value, onChange, placeholder }: DatePickerFieldProps) {
  const theme = useTheme();
  const [isVisible, setVisible] = useState(false);
  const dateValue = value ? new Date(`${value}T00:00:00`) : new Date();

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setVisible(false);
    if (event.type === 'dismissed' || !selected) return;
    onChange(toISO(selected));
  }

  return (
    <>
      <Pressable onPress={() => setVisible(true)}>
        <View style={[styles.field, { borderColor: theme.backgroundSelected }]}>
          <ThemedText style={!value ? { color: theme.textSecondary } : undefined}>
            {value ? formatTurkishDate(value) : (placeholder ?? '📅 Tarih seç')}
          </ThemedText>
        </View>
      </Pressable>

      {isVisible && Platform.OS === 'android' && (
        <DateTimePicker value={dateValue} mode="date" display="calendar" onChange={handleChange} />
      )}

      {Platform.OS === 'ios' && (
        <Modal
          visible={isVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setVisible(false)}>
          <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
            <Pressable>
              <View style={[styles.sheet, { backgroundColor: theme.backgroundElement }]}>
                <DateTimePicker value={dateValue} mode="date" display="inline" onChange={handleChange} />
                <Pressable onPress={() => setVisible(false)}>
                  <View style={styles.doneButton}>
                    <ThemedText style={styles.doneButtonText}>Tamam</ThemedText>
                  </View>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: Spacing.four,
  },
  sheet: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  doneButton: {
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  doneButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
