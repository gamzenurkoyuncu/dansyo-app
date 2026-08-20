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
import { Dancer, formatTurkishDate, parseTurkishDate } from '@/data/mock-dancers';
import { CURRENT_SEASON, getTeamForDancer } from '@/data/mock-teams';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';

const PRIMARY_COLOR = '#3c87f7';
const DANGER_COLOR = '#e05252';

export default function DancersScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const { dancers, setDancers, teams, assignments, setAssignments } = useAppData();
  const [isFormVisible, setFormVisible] = useState(false);
  const [editingDancerId, setEditingDancerId] = useState<string | null>(null);
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [birthDateInput, setBirthDateInput] = useState('');
  const [schoolInput, setSchoolInput] = useState('');

  const [deletingDancer, setDeletingDancer] = useState<Dancer | null>(null);

  const parsedBirthDate = parseTurkishDate(birthDateInput);
  const canSubmit =
    firstNameInput.trim().length > 0 && lastNameInput.trim().length > 0 && parsedBirthDate !== null;

  function openAddForm() {
    setEditingDancerId(null);
    setFirstNameInput('');
    setLastNameInput('');
    setBirthDateInput('');
    setSchoolInput('');
    setFormVisible(true);
  }

  function openEditForm(dancer: Dancer) {
    setEditingDancerId(dancer.id);
    setFirstNameInput(dancer.firstName);
    setLastNameInput(dancer.lastName);
    setBirthDateInput(formatTurkishDate(dancer.birthDate));
    setSchoolInput(dancer.school);
    setFormVisible(true);
  }

  function handleCancelForm() {
    setFormVisible(false);
  }

  function handleSaveDancer() {
    if (!canSubmit || !parsedBirthDate) return;

    if (editingDancerId) {
      setDancers((prev) =>
        prev.map((dancer) =>
          dancer.id === editingDancerId
            ? {
                ...dancer,
                firstName: firstNameInput.trim(),
                lastName: lastNameInput.trim(),
                birthDate: parsedBirthDate,
                school: schoolInput.trim(),
              }
            : dancer,
        ),
      );
    } else {
      const newDancer: Dancer = {
        id: Date.now().toString(),
        firstName: firstNameInput.trim(),
        lastName: lastNameInput.trim(),
        birthDate: parsedBirthDate,
        school: schoolInput.trim(),
      };
      setDancers((prev) => [...prev, newDancer]);
    }

    setFormVisible(false);
  }

  function handleConfirmDelete() {
    if (!deletingDancer) return;
    const dancerId = deletingDancer.id;
    setDancers((prev) => prev.filter((dancer) => dancer.id !== dancerId));
    setAssignments((prev) => prev.filter((assignment) => assignment.dancerId !== dancerId));
    setDeletingDancer(null);
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
              <DancerCard
                key={dancer.id}
                dancer={dancer}
                teamName={getTeamForDancer(assignments, teams, dancer.id, CURRENT_SEASON)?.name}
                onEdit={() => openEditForm(dancer)}
                onDelete={() => setDeletingDancer(dancer)}
              />
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
                <ThemedText style={styles.formIconGlyph}>{editingDancerId ? '✏️' : '➕'}</ThemedText>
              </View>
              <View style={styles.formHeaderText}>
                <ThemedText type="subtitle">
                  {editingDancerId ? 'Dansçıyı Düzenle' : 'Yeni Dansçı'}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {editingDancerId ? 'Bilgileri güncelle' : 'Dansçı bilgilerini gir'}
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
                <ThemedText style={styles.primaryButtonText}>
                  {editingDancerId ? 'Kaydet' : 'Dansçı Ekle'}
                </ThemedText>
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

      <Modal
        visible={deletingDancer !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setDeletingDancer(null)}>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <ThemedText type="subtitle">Dansçıyı Sil</ThemedText>
            <ThemedText>
              &quot;{deletingDancer?.firstName} {deletingDancer?.lastName}&quot; kaydını silmek
              istediğine emin misin? Bu işlem geri alınamaz.
            </ThemedText>
            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => pressed && styles.pressed}
                onPress={() => setDeletingDancer(null)}>
                <ThemedText themeColor="textSecondary">Vazgeç</ThemedText>
              </Pressable>
              <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={handleConfirmDelete}>
                <View style={styles.dangerButton}>
                  <ThemedText style={styles.primaryButtonText}>Sil</ThemedText>
                </View>
              </Pressable>
            </View>
          </ThemedView>
        </ThemedView>
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.four,
    paddingTop: Spacing.two,
  },
  dangerButton: {
    backgroundColor: DANGER_COLOR,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
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
