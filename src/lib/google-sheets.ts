import { GoogleAuth } from 'google-auth-library';
import type { DlbSubmission } from './dlb-initiative';

export const DLB_WORKSHEET_NAME = 'submissions';

export const DLB_SHEET_HEADERS = [
  'Application ID',
  'Submitted At',
  'Status',
  'Email Status',
  'Name',
  'Age',
  'Governorate',
  'Study / Work Status',
  'Study / Work Details',
  'Proud Achievement',
  'Initiative Reason',
  'Expected Outcome',
  'If Not Accepted',
  'Has Project Idea',
  'Project Idea',
  'Desired Field',
  'Biggest Fear',
  'Failure Story',
  'Idea Change Reaction',
  'Biggest Strength',
  'Trait To Improve',
  'Letter To Future Self',
  'WhatsApp',
  'Email',
  'Privacy Accepted',
  'User Agent',
  'Client IP',
  'Submission Source',
] as const;

export type DlbSheetState = {
  applicationIds: string[];
  emails: Set<string>;
  whatsapps: Set<string>;
};

export type DlbSheetRow = {
  applicationId: string;
  submittedAt: string;
  emailStatus: 'Pending' | 'Sent' | 'Failed';
  submission: DlbSubmission;
  userAgent: string;
  clientIp: string;
};

export interface DlbSheetsService {
  readState(stage?: (stage: string) => void): Promise<DlbSheetState>;
  appendSubmission(row: DlbSheetRow, stage?: (stage: string) => void): Promise<number>;
  updateEmailStatus(
    rowNumber: number,
    status: 'Sent' | 'Failed',
    stage?: (stage: string) => void,
  ): Promise<void>;
}

export interface DlbHeaderStore {
  readHeader(): Promise<unknown[]>;
  writeHeader(headers: readonly string[]): Promise<void>;
}

export class DlbHeaderSchemaMismatchError extends Error {
  constructor() {
    super('DLB worksheet header schema mismatch.');
    this.name = 'DlbHeaderSchemaMismatchError';
  }
}

type GoogleSheetsConfig = {
  spreadsheetId: string;
  serviceAccountEmail: string;
  privateKey: string;
};

type ValuesResponse = {
  values?: unknown[][];
  updates?: { updatedRange?: string };
};

type SpreadsheetMetadataResponse = {
  properties?: { title?: string };
  sheets?: Array<{ properties?: { title?: string } }>;
};

const PRIVATE_KEY_BEGIN = '-----BEGIN PRIVATE KEY-----';
const PRIVATE_KEY_END = '-----END PRIVATE KEY-----';

function removeMatchingOuterQuotes(value: string): string {
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function decodeBase64PrivateKey(value: string): string {
  const encoded = value.trim();
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded) || encoded.length % 4 !== 0) {
    throw new Error('DLB Google private key Base64 value is invalid.');
  }

  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  if (Buffer.from(decoded, 'utf8').toString('base64') !== encoded) {
    throw new Error('DLB Google private key Base64 value is invalid.');
  }
  return decoded;
}

export function resolveGooglePrivateKey(
  directValue: string | undefined,
  base64Value?: string,
): string {
  const resolved = base64Value?.trim()
    ? decodeBase64PrivateKey(base64Value)
    : directValue ?? '';
  const normalized = removeMatchingOuterQuotes(resolved.trim())
    .replace(/\\n/g, '\n')
    .replace(/\r\n?/g, '\n')
    .trim();

  if (!normalized.startsWith(PRIVATE_KEY_BEGIN) || !normalized.endsWith(PRIVATE_KEY_END)) {
    throw new Error('DLB Google private key must be a PKCS#8 PEM value.');
  }
  return normalized;
}

function isCompletelyEmptyHeader(header: readonly unknown[]): boolean {
  return header.every((value) => value === '' || value === null || value === undefined);
}

function assertExactHeaders(header: readonly unknown[]): void {
  const mismatch = header.length !== DLB_SHEET_HEADERS.length ||
    DLB_SHEET_HEADERS.some((expected, index) => header[index] !== expected);
  if (mismatch) throw new DlbHeaderSchemaMismatchError();
}

export async function ensureDlbSheetHeaders(store: DlbHeaderStore): Promise<void> {
  let header = await store.readHeader();
  if (isCompletelyEmptyHeader(header)) {
    await store.writeHeader(DLB_SHEET_HEADERS);
    header = await store.readHeader();
  }
  assertExactHeaders(header);
}

export function buildDlbSheetRow(row: DlbSheetRow): Array<string | number> {
  const submission = row.submission;
  return [
    row.applicationId,
    row.submittedAt,
    'New',
    row.emailStatus,
    submission.full_name,
    submission.age,
    submission.governorate,
    submission.study_work_status,
    submission.study_work_details,
    submission.proud_achievement,
    submission.initiative_reason,
    submission.expected_outcome,
    submission.if_not_accepted,
    submission.has_project_idea,
    submission.project_idea,
    submission.desired_field,
    submission.biggest_fear,
    submission.failure_story,
    submission.idea_change_reaction,
    submission.biggest_strength,
    submission.trait_to_improve,
    submission.future_letter,
    submission.whatsapp,
    submission.email,
    submission.privacy_accepted ? 'Yes' : 'No',
    row.userAgent,
    row.clientIp,
    '/dlb-initiative',
  ];
}

export class GoogleSheetsDlbService implements DlbSheetsService {
  private readonly spreadsheetId: string;
  private readonly auth: GoogleAuth;
  private workbookVerified = false;

  constructor(config: GoogleSheetsConfig) {
    if (!config.spreadsheetId || !config.serviceAccountEmail || !config.privateKey) {
      throw new Error('DLB Google Sheets configuration is incomplete.');
    }

    this.spreadsheetId = config.spreadsheetId;
    this.auth = new GoogleAuth({
      credentials: {
        client_email: config.serviceAccountEmail,
        private_key: config.privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }

  async readState(stage?: (stage: string) => void): Promise<DlbSheetState> {
    await this.verifyWorkbook(stage);
    await ensureDlbSheetHeaders({
      readHeader: () => this.readHeader(stage),
      writeHeader: (headers) => this.writeHeader(headers, stage),
    });

    const range = `'${DLB_WORKSHEET_NAME}'!A2:AB`;
    const data = await this.request<ValuesResponse>(
      `/values/${encodeURIComponent(range)}?majorDimension=ROWS`,
      {},
      stage,
      'duplicate-check',
    );
    const values = Array.isArray(data.values) ? data.values : [];
    return {
      applicationIds: values.map((row) => String(row[0] ?? '')).filter(Boolean),
      whatsapps: new Set(values.map((row) => String(row[22] ?? '')).filter(Boolean)),
      emails: new Set(values.map((row) => String(row[23] ?? '').toLowerCase()).filter(Boolean)),
    };
  }

  private async readHeader(stage?: (stage: string) => void): Promise<unknown[]> {
    const range = `'${DLB_WORKSHEET_NAME}'!1:1`;
    const data = await this.request<ValuesResponse>(
      `/values/${encodeURIComponent(range)}?majorDimension=ROWS&valueRenderOption=FORMULA`,
      {},
      stage,
      'headers-check',
    );
    const header = data.values?.[0];
    return Array.isArray(header) ? header : [];
  }

  private async writeHeader(
    headers: readonly string[],
    stage?: (stage: string) => void,
  ): Promise<void> {
    const range = `'${DLB_WORKSHEET_NAME}'!A1:AB1`;
    await this.request<ValuesResponse>(
      `/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
      {
        method: 'PUT',
        body: JSON.stringify({ values: [[...headers]] }),
      },
      stage,
      'headers-check',
    );
  }

  private async verifyWorkbook(stage?: (stage: string) => void): Promise<void> {
    if (this.workbookVerified) return;
    const metadata = await this.request<SpreadsheetMetadataResponse>(
      '?fields=properties.title%2Csheets.properties.title',
      {},
      stage,
      'spreadsheet-open',
    );
    if (metadata.properties?.title !== 'dlb-initiative-2026') {
      throw new Error('The configured spreadsheet has the wrong title.');
    }
    stage?.('worksheet-open');
    const worksheetExists = metadata.sheets?.some(
      (sheet) => sheet.properties?.title === DLB_WORKSHEET_NAME,
    );
    if (!worksheetExists) throw new Error('The submissions worksheet does not exist.');
    this.workbookVerified = true;
  }

  async appendSubmission(
    row: DlbSheetRow,
    stage?: (stage: string) => void,
  ): Promise<number> {
    const range = `'${DLB_WORKSHEET_NAME}'!A:AB`;
    const data = await this.request<ValuesResponse>(
      `/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        body: JSON.stringify({ values: [buildDlbSheetRow(row)] }),
      },
      stage,
      'append-row',
    );

    const updatedRange = data.updates?.updatedRange ?? '';
    const match = updatedRange.match(/![A-Z]+(\d+):[A-Z]+\d+$/);
    const rowNumber = match ? Number(match[1]) : 0;
    if (!Number.isInteger(rowNumber) || rowNumber < 2) {
      throw new Error('Google Sheets did not return the appended row number.');
    }
    return rowNumber;
  }

  async updateEmailStatus(
    rowNumber: number,
    status: 'Sent' | 'Failed',
    stage?: (stage: string) => void,
  ): Promise<void> {
    const range = `'${DLB_WORKSHEET_NAME}'!D${rowNumber}`;
    await this.request<ValuesResponse>(
      `/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
      {
        method: 'PUT',
        body: JSON.stringify({ values: [[status]] }),
      },
      stage,
      'update-email-status',
    );
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
    stage?: (stage: string) => void,
    operationStage = 'google-request',
  ): Promise<T> {
    stage?.('google-auth');
    const client = await this.auth.getClient();
    const tokenResult = await client.getAccessToken();
    const accessToken = typeof tokenResult === 'string' ? tokenResult : tokenResult.token;
    if (!accessToken) throw new Error('Google authentication returned no access token.');

    stage?.(operationStage);
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(this.spreadsheetId)}${path}`,
      {
        ...init,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...init.headers,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Google Sheets request failed with status ${response.status}.`);
    }

    return response.json() as Promise<T>;
  }
}

export function getNextApplicationSequence(applicationIds: string[]): number {
  let maximum = 0;
  for (const applicationId of applicationIds) {
    const match = /^DLB-2026-(\d{4})$/.exec(applicationId);
    if (match) maximum = Math.max(maximum, Number(match[1]));
  }
  return maximum + 1;
}
