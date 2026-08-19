export type Dancer = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string; // ISO date, e.g. '2015-04-12'
  school: string;
};

export const initialDancers: Dancer[] = [
  { id: '1', firstName: 'Ela', lastName: 'Yıldız', birthDate: '2016-03-14', school: 'Atatürk İlkokulu' },
  { id: '2', firstName: 'Kerem', lastName: 'Demir', birthDate: '2013-07-22', school: 'Cumhuriyet Ortaokulu' },
  { id: '3', firstName: 'Zeynep', lastName: 'Kaya', birthDate: '2010-11-05', school: 'Fatih Lisesi' },
  { id: '4', firstName: 'Mert', lastName: 'Şahin', birthDate: '2005-01-30', school: '-' },
];

export function getAge(birthDate: string): number | null {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;

  return age;
}

export function parseTurkishDate(input: string): string | null {
  const match = input.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10);
}

export function formatTurkishDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}
