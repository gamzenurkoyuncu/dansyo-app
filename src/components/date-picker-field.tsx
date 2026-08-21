import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
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

function fromISO(value: string | null): Date {
  return value ? new Date(`${value}T00:00:00`) : new Date();
}

export function DatePickerField({ value, onChange, placeholder }: DatePickerFieldProps) {
  const theme = useTheme();
  const [isVisible, setVisible] = useState(false);
  // While the iOS sheet is open, the picker is uncontrolled from the parent's
  // perspective — it only reads `pendingDate` (updated locally on every
  // scroll tick) and commits to the parent once, on "Tamam". Feeding the
  // parent's `value` straight back into the native picker on every tick
  // fights the user's in-progress gesture (a known datetimepicker/iOS issue).
  const [pendingDate, setPendingDate] = useState<Date>(() => fromISO(value));

  function openPicker() {
    if (Platform.OS === 'android') {
      // Android's community-recommended API: an imperative dialog, not a
      // mounted component — the declarative <DateTimePicker> render-prop
      // form is unreliable on Android (selections can silently fail to
      // commit, especially on repeated opens).
      DateTimePickerAndroid.open({
        value: fromISO(value),
        mode: 'date',
        display: 'calendar',
        onChange: (event: DateTimePickerEvent, selected?: Date) => {
          if (event.type === 'set' && selected) onChange(toISO(selected));
        },
      });
      return;
    }
    setPendingDate(fromISO(value));
    setVisible(true);
  }

  function handleIOSChange(event: DateTimePickerEvent, selected?: Date) {
    if (event.type === 'dismissed' || !selected) return;
    setPendingDate(selected);
  }

  function confirmIOSDate() {
    onChange(toISO(pendingDate));
    setVisible(false);
  }

  return (
    <>
      <Pressable onPress={openPicker}>
        <View style={[styles.field, { borderColor: theme.backgroundSelected }]}>
          <ThemedText style={!value ? { color: theme.textSecondary } : undefined}>
            {value ? formatTurkishDate(value) : (placeholder ?? '📅 Tarih seç')}
          </ThemedText>
        </View>
      </Pressable>

      {Platform.OS === 'ios' && (
        <Modal visible={isVisible} animationType="fade" transparent onRequestClose={confirmIOSDate}>
          <View style={styles.overlay}>
            <View style={[styles.sheet, { backgroundColor: theme.backgroundElement }]}>
              <DateTimePicker
                value={pendingDate}
                mode="date"
                display="spinner"
                onChange={handleIOSChange}
              />
              <Pressable onPress={confirmIOSDate}>
                <View style={styles.doneButton}>
                  <ThemedText style={styles.doneButtonText}>Tamam</ThemedText>
                </View>
              </Pressable>
            </View>
          </View>
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
