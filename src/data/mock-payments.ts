export type PaymentRecord = {
  id: string;
  dancerId: string;
  month: string; // 'YYYY-MM'
  paid: boolean;
};

export const initialPaymentRecords: PaymentRecord[] = [
  { id: 'pay1', dancerId: '1', month: '2026-08', paid: true },
  { id: 'pay2', dancerId: '2', month: '2026-08', paid: false },
];

export function getCurrentMonthISO(): string {
  // Built from local date parts (no toISOString) so it reflects the
  // device's local "this month" rather than shifting with UTC offset.
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function parseTurkishMonth(input: string): string | null {
  const match = input.trim().match(/^(\d{1,2})\.(\d{4})$/);
  if (!match) return null;

  const [, month, year] = match;
  const monthNum = Number(month);
  if (monthNum < 1 || monthNum > 12) return null;

  return `${year}-${String(monthNum).padStart(2, '0')}`;
}

export function formatTurkishMonth(isoMonth: string): string {
  const match = isoMonth.match(/^(\d{4})-(\d{2})/);
  if (!match) return isoMonth;

  const [, year, month] = match;
  return `${month}.${year}`;
}

export function getPaymentStatus(
  records: PaymentRecord[],
  dancerId: string,
  month: string,
): boolean | undefined {
  return records.find((record) => record.dancerId === dancerId && record.month === month)?.paid;
}

export function setPayment(
  records: PaymentRecord[],
  dancerId: string,
  month: string,
  paid: boolean,
): PaymentRecord[] {
  const withoutRecord = records.filter(
    (record) => !(record.dancerId === dancerId && record.month === month),
  );
  return [...withoutRecord, { id: `${dancerId}-${month}`, dancerId, month, paid }];
}

export function getPaymentsForDancer(records: PaymentRecord[], dancerId: string): PaymentRecord[] {
  return records
    .filter((record) => record.dancerId === dancerId)
    .sort((a, b) => b.month.localeCompare(a.month));
}

export function getUnpaidCount(records: PaymentRecord[], month: string): number {
  return records.filter((record) => record.month === month && !record.paid).length;
}
