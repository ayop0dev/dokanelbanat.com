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
  readState(): Promise<DlbSheetState>;
  appendSubmission(row: DlbSheetRow): Promise<number>;
  updateEmailStatus(rowNumber: number, status: 'Sent' | 'Failed'): Promise<void>;
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

function parsePrivateKey(value: string): string {
  return value.replace(/\\n/g, '\n');
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
        private_key: parsePrivateKey(config.privateKey),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }

  async readState(): Promise<DlbSheetState> {
    await this.verifyWorkbook();
    await ensureDlbSheetHeaders({
      readHeader: () => this.readHeader(),
      writeHeader: (headers) => this.writeHeader(headers),
    });

    const range = `'${DLB_WORKSHEET_NAME}'!A2:AB`;
    const data = await this.request<ValuesResponse>(
      `/values/${encodeURIComponent(range)}?majorDimension=ROWS`,
    );
    const values = Array.isArray(data.values) ? data.values : [];
    return {
      applicationIds: values.map((row) => String(row[0] ?? '')).filter(Boolean),
      whatsapps: new Set(values.map((row) => String(row[22] ?? '')).filter(Boolean)),
      emails: new Set(values.map((row) => String(row[23] ?? '').toLowerCase()).filter(Boolean)),
    };
  }

  private async readHeader(): Promise<unknown[]> {
    const range = `'${DLB_WORKSHEET_NAME}'!1:1`;
    const data = await this.request<ValuesResponse>(
      `/values/${encodeURIComponent(range)}?majorDimension=ROWS&valueRenderOption=FORMULA`,
    );
    const header = data.values?.[0];
    return Array.isArray(header) ? header : [];
  }

  private async writeHeader(headers: readonly string[]): Promise<void> {
    const range = `'${DLB_WORKSHEET_NAME}'!A1:AB1`;
    await this.request<ValuesResponse>(
      `/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
      {
        method: 'PUT',
        body: JSON.stringify({ values: [[...headers]] }),
      },
    );
  }

  private async verifyWorkbook(): Promise<void> {
    if (this.workbookVerified) return;
    const metadata = await this.request<SpreadsheetMetadataResponse>(
      '?fields=properties.title%2Csheets.properties.title',
    );
    if (metadata.properties?.title !== 'dlb-initiative-2026') {
      throw new Error('The configured spreadsheet has the wrong title.');
    }
    const worksheetExists = metadata.sheets?.some(
      (sheet) => sheet.properties?.title === DLB_WORKSHEET_NAME,
    );
    if (!worksheetExists) throw new Error('The submissions worksheet does not exist.');
    this.workbookVerified = true;
  }

  async appendSubmission(row: DlbSheetRow): Promise<number> {
    const range = `'${DLB_WORKSHEET_NAME}'!A:AB`;
    const data = await this.request<ValuesResponse>(
      `/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        body: JSON.stringify({ values: [buildDlbSheetRow(row)] }),
      },
    );

    const updatedRange = data.updates?.updatedRange ?? '';
    const match = updatedRange.match(/![A-Z]+(\d+):[A-Z]+\d+$/);
    const rowNumber = match ? Number(match[1]) : 0;
    if (!Number.isInteger(rowNumber) || rowNumber < 2) {
      throw new Error('Google Sheets did not return the appended row number.');
    }
    return rowNumber;
  }

  async updateEmailStatus(rowNumber: number, status: 'Sent' | 'Failed'): Promise<void> {
    const range = `'${DLB_WORKSHEET_NAME}'!D${rowNumber}`;
    await this.request<ValuesResponse>(
      `/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
      {
        method: 'PUT',
        body: JSON.stringify({ values: [[status]] }),
      },
    );
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const client = await this.auth.getClient();
    const tokenResult = await client.getAccessToken();
    const accessToken = typeof tokenResult === 'string' ? tokenResult : tokenResult.token;
    if (!accessToken) throw new Error('Google authentication returned no access token.');

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
