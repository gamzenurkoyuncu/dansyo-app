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
import { DatePickerField } from '@/components/date-picker-field';
import { getAccentColor } from '@/components/team-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { Dancer, formatTurkishDate, getAge } from '@/data/mock-dancers';
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
import {
  ParsedDancerRow,
  pickAndParseDancersFile,
  shareDancerImportTemplate,
  TEMPLATE_HEADERS,
} from '@/utils/dancer-import';
import { shareText } from '@/utils/share';

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
  const [birthDateISO, setBirthDateISO] = useState<string | null>(null);
  const [schoolInput, setSchoolInput] = useState('');
  const [feeInput, setFeeInput] = useState('');
  const [parentNameInput, setParentNameInput] = useState('');
  const [parentPhoneInput, setParentPhoneInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [costumeSizeInput, setCostumeSizeInput] = useState('');

  const [deletingDancer, setDeletingDancer] = useState<Dancer | null>(null);
  const [profileDancerId, setProfileDancerId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');
  const [undoDancer, setUndoDancer] = useState<{
    dancer: Dancer;
    assignments: TeamAssignment[];
  } | null>(null);
  const [isImportVisible, setImportVisible] = useState(false);
  const [importRows, setImportRows] = useState<ParsedDancerRow[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (!undoDancer) return;
    const timer = setTimeout(() => setUndoDancer(null), 5000);
    return () => clearTimeout(timer);
  }, [undoDancer]);

  let bannerDancer: Dancer | null = null;
  if (undoDancer !== null) {
    bannerDancer = undoDancer.dancer;
  }

  const profileDancer = dancers.find((dancer) => dancer.id === profileDancerId) ?? null;

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

  const parsedFee = Number(feeInput);
  const isFeeValid = feeInput.trim().length > 0 && Number.isFinite(parsedFee) && parsedFee >= 0;
  const canSubmit =
    firstNameInput.trim().length > 0 &&
    lastNameInput.trim().length > 0 &&
    birthDateISO !== null &&
    isFeeValid;

  function openAddForm() {
    setEditingDancerId(null);
    setFirstNameInput('');
    setLastNameInput('');
    setBirthDateISO(null);
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
    setBirthDateISO(dancer.birthDate);
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
    if (!canSubmit || !birthDateISO) return;

    if (editingDancerId) {
      setDancers((prev) =>
        prev.map((dancer) =>
          dancer.id === editingDancerId
            ? {
                ...dancer,
                firstName: firstNameInput.trim(),
                lastName: lastNameInput.trim(),
                birthDate: birthDateISO,
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
        birthDate: birthDateISO,
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

  function handleShare() {
    const lines = filteredDancers.map((dancer) => {
      const age = getAge(dancer.birthDate);
      const teamName = getTeamForDancer(assignments, teams, dancer.id, currentSeason)?.name;
      const parts = [
        `${dancer.firstName} ${dancer.lastName}`,
        age !== null ? `${age} yaş` : null,
        teamName,
        dancer.school || null,
      ].filter((part): part is string => Boolean(part));
      return `- ${parts.join(' · ')}`;
    });
    const message = `DansYo - Dansçılar (${currentSeason})\n\n${lines.join('\n')}`;
    shareText(message);
  }

  async function handlePickImportFile() {
    setImportError(null);
    setIsImporting(true);
    try {
      const rows = await pickAndParseDancersFile();
      if (rows !== null) {
        setImportRows(rows);
      }
    } catch {
      setImportError('Dosya okunamadı. Lütfen geçerli bir Excel (.xlsx) dosyası seç.');
    } finally {
      setIsImporting(false);
    }
  }

  function handleCloseImport() {
    setImportVisible(false);
    setImportRows(null);
    setImportError(null);
  }

  function handleConfirmImport() {
    if (!importRows) return;
    const validRows = importRows.filter((row) => row.dancer !== null);
    if (validRows.length === 0) return;
    const newDancers: Dancer[] = validRows.map((row, index) => ({
      ...(row.dancer as Omit<Dancer, 'id'>),
      id: `${Date.now()}-${index}`,
    }));
    setDancers((prev) => [...prev, ...newDancers]);
    handleCloseImport();
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

            <View style={styles.headerActions}>
              <Pressable
                hitSlop={8}
                style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}
                onPress={handleShare}>
                <ThemedText style={styles.shareButtonGlyph}>📤</ThemedText>
              </Pressable>
              <Pressable
                hitSlop={8}
                style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}
                onPress={() => setImportVisible(true)}>
                <ThemedText style={styles.shareButtonGlyph}>📥</ThemedText>
              </Pressable>
              <Pressable style={({ pressed }) => pressed && styles.pressed} onPress={openAddForm}>
                <View style={styles.addButton}>
                  <ThemedText style={styles.addButtonText}>+ Dansçı Ekle</ThemedText>
                </View>
              </Pressable>
            </View>
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
                  onPress={() => setProfileDancerId(dancer.id)}
                  onEdit={() => openEditForm(dancer)}
                  onDelete={() => setDeletingDancer(dancer)}
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
                        onPress={() => setProfileDancerId(dancer.id)}
                        onEdit={() => openEditForm(dancer)}
                        onDelete={() => setDeletingDancer(dancer)}
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
          <ThemedView type="backgroundElement" style={[styles.modalCard, styles.scrollableModalCard]}>
            <ScrollView contentContainerStyle={styles.formScrollContent}>
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
                🎂 Doğum Tarihi
              </ThemedText>
              <DatePickerField
                value={birthDateISO}
                onChange={setBirthDateISO}
                placeholder="Doğum tarihi seç"
              />
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
            </ScrollView>
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
        visible={profileDancer !== null}
        animationType="slide"
        onRequestClose={() => setProfileDancerId(null)}>
        <ThemedView style={styles.profileScreen}>
          <ScrollView
            contentInset={insets}
            contentContainerStyle={[styles.profileContent, contentPlatformStyle]}>
            <View style={styles.profileInner}>
              <View style={styles.profileTopBar}>
                <Pressable
                  hitSlop={8}
                  style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                  onPress={() => setProfileDancerId(null)}>
                  <ThemedText style={styles.closeGlyph}>✕</ThemedText>
                </Pressable>
              </View>

              {profileDancer && (
                <ProfileContent
                  dancer={profileDancer}
                  teamName={
                    getTeamForDancer(assignments, teams, profileDancer.id, currentSeason)?.name
                  }
                  attendanceRecords={attendanceRecords}
                  paymentRecords={paymentRecords}
                  teams={teams}
                />
              )}
            </View>
          </ScrollView>
        </ThemedView>
      </Modal>

      <Modal
        visible={isImportVisible}
        animationType="slide"
        transparent
        onRequestClose={handleCloseImport}>
        <ThemedView style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={[styles.modalCard, styles.scrollableModalCard]}>
            <View style={styles.formHeader}>
              <View style={[styles.formIcon, { backgroundColor: PRIMARY_COLOR + '26' }]}>
                <ThemedText style={styles.formIconGlyph}>📥</ThemedText>
              </View>
              <View style={styles.formHeaderText}>
                <ThemedText type="subtitle">Dansçıları İçe Aktar</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {importRows
                    ? `${importRows.filter((row) => row.dancer !== null).length} geçerli · ${importRows.filter((row) => row.dancer === null).length} hatalı`
                    : 'Excel dosyasından toplu ekle'}
                </ThemedText>
              </View>
              <Pressable
                hitSlop={8}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                onPress={handleCloseImport}>
                <ThemedText style={styles.closeGlyph}>✕</ThemedText>
              </Pressable>
            </View>

            {importRows === null ? (
              <View style={styles.importStart}>
                <ThemedText type="small" themeColor="textSecondary">
                  Beklenen sütunlar: {TEMPLATE_HEADERS.join(', ')}. Ad, Soyad, Doğum Tarihi ve Aylık
                  Ücret zorunludur.
                </ThemedText>

                {importError && (
                  <ThemedText type="small" style={styles.errorText}>
                    {importError}
                  </ThemedText>
                )}

                <Pressable
                  style={({ pressed }) => pressed && styles.pressed}
                  onPress={shareDancerImportTemplate}>
                  <ThemedText type="small" style={styles.templateLink}>
                    📄 Örnek Şablonu İndir
                  </ThemedText>
                </Pressable>

                <Pressable
                  disabled={isImporting}
                  style={({ pressed }) => pressed && styles.pressed}
                  onPress={handlePickImportFile}>
                  <View
                    style={[styles.primaryButton, styles.primaryButtonFull, isImporting && styles.disabledButton]}>
                    <ThemedText style={styles.primaryButtonText}>
                      {isImporting ? 'Okunuyor…' : '📁 Excel Dosyası Seç'}
                    </ThemedText>
                  </View>
                </Pressable>
              </View>
            ) : (
              <>
                <ScrollView contentContainerStyle={styles.importScrollContent}>
                  {importRows.length === 0 ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      Dosyada satır bulunamadı.
                    </ThemedText>
                  ) : (
                    importRows.map((row) => (
                      <View key={row.rowNumber} style={styles.importRow}>
                        <ThemedText style={styles.importRowStatus}>
                          {row.dancer ? '✅' : '❌'}
                        </ThemedText>
                        <View style={styles.importRowText}>
                          <ThemedText style={styles.dancerName}>{row.displayName}</ThemedText>
                          {row.errors.length > 0 && (
                            <ThemedText type="small" style={styles.errorText}>
                              {row.errors.join(', ')}
                            </ThemedText>
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>

                <Pressable
                  disabled={importRows.filter((row) => row.dancer !== null).length === 0}
                  style={({ pressed }) => pressed && styles.pressed}
                  onPress={handleConfirmImport}>
                  <View
                    style={[
                      styles.primaryButton,
                      styles.primaryButtonFull,
                      importRows.filter((row) => row.dancer !== null).length === 0 &&
                        styles.disabledButton,
                    ]}>
                    <ThemedText style={styles.primaryButtonText}>
                      {importRows.filter((row) => row.dancer !== null).length} Dansçıyı Ekle
                    </ThemedText>
                  </View>
                </Pressable>
              </>
            )}

            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              onPress={handleCloseImport}>
              <ThemedText themeColor="textSecondary">İptal</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </Modal>
    </>
  );
}

function ProfileContent({
  dancer,
  teamName,
  attendanceRecords,
  paymentRecords,
  teams,
}: {
  dancer: Dancer;
  teamName?: string;
  attendanceRecords: ReturnType<typeof useAppData>['attendanceRecords'];
  paymentRecords: ReturnType<typeof useAppData>['paymentRecords'];
  teams: ReturnType<typeof useAppData>['teams'];
}) {
  const accent = getAccentColor(dancer.id);
  const age = getAge(dancer.birthDate);
  const initials = `${dancer.firstName.charAt(0)}${dancer.lastName.charAt(0)}`.toUpperCase();
  const attendanceSummary = getAttendanceSummary(attendanceRecords, dancer.id);
  const attendanceHistory = getAttendanceForDancer(attendanceRecords, dancer.id);
  const paymentHistory = getPaymentsForDancer(paymentRecords, dancer.id);

  const infoRows: { label: string; value: string }[] = [];
  if (dancer.school) infoRows.push({ label: '🏫 Okul', value: dancer.school });
  if (dancer.parentName) infoRows.push({ label: '👪 Veli', value: dancer.parentName });
  if (dancer.parentPhone) infoRows.push({ label: '📞 Telefon', value: dancer.parentPhone });
  if (dancer.height) infoRows.push({ label: '📏 Boy', value: `${dancer.height} cm` });
  if (dancer.weight) infoRows.push({ label: '⚖️ Kilo', value: `${dancer.weight} kg` });
  if (dancer.costumeSize) infoRows.push({ label: '👗 Kostüm Bedeni', value: dancer.costumeSize });

  return (
    <>
      <View style={styles.profileHero}>
        <View style={[styles.profileAvatar, { backgroundColor: accent + '33' }]}>
          <ThemedText style={[styles.profileAvatarText, { color: accent }]}>{initials}</ThemedText>
        </View>
        <ThemedText type="subtitle" style={styles.profileName}>
          {dancer.firstName} {dancer.lastName}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {age !== null ? `${age} yaş` : 'Doğum tarihi geçersiz'} ·{' '}
          {formatTurkishDate(dancer.birthDate)}
        </ThemedText>
        {teamName && (
          <View style={[styles.teamPill, { backgroundColor: accent + '26' }]}>
            <ThemedText type="small" style={[styles.teamPillText, { color: accent }]}>
              {teamName}
            </ThemedText>
          </View>
        )}
      </View>

      {infoRows.length > 0 && (
        <View style={styles.profileSection}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.groupTitle}>
            BİLGİLER
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.profileCard}>
            {infoRows.map((row, index) => (
              <View
                key={row.label}
                style={[styles.profileRow, index < infoRows.length - 1 && styles.profileRowDivider]}>
                <ThemedText type="small" themeColor="textSecondary">
                  {row.label}
                </ThemedText>
                <ThemedText type="small">{row.value}</ThemedText>
              </View>
            ))}
          </ThemedView>
        </View>
      )}

      <View style={styles.profileSection}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.groupTitle}>
          YOKLAMA
        </ThemedText>
        <ThemedView type="backgroundElement" style={styles.profileCard}>
          {attendanceSummary.total > 0 && (
            <View style={[styles.profileRow, styles.profileRowDivider]}>
              <ThemedText type="small" themeColor="textSecondary">
                Özet
              </ThemedText>
              <ThemedText type="small">
                {attendanceSummary.total} kayıt · {attendanceSummary.absent} devamsızlık (%
                {Math.round(attendanceSummary.absenceRate * 100)})
              </ThemedText>
            </View>
          )}
          {attendanceHistory.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.profileEmptyRow}>
              Henüz yoklama kaydı yok.
            </ThemedText>
          ) : (
            attendanceHistory.map((record, index) => (
              <View
                key={record.id}
                style={[
                  styles.profileRow,
                  index < attendanceHistory.length - 1 && styles.profileRowDivider,
                ]}>
                <View>
                  <ThemedText type="small">{formatTurkishDate(record.date)}</ThemedText>
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
        </ThemedView>
      </View>

      <View style={styles.profileSection}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.groupTitle}>
          ÖDEME
        </ThemedText>
        <ThemedView type="backgroundElement" style={styles.profileCard}>
          {paymentHistory.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.profileEmptyRow}>
              Henüz ödeme kaydı yok.
            </ThemedText>
          ) : (
            paymentHistory.map((record, index) => (
              <View
                key={record.id}
                style={[
                  styles.profileRow,
                  index < paymentHistory.length - 1 && styles.profileRowDivider,
                ]}>
                <ThemedText type="small">{formatTurkishMonth(record.month)}</ThemedText>
                <ThemedText
                  type="small"
                  style={record.paid ? styles.successText : styles.errorText}>
                  {record.paid ? 'Ödendi' : 'Ödenmedi'}
                </ThemedText>
              </View>
            ))
          )}
        </ThemedView>
      </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128,128,128,0.14)',
  },
  shareButtonGlyph: {
    fontSize: 16,
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
  scrollableModalCard: {
    maxHeight: '85%',
    gap: 0,
  },
  formScrollContent: {
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
  teamPill: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.five,
    marginTop: Spacing.one,
  },
  teamPillText: {
    fontWeight: '700',
  },
  profileScreen: {
    flex: 1,
  },
  profileContent: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  profileInner: {
    maxWidth: MaxContentWidth,
    width: '100%',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  profileTopBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  profileHero: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  profileAvatarText: {
    fontWeight: '700',
    fontSize: 22,
  },
  profileName: {
    textAlign: 'center',
  },
  profileSection: {
    gap: Spacing.two,
  },
  profileCard: {
    borderRadius: Spacing.four,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  profileRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  profileEmptyRow: {
    padding: Spacing.three,
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
  dancerName: {
    fontWeight: '700',
  },
  importScrollContent: {
    gap: Spacing.two,
  },
  importStart: {
    gap: Spacing.three,
  },
  importRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  importRowStatus: {
    fontSize: 16,
  },
  importRowText: {
    flex: 1,
    gap: Spacing.half,
  },
  templateLink: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
    textAlign: 'center',
  },
});
