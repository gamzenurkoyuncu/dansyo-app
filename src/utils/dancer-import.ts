import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';

import { Dancer, formatTurkishDate, parseTurkishDate } from '@/data/mock-dancers';

const EXCEL_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

export type ParsedDancerRow = {
  rowNumber: number;
  displayName: string;
  errors: string[];
  dancer: Omit<Dancer, 'id'> | null;
};

type DancerField = Exclude<keyof Dancer, 'id'>;

const HEADER_ALIASES: Record<string, DancerField> = {
  ad: 'firstName',
  soyad: 'lastName',
  'doğum tarihi': 'birthDate',
  'dogum tarihi': 'birthDate',
  'doğum tarihi (gg.aa.yyyy)': 'birthDate',
  okul: 'school',
  'aylık ücret': 'monthlyFee',
  'aylik ucret': 'monthlyFee',
  'aylık ücret (₺)': 'monthlyFee',
  'veli adı': 'parentName',
  'veli adi': 'parentName',
  'veli telefonu': 'parentPhone',
  boy: 'height',
  'boy (cm)': 'height',
  kilo: 'weight',
  'kilo (kg)': 'weight',
  'kostüm bedeni': 'costumeSize',
  'kostum bedeni': 'costumeSize',
};

export const TEMPLATE_HEADERS = [
  'Ad',
  'Soyad',
  'Doğum Tarihi',
  'Okul',
  'Aylık Ücret',
  'Veli Adı',
  'Veli Telefonu',
  'Boy',
  'Kilo',
  'Kostüm Bedeni',
];

function normalizeHeader(header: string): string {
  return header.trim().toLocaleLowerCase('tr');
}

function dateCellToISO(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function cellToText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return formatTurkishDate(dateCellToISO(value));
  return String(value).trim();
}

export function parseDancersWorkbook(data: ArrayBuffer | Uint8Array): ParsedDancerRow[] {
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  return rows.map((row, index) => {
    const raw: Partial<Record<DancerField, unknown>> = {};
    for (const [header, value] of Object.entries(row)) {
      const field = HEADER_ALIASES[normalizeHeader(header)];
      if (field && raw[field] === undefined) raw[field] = value;
    }

    const errors: string[] = [];

    const firstName = cellToText(raw.firstName);
    const lastName = cellToText(raw.lastName);
    if (!firstName) errors.push('Ad eksik');
    if (!lastName) errors.push('Soyad eksik');

    let birthDateISO: string | null = null;
    if (raw.birthDate instanceof Date) {
      birthDateISO = dateCellToISO(raw.birthDate);
    } else {
      const text = cellToText(raw.birthDate);
      birthDateISO = text ? parseTurkishDate(text) : null;
    }
    if (!birthDateISO) errors.push('Doğum tarihi geçersiz (gg.aa.yyyy)');

    const feeText = cellToText(raw.monthlyFee);
    const monthlyFee = Number(feeText);
    const isFeeValid = feeText.length > 0 && Number.isFinite(monthlyFee) && monthlyFee >= 0;
    if (!isFeeValid) errors.push('Aylık ücret geçersiz');

    const displayName = [firstName, lastName].filter((part) => part.length > 0).join(' ');

    if (errors.length > 0) {
      return { rowNumber: index + 2, displayName: displayName || `Satır ${index + 2}`, errors, dancer: null };
    }

    return {
      rowNumber: index + 2,
      displayName,
      errors: [],
      dancer: {
        firstName,
        lastName,
        birthDate: birthDateISO as string,
        school: cellToText(raw.school),
        monthlyFee,
        parentName: cellToText(raw.parentName),
        parentPhone: cellToText(raw.parentPhone),
        height: cellToText(raw.height),
        weight: cellToText(raw.weight),
        costumeSize: cellToText(raw.costumeSize),
      },
    };
  });
}

function buildTemplateWorkbook(): XLSX.WorkBook {
  const worksheet = XLSX.utils.aoa_to_sheet([
    TEMPLATE_HEADERS,
    [
      'Ela',
      'Yıldız',
      '14.03.2016',
      'Atatürk İlkokulu',
      '800',
      'Fatma Yıldız',
      '0532 111 22 33',
      '138',
      '32',
      '8-10 Yaş',
    ],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dansçılar');
  return workbook;
}

async function readAssetAsArrayBuffer(asset: DocumentPicker.DocumentPickerAsset): Promise<ArrayBuffer> {
  if (Platform.OS === 'web' && asset.file) {
    return asset.file.arrayBuffer();
  }
  const file = new File(asset.uri);
  return file.arrayBuffer();
}

export async function pickAndParseDancersFile(): Promise<ParsedDancerRow[] | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: EXCEL_MIME_TYPES,
    copyToCacheDirectory: true,
  });
  if (result.canceled || result.assets.length === 0) return null;

  const buffer = await readAssetAsArrayBuffer(result.assets[0]);
  return parseDancersWorkbook(buffer);
}

const TEMPLATE_FILE_NAME = 'dansyo-dansci-sablonu.xlsx';
const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export async function shareDancerImportTemplate(): Promise<void> {
  const workbook = buildTemplateWorkbook();

  if (Platform.OS === 'web') {
    XLSX.writeFile(workbook, TEMPLATE_FILE_NAME);
    return;
  }

  const arrayBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  const bytes = new Uint8Array(arrayBuffer);
  const file = new File(Paths.cache, TEMPLATE_FILE_NAME);
  file.create({ overwrite: true });
  file.write(bytes);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: XLSX_MIME_TYPE,
      dialogTitle: 'Şablonu Paylaş',
    });
  }
}
