import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import {
  formatTurkishMonth,
  getCurrentMonthISO,
  getPaymentStatus,
  parseTurkishMonth,
  setPayment,
} from '@/data/mock-payments';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';

const SUCCESS_COLOR = '#27ae60';
const DANGER_COLOR = '#e05252';

export default function PaymentsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const { dancers, paymentRecords, setPaymentRecords } = useAppData();

  const [monthInput, setMonthInput] = useState(formatTurkishMonth(getCurrentMonthISO()));

  const parsedMonth = parseTurkishMonth(monthInput);

  const rows = dancers.map((dancer) => ({
    dancer,
    paid: parsedMonth ? getPaymentStatus(paymentRecords, dancer.id, parsedMonth) : undefined,
  }));
  const paidCount = rows.filter((row) => row.paid === true).length;
  const unpaidCount = rows.filter((row) => row.paid === false).length;

  function handleMark(dancerId: string, paid: boolean) {
    if (!parsedMonth) return;
    setPaymentRecords((prev) => setPayment(prev, dancerId, parsedMonth, paid));
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
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Aidat</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {dancers.length} dansçı
          </ThemedText>
        </View>

        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary">
            📅 Ay (aa.yyyy)
          </ThemedText>
          <TextInput
            value={monthInput}
            onChangeText={setMonthInput}
            placeholder="örn. 08.2026"
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
          {monthInput.trim().length > 0 && !parsedMonth && (
            <ThemedText type="small" style={styles.errorText}>
              Geçerli bir ay gir (aa.yyyy)
            </ThemedText>
          )}
        </View>

        {parsedMonth && (
          <ThemedText type="small" themeColor="textSecondary">
            ✅ {paidCount} ödedi · ❌ {unpaidCount} ödemedi ·{' '}
            {rows.length - paidCount - unpaidCount} işaretlenmedi
          </ThemedText>
        )}

        <View style={styles.list}>
          {!parsedMonth ? (
            <ThemedText type="small" themeColor="textSecondary">
              Aidat işaretlemek için geçerli bir ay gir.
            </ThemedText>
          ) : rows.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              Henüz kayıtlı dansçı yok.
            </ThemedText>
          ) : (
            rows.map(({ dancer, paid }) => (
              <ThemedView key={dancer.id} type="backgroundElement" style={styles.dancerCard}>
                <View style={styles.dancerInfo}>
                  <ThemedText style={styles.dancerName}>
                    {dancer.firstName} {dancer.lastName}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {dancer.monthlyFee} ₺
                  </ThemedText>
                </View>
                <View style={styles.markButtons}>
                  <Pressable onPress={() => handleMark(dancer.id, true)}>
                    <View
                      style={[styles.markButton, paid === true && { backgroundColor: SUCCESS_COLOR }]}>
                      <ThemedText
                        type="small"
                        style={paid === true ? styles.markButtonSelectedText : styles.successText}>
                        Ödendi
                      </ThemedText>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => handleMark(dancer.id, false)}>
                    <View
                      style={[styles.markButton, paid === false && { backgroundColor: DANGER_COLOR }]}>
                      <ThemedText
                        type="small"
                        style={paid === false ? styles.markButtonSelectedText : styles.errorText}>
                        Ödenmedi
                      </ThemedText>
                    </View>
                  </Pressable>
                </View>
              </ThemedView>
            ))
          )}
        </View>
      </View>
    </ScrollView>
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
    gap: Spacing.half,
    paddingTop: Spacing.six,
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
  list: {
    gap: Spacing.three,
  },
  dancerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  dancerInfo: {
    gap: Spacing.half,
  },
  dancerName: {
    fontWeight: '700',
  },
  markButtons: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  markButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(128,128,128,0.14)',
  },
  markButtonSelectedText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
