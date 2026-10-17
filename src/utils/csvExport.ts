import { Share } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * CSV export: build the text, write it to the cache as a real `.csv` file and
 * open the share sheet (Files, email, Drive…). Where file sharing is not
 * available, the CSV is shared as text instead so the export never dead-ends.
 */

/** One cell: quoted when it holds a comma, quote or line break (RFC 4180). */
function cell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(
  header: readonly string[],
  rows: readonly (readonly (string | number | null | undefined)[])[],
): string {
  return [header, ...rows].map(row => row.map(cell).join(',')).join('\r\n');
}

/** `campaign-ledger-2026-10-16.csv`. */
export function datedFileName(prefix: string, now: Date = new Date()): string {
  return `${prefix}-${now.toISOString().slice(0, 10)}.csv`;
}

export async function shareCsv(
  fileName: string,
  csv: string,
  title: string,
): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    const file = new File(Paths.cache, fileName);
    if (file.exists) file.delete();
    file.create();
    file.write(csv);
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/csv',
      UTI: 'public.comma-separated-values-text',
      dialogTitle: title,
    });
    return;
  }
  await Share.share({ title, message: csv });
}

const UTI_BY_MIME: Record<string, string> = {
  'text/csv': 'public.comma-separated-values-text',
  'application/pdf': 'com.adobe.pdf',
};

/**
 * Share a file the API returned base64-encoded (an analytics report): written
 * to the cache under its own name, then handed to the share sheet. Returns
 * `false` when file sharing is unavailable on the device.
 */
export async function shareBase64File(
  fileName: string,
  base64: string,
  mimeType: string,
  title: string,
): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) return false;
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(base64, { encoding: 'base64' });
  await Sharing.shareAsync(file.uri, {
    mimeType,
    UTI: UTI_BY_MIME[mimeType],
    dialogTitle: title,
  });
  return true;
}
