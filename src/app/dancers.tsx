import { useEffect, useState } from 'react';
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
import { formatTurkishMonth, getPaymentsForDancer } from '@/data/mock-payments';
import {
  getAttendanceForDancer,
  getAttendanceSummary,
  getConsecutiveAbsences,
  getTeamForDancer,
  TeamAssignment,
} from '@/data/mock-teams';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';

const PRIMARY_COLOR = '#3c87f7';
const DANGER_COLOR = '#e05252';
const SUCCESS_COLOR = '#27ae60';

function UndoDancerBanner({
  dancer,
  onUndo,
}: {
  dancer: Dancer | null;
  onUndo: () => void;
}) {
  if (!dancer) return null;
  return (
    <View style={styles.undoBar}>
      <ThemedText type="small" style={styles.undoText}>
        &quot;{dancer.firstName} {dancer.lastName}&quot; silindi
      </ThemedText>
      <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={onUndo}>
        <ThemedText type="small" style={styles.undoAction}>
          Geri Al
        </ThemedText>
      </Pressable>
    </View>
  );
}

export default function DancersScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const {
    dancers,
    setDancers,
    teams,
    assignments,
    setAssignments,
    currentSeason,
    attendanceRecords,
    paymentRecords,
  } = useAppData();
  const [isFormVisible, setFormVisible] = useState(false);
  const [editingDancerId, setEditingDancerId] = useState<string | null>(null);
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [birthDateInput, setBirthDateInput] = useState('');
  const [schoolInput, setSchoolInput] = useState('');
  const [feeInput, setFeeInput] = useState('');
  const [parentNameInput, setParentNameInput] = useState('');
  const [parentPhoneInput, setParentPhoneInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [costumeSizeInput, setCostumeSizeInput] = useState('');

  const [deletingDancer, setDeletingDancer] = useState<Dancer | null>(null);
  const [historyDancer, setHistoryDancer] = useState<Dancer | null>(null);
  const [paymentsDancer, setPaymentsDancer] = useState<Dancer | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');
  const [undoDancer, setUndoDancer] = useState<{
    dancer: Dancer;
    assignments: TeamAssignment[];
  } | null>(null);

  useEffect(() => {
    if (!undoDancer) return;
    const timer = setTimeout(() => setUndoDancer(null), 5000);
    return () => clearTimeout(timer);
  }, [undoDancer]);

  let bannerDancer: Dancer | null = null;
  if (undoDancer !== null) {
    bannerDancer = undoDancer.dancer;
  }

  const filteredDancers = dancers.filter((dancer) =>
    `${dancer.firstName} ${dancer.lastName}`
      .toLocaleLowerCase('tr')
      .includes(searchInput.trim().toLocaleLowerCase('tr')),
  );

  const groupedSections: { key: string; title: string; dancers: Dancer[] }[] = [];
  if (viewMode === 'grouped') {
    const byTeamId = new Map<string, Dancer[]>();
    for (const dancer of filteredDancers) {
      const team = getTeamForDancer(assignments, teams, dancer.id, currentSeason);
      const key = team ? team.id : 'unassigned';
      const existing = byTeamId.get(key);
      if (existing) {
        existing.push(dancer);
      } else {
        byTeamId.set(key, [dancer]);
      }
    }
    for (const team of teams) {
      const teamDancers = byTeamId.get(team.id);
      if (teamDancers && teamDancers.length > 0) {
        groupedSections.push({ key: team.id, title: team.name, dancers: teamDancers });
      }
    }
    const unassignedDancers = byTeamId.get('unassigned');
    if (unassignedDancers && unassignedDancers.length > 0) {
      groupedSections.push({ key: 'unassigned', title: 'Atanmamış', dancers: unassignedDancers });
    }
  }

  const parsedBirthDate = parseTurkishDate(birthDateInput);
  const parsedFee = Number(feeInput);
  const isFeeValid = feeInput.trim().length > 0 && Number.isFinite(parsedFee) && parsedFee >= 0;
  const canSubmit =
    firstNameInput.trim().length > 0 &&
    lastNameInput.trim().length > 0 &&
    parsedBirthDate !== null &&
    isFeeValid;

  function openAddForm() {
    setEditingDancerId(null);
    setFirstNameInput('');
    setLastNameInput('');
    setBirthDateInput('');
    setSchoolInput('');
    setFeeInput('');
    setParentNameInput('');
    setParentPhoneInput('');
    setHeightInput('');
    setWeightInput('');
    setCostumeSizeInput('');
    setFormVisible(true);
  }

  function openEditForm(dancer: Dancer) {
    setEditingDancerId(dancer.id);
    setFirstNameInput(dancer.firstName);
    setLastNameInput(dancer.lastName);
    setBirthDateInput(formatTurkishDate(dancer.birthDate));
    setSchoolInput(dancer.school);
    setFeeInput(String(dancer.monthlyFee));
    setParentNameInput(dancer.parentName);
    setParentPhoneInput(dancer.parentPhone);
    setHeightInput(dancer.height);
    setWeightInput(dancer.weight);
    setCostumeSizeInput(dancer.costumeSize);
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
                monthlyFee: parsedFee,
                parentName: parentNameInput.trim(),
                parentPhone: parentPhoneInput.trim(),
                height: heightInput.trim(),
                weight: weightInput.trim(),
                costumeSize: costumeSizeInput.trim(),
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
        monthlyFee: parsedFee,
        parentName: parentNameInput.trim(),
        parentPhone: parentPhoneInput.trim(),
        height: heightInput.trim(),
        weight: weightInput.trim(),
        costumeSize: costumeSizeInput.trim(),
      };
      setDancers((prev) => [...prev, newDancer]);
    }

    setFormVisible(false);
  }

  function handleConfirmDelete() {
    if (!deletingDancer) return;
    const dancerId = deletingDancer.id;
    const removedAssignments = assignments.filter((assignment) => assignment.dancerId === dancerId);
    setDancers((prev) => prev.filter((dancer) => dancer.id !== dancerId));
    setAssignments((prev) => prev.filter((assignment) => assignment.dancerId !== dancerId));
    setUndoDancer({ dancer: deletingDancer, assignments: removedAssignments });
    setDeletingDancer(null);
  }

  function handleUndoDelete() {
    if (!undoDancer) return;
    setDancers((prev) => [...prev, undoDancer.dancer]);
    setAssignments((prev) => [...prev, ...undoDancer.assignments]);
    setUndoDancer(null);
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

          <UndoDancerBanner dancer={bannerDancer} onUndo={handleUndoDelete} />

          <TextInput
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder="🔍 Dansçı ara"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />

          <View style={styles.viewModeRow}>
            <Pressable onPress={() => setViewMode('list')}>
              <View style={[styles.viewModeChip, viewMode === 'list' && styles.viewModeChipSelected]}>
                <ThemedText
                  type="small"
                  style={viewMode === 'list' ? styles.viewModeChipSelectedText : undefined}>
                  📋 Liste
                </ThemedText>
              </View>
            </Pressable>
            <Pressable onPress={() => setViewMode('grouped')}>
              <View
                style={[styles.viewModeChip, viewMode === 'grouped' && styles.viewModeChipSelected]}>
                <ThemedText
                  type="small"
                  style={viewMode === 'grouped' ? styles.viewModeChipSelectedText : undefined}>
                  🎽 Ekibe Göre
                </ThemedText>
              </View>
            </Pressable>
          </View>

          <View style={styles.list}>
            {filteredDancers.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                Aramanla eşleşen dansçı yok.
              </ThemedText>
            ) : viewMode === 'list' ? (
              filteredDancers.map((dancer) => (
                <DancerCard
                  key={dancer.id}
                  dancer={dancer}
                  teamName={getTeamForDancer(assignments, teams, dancer.id, currentSeason)?.name}
                  consecutiveAbsences={getConsecutiveAbsences(attendanceRecords, dancer.id)}
                  onEdit={() => openEditForm(dancer)}
                  onDelete={() => setDeletingDancer(dancer)}
                  onViewAttendance={() => setHistoryDancer(dancer)}
                  onViewPayments={() => setPaymentsDancer(dancer)}
                />
              ))
            ) : (
              groupedSections.map((section) => (
                <View key={section.key} style={styles.groupSection}>
                  <ThemedText type="smallBold" themeColor="textSecondary" style={styles.groupTitle}>
                    {section.title.toLocaleUpperCase('tr')} · {section.dancers.length}
                  </ThemedText>
                  <View style={styles.list}>
                    {section.dancers.map((dancer) => (
                      <DancerCard
                        key={dancer.id}
                        dancer={dancer}
                        teamName={
                          getTeamForDancer(assignments, teams, dancer.id, currentSeason)?.name
                        }
                        consecutiveAbsences={getConsecutiveAbsences(attendanceRecords, dancer.id)}
                        onEdit={() => openEditForm(dancer)}
                        onDelete={() => setDeletingDancer(dancer)}
                        onViewAttendance={() => setHistoryDancer(dancer)}
                        onViewPayments={() => setPaymentsDancer(dancer)}
                      />
                    ))}
                  </View>
                </View>
              ))
            )}
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

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                💰 Aylık Ücret (₺)
              </ThemedText>
              <TextInput
                value={feeInput}
                onChangeText={setFeeInput}
                placeholder="örn. 800"
                keyboardType="numeric"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
              {feeInput.length > 0 && !isFeeValid && (
                <ThemedText type="small" style={styles.errorText}>
                  Geçerli bir tutar gir
                </ThemedText>
              )}
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                👪 Veli Adı (opsiyonel)
              </ThemedText>
              <TextInput
                value={parentNameInput}
                onChangeText={setParentNameInput}
                placeholder="örn. Fatma Yıldız"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                📞 Veli Telefonu (opsiyonel)
              </ThemedText>
              <TextInput
                value={parentPhoneInput}
                onChangeText={setParentPhoneInput}
                placeholder="örn. 0532 111 22 33"
                keyboardType="phone-pad"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                📏 Boy (cm, opsiyonel)
              </ThemedText>
              <TextInput
                value={heightInput}
                onChangeText={setHeightInput}
                placeholder="örn. 138"
                keyboardType="numeric"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                ⚖️ Kilo (kg, opsiyonel)
              </ThemedText>
              <TextInput
                value={weightInput}
                onChangeText={setWeightInput}
                placeholder="örn. 32"
                keyboardType="numeric"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary">
                👗 Kostüm Bedeni (opsiyonel)
              </ThemedText>
              <TextInput
                value={costumeSizeInput}
                onChangeText={setCostumeSizeInput}
                placeholder="örn. S, 8 Yaş"
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

      <Modal
        visible={historyDancer !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setHistoryDancer(null)}>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <View style={styles.formHeader}>
              <View style={styles.formIcon}>
                <ThemedText style={styles.formIconGlyph}>🕐</ThemedText>
              </View>
              <View style={styles.formHeaderText}>
                <ThemedText type="subtitle">
                  {historyDancer?.firstName} {historyDancer?.lastName}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Yoklama geçmişi
                </ThemedText>
              </View>
              <Pressable
                hitSlop={8}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                onPress={() => setHistoryDancer(null)}>
                <ThemedText style={styles.closeGlyph}>✕</ThemedText>
              </Pressable>
            </View>

            {historyDancer &&
              (() => {
                const summary = getAttendanceSummary(attendanceRecords, historyDancer.id);
                return summary.total > 0 ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    Toplam {summary.total} kayıt · {summary.absent} devamsızlık (%
                    {Math.round(summary.absenceRate * 100)})
                  </ThemedText>
                ) : null;
              })()}

            <ScrollView style={styles.attendanceList}>
              {!historyDancer || getAttendanceForDancer(attendanceRecords, historyDancer.id).length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Henüz yoklama kaydı yok.
                </ThemedText>
              ) : (
                getAttendanceForDancer(attendanceRecords, historyDancer.id).map((record) => (
                  <View key={record.id} style={styles.attendanceRow}>
                    <View>
                      <ThemedText>{formatTurkishDate(record.date)}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {teams.find((team) => team.id === record.teamId)?.name ?? 'Bilinmeyen ekip'}
                      </ThemedText>
                    </View>
                    <ThemedText
                      type="small"
                      style={record.present ? styles.successText : styles.errorText}>
                      {record.present ? 'Var' : 'Yok'}
                    </ThemedText>
                  </View>
                ))
              )}
            </ScrollView>

            <Pressable
              style={({ pressed }) => pressed && styles.pressed}
              onPress={() => setHistoryDancer(null)}>
              <View style={[styles.primaryButton, styles.primaryButtonFull]}>
                <ThemedText style={styles.primaryButtonText}>Kapat</ThemedText>
              </View>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </Modal>

      <Modal
        visible={paymentsDancer !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setPaymentsDancer(null)}>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <View style={styles.formHeader}>
              <View style={styles.formIcon}>
                <ThemedText style={styles.formIconGlyph}>💰</ThemedText>
              </View>
              <View style={styles.formHeaderText}>
                <ThemedText type="subtitle">
                  {paymentsDancer?.firstName} {paymentsDancer?.lastName}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Ödeme geçmişi
                </ThemedText>
              </View>
              <Pressable
                hitSlop={8}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                onPress={() => setPaymentsDancer(null)}>
                <ThemedText style={styles.closeGlyph}>✕</ThemedText>
              </Pressable>
            </View>

            <ScrollView style={styles.attendanceList}>
              {!paymentsDancer || getPaymentsForDancer(paymentRecords, paymentsDancer.id).length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Henüz ödeme kaydı yok.
                </ThemedText>
              ) : (
                getPaymentsForDancer(paymentRecords, paymentsDancer.id).map((record) => (
                  <View key={record.id} style={styles.attendanceRow}>
                    <ThemedText>{formatTurkishMonth(record.month)}</ThemedText>
                    <ThemedText
                      type="small"
                      style={record.paid ? styles.successText : styles.errorText}>
                      {record.paid ? 'Ödendi' : 'Ödenmedi'}
                    </ThemedText>
                  </View>
                ))
              )}
            </ScrollView>

            <Pressable
              style={({ pressed }) => pressed && styles.pressed}
              onPress={() => setPaymentsDancer(null)}>
              <View style={[styles.primaryButton, styles.primaryButtonFull]}>
                <ThemedText style={styles.primaryButtonText}>Kapat</ThemedText>
              </View>
            </Pressable>
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
  viewModeRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  viewModeChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    backgroundColor: 'rgba(128,128,128,0.14)',
  },
  viewModeChipSelected: {
    backgroundColor: PRIMARY_COLOR,
  },
  viewModeChipSelectedText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  groupSection: {
    gap: Spacing.two,
  },
  groupTitle: {
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.one,
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
    color: DANGER_COLOR,
  },
  successText: {
    color: SUCCESS_COLOR,
  },
  undoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(128,128,128,0.14)',
  },
  undoText: {
    flex: 1,
  },
  undoAction: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  attendanceList: {
    maxHeight: 320,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
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
