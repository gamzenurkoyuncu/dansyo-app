import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DancerCard } from '@/components/dancer-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { Dancer, initialDancers, parseTurkishDate } from '@/data/mock-dancers';
import { useTheme } from '@/hooks/use-theme';

const PRIMARY_COLOR = '#3c87f7';

export default function DancersScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const [dancers, setDancers] = useState<Dancer[]>(initialDancers);
  const [isFormVisible, setFormVisible] = useState(false);
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [birthDateInput, setBirthDateInput] = useState('');
  const [schoolInput, setSchoolInput] = useState('');

  const parsedBirthDate = parseTurkishDate(birthDateInput);
  const canSubmit =
    firstNameInput.trim().length > 0 && lastNameInput.trim().length > 0 && parsedBirthDate !== null;

  function openAddForm() {
    setFirstNameInput('');
    setLastNameInput('');
    setBirthDateInput('');
    setSchoolInput('');
    setFormVisible(true);
  }

  function handleCancelForm() {
    setFormVisible(false);
  }

  function handleSaveDancer() {
    if (!canSubmit || !parsedBirthDate) return;

    const newDancer: Dancer = {
      id: Date.now().toString(),
      firstName: firstNameInput.trim(),
      lastName: lastNameInput.trim(),
      birthDate: parsedBirthDate,
      school: schoolInput.trim(),
    };

    setDancers((prev) => [...prev, newDancer]);
    setFormVisible(false);
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
            <View style={styles.headerText}>
              <ThemedText type="subtitle">Dansçılar</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {dancers.length} dansçı
              </ThemedText>
            </View>

            <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={openAddForm}>
              <View style={styles.addButton}>
                <ThemedText style={styles.addButtonText}>+ Dansçı Ekle</ThemedText>
              </View>
            </Pressable>
          </View>

          <View style={styles.list}>
            {dancers.map((dancer) => (
              <DancerCard key={dancer.id} dancer={dancer} />
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isFormVisible}
        animationType="slide"
        transparent
        onRequestClose={handleCancelForm}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <View style={styles.formHeader}>
              <View style={styles.formIcon}>
                <ThemedText style={styles.formIconGlyph}>➕</ThemedText>
              </View>
              <View style={styles.formHeaderText}>
                <ThemedText type="subtitle">Yeni Dansçı</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Dansçı bilgilerini gir
                </ThemedText>
              </View>
              <Pressable
                hitSlop={8}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                onPress={handleCancelForm}>
                <ThemedText style={styles.closeGlyph}>✕</ThemedText>
              </Pressable>
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                🧑 Ad
              </ThemedText>
              <TextInput
                value={firstNameInput}
                onChangeText={setFirstNameInput}
                placeholder="örn. Ela"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                Soyad
              </ThemedText>
              <TextInput
                value={lastNameInput}
                onChangeText={setLastNameInput}
                placeholder="örn. Yıldız"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                🎂 Doğum Tarihi (gg.aa.yyyy)
              </ThemedText>
              <TextInput
                value={birthDateInput}
                onChangeText={setBirthDateInput}
                placeholder="örn. 14.03.2016"
                keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
              {birthDateInput.length > 0 && !parsedBirthDate && (
                <ThemedText type="small" style={styles.errorText}>
                  Geçerli bir tarih gir (gg.aa.yyyy)
                </ThemedText>
              )}
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                🏫 Okul
              </ThemedText>
              <TextInput
                value={schoolInput}
                onChangeText={setSchoolInput}
                placeholder="örn. Atatürk İlkokulu"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
            </View>

            <Pressable
              disabled={!canSubmit}
              style={({ pressed }) => pressed && styles.pressed}
              onPress={handleSaveDancer}>
              <View
                style={[styles.primaryButton, styles.primaryButtonFull, !canSubmit && styles.disabledButton]}>
                <ThemedText style={styles.primaryButtonText}>Dansçı Ekle</ThemedText>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              onPress={handleCancelForm}>
              <ThemedText themeColor="textSecondary">İptal</ThemedText>
            </Pressable>
          </ThemedView>
        </KeyboardAvoidingView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.six,
  },
  headerText: {
    gap: Spacing.half,
  },
  addButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  list: {
    gap: Spacing.three,
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
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  formIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR + '26',
  },
  formIconGlyph: {
    fontSize: 18,
  },
  formHeaderText: {
    flex: 1,
    gap: Spacing.half,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128,128,128,0.14)',
  },
  closeGlyph: {
    fontSize: 13,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  errorText: {
    color: '#e05252',
  },
  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  primaryButtonFull: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  disabledButton: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
