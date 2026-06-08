/**
 * googleSheets.ts — Shared Google Sheets utility
 * All sheet reads/writes go through this module.
 */

import { google } from 'googleapis';

function getAuth() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64
    ? JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64, 'base64').toString())
    : {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key:  (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
      };

  return new google.auth.JWT(
    keyJson.client_email,
    undefined,
    keyJson.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
}

const sheetsApi = google.sheets({ version: 'v4', auth: getAuth() });

/** Read all rows from a named tab. Returns string[][] (includes header row). */
export async function readSheetTab(sheetId: string, tabName: string): Promise<string[][]> {
  const response = await sheetsApi.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range:         `${tabName}!A:ZZ`,
  });
  return (response.data.values as string[][]) ?? [];
}

/** Append a single row to a named tab. */
export async function appendToSheet(
  sheetId: string,
  tabName: string,
  row: (string | number | boolean | null)[]
): Promise<void> {
  await sheetsApi.spreadsheets.values.append({
    spreadsheetId:     sheetId,
    range:             `${tabName}!A1`,
    valueInputOption:  'USER_ENTERED',
    requestBody:       { values: [row.map(v => v === null ? '' : String(v))] },
  });
}

/** Update a sheet cell by row identifier (finds row where column A matches key). */
export async function updateSheetRow(
  sheetId: string,
  tabName: string,
  rowKey: string,
  updates: Record<string, unknown>
): Promise<void> {
  // Read current data to find the row
  const rows = await readSheetTab(sheetId, tabName);
  const header = rows[0] ?? [];
  const rowIdx = rows.findIndex((r, i) => i > 0 && (r[0] === rowKey || `${r[0]}|${r[1]}` === rowKey));

  if (rowIdx === -1) {
    console.warn(`[googleSheets] Row not found for key "${rowKey}" in ${tabName}`);
    return;
  }

  // Build update values
  const currentRow = [...rows[rowIdx]];
  for (const [key, value] of Object.entries(updates)) {
    const colIdx = header.indexOf(key);
    if (colIdx >= 0) {
      currentRow[colIdx] = String(value ?? '');
    }
  }

  const sheetRowNumber = rowIdx + 1; // 1-indexed
  await sheetsApi.spreadsheets.values.update({
    spreadsheetId:    sheetId,
    range:            `${tabName}!A${sheetRowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody:      { values: [currentRow] },
  });
}

/** Update a specific cell by A1 notation. */
export async function updateSheetCell(
  sheetId: string,
  tabName: string,
  cellA1: string,
  value: string | number | boolean
): Promise<void> {
  await sheetsApi.spreadsheets.values.update({
    spreadsheetId:    sheetId,
    range:            `${tabName}!${cellA1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody:      { values: [[String(value)]] },
  });
}
