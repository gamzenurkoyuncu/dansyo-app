export type Dancer = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string; // ISO date, e.g. '2015-04-12'
  school: string;
  monthlyFee: number;
  parentName: string;
  parentPhone: string;
};

export const initialDancers: Dancer[] = [
  {
    id: '1',
    firstName: 'Ela',
    lastName: 'Yıldız',
    birthDate: '2016-03-14',
    school: 'Atatürk İlkokulu',
    monthlyFee: 800,
    parentName: 'Fatma Yıldız',
    parentPhone: '0532 111 22 33',
  },
  {
    id: '2',
    firstName: 'Kerem',
    lastName: 'Demir',
    birthDate: '2013-07-22',
    school: 'Cumhuriyet Ortaokulu',
    monthlyFee: 800,
    parentName: 'Ahmet Demir',
    parentPhone: '0533 222 33 44',
  },
  {
    id: '3',
    firstName: 'Zeynep',
    lastName: 'Kaya',
    birthDate: '2010-11-05',
    school: 'Fatih Lisesi',
    monthlyFee: 900,
    parentName: '',
    parentPhone: '',
  },
  {
    id: '4',
    firstName: 'Mert',
    lastName: 'Şahin',
    birthDate: '2005-01-30',
    school: '-',
    monthlyFee: 1000,
    parentName: '',
    parentPhone: '',
  },
];

export function getAge(birthDate: string): number | null {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, birthYear, birthMonth, birthDay] = match;

  // Compared as local date parts (not via Date parsing of the ISO string,
  // which JS treats as UTC) so this doesn't drift by a day near the
  // birthday depending on the device's timezone.
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  let age = now.getFullYear() - Number(birthYear);
  const hasHadBirthdayThisYear =
    currentMonth > Number(birthMonth) ||
    (currentMonth === Number(birthMonth) && currentDay >= Number(birthDay));
  if (!hasHadBirthdayThisYear) age -= 1;

  return age;
}

export function parseTurkishDate(input: string): string | null {
  const match = input.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  const dayNum = Number(day);
  const monthNum = Number(month);
  if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) return null;

  // Built as plain strings (no Date/toISOString) so the result never shifts
  // by a day depending on the device's timezone.
  return `${year}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
}

export function addDaysToISO(isoDate: string, days: number): string {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return isoDate;

  const [, year, month, day] = match;
  // Constructed from local date parts (no toISOString) so day arithmetic
  // stays in local time and doesn't drift by a day near midnight.
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  date.setDate(date.getDate() + days);

  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, '0');
  const newDay = String(date.getDate()).padStart(2, '0');
  return `${newYear}-${newMonth}-${newDay}`;
}

export function formatTurkishDate(isoDate: string): string {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return isoDate;

  const [, year, month, day] = match;
  return `${day}.${month}.${year}`;
}
