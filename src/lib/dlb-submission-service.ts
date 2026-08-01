import { createHash } from 'node:crypto';
import { formatApplicationId, validateDlbSubmission } from './dlb-initiative';
import type { DlbFieldErrors } from './dlb-initiative';
import { DlbHeaderSchemaMismatchError, getNextApplicationSequence } from './google-sheets';
import type { DlbSheetsService } from './google-sheets';
import type { DlbMailService } from './dlb-mail';

export type DlbSubmissionContext = {
  clientIp: string;
  userAgent: string;
};

export type DlbSubmissionServices = {
  sheets: DlbSheetsService;
  mail: DlbMailService;
  now?: () => Date;
  log?: (event: string, details?: Record<string, unknown>) => void;
};

export type DlbSubmissionOutcome =
  | { type: 'validation'; errors: DlbFieldErrors }
  | { type: 'duplicate' }
  | { type: 'success'; applicationId: string };

let submissionQueue: Promise<void> = Promise.resolve();

async function withSubmissionLock<T>(task: () => Promise<T>): Promise<T> {
  let release: () => void = () => undefined;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  const previous = submissionQueue;
  submissionQueue = previous.then(() => current);

  await previous;
  try {
    return await task();
  } finally {
    release();
  }
}

export async function processDlbSubmission(
  input: unknown,
  context: DlbSubmissionContext,
  servicesOrFactory: DlbSubmissionServices | (() => DlbSubmissionServices),
): Promise<DlbSubmissionOutcome> {
  const validation = validateDlbSubmission(input);
  if (validation.success === false) {
    return { type: 'validation', errors: validation.errors };
  }

  const services = typeof servicesOrFactory === 'function' ? servicesOrFactory() : servicesOrFactory;
  const submission = validation.data;
  const submittedAt = (services.now ?? (() => new Date()))().toISOString();

  const persisted = await withSubmissionLock(async () => {
    const state = await services.sheets.readState().catch((error: unknown) => {
      if (error instanceof DlbHeaderSchemaMismatchError) {
        services.log?.('header_schema_mismatch');
      }
      throw error;
    });
    if (state.emails.has(submission.email) || state.whatsapps.has(submission.whatsapp)) {
      services.log?.('duplicate_detected');
      return null;
    }

    const applicationId = formatApplicationId(getNextApplicationSequence(state.applicationIds));
    const rowNumber = await services.sheets.appendSubmission({
      applicationId,
      submittedAt,
      emailStatus: 'Pending',
      submission,
      userAgent: context.userAgent.slice(0, 500),
      clientIp: context.clientIp,
    });

    return { applicationId, rowNumber };
  });

  if (!persisted) return { type: 'duplicate' };

  let applicantEmailSent = false;
  try {
    await services.mail.sendApplicantConfirmation(persisted.applicationId, submission);
    applicantEmailSent = true;
  } catch {
    services.log?.('applicant_email_failure', { applicationId: persisted.applicationId });
  }

  try {
    await services.mail.sendAdminNotification(persisted.applicationId, submittedAt, submission);
  } catch {
    services.log?.('admin_email_failure', { applicationId: persisted.applicationId });
  }

  try {
    await services.sheets.updateEmailStatus(
      persisted.rowNumber,
      applicantEmailSent ? 'Sent' : 'Failed',
    );
  } catch {
    services.log?.('email_status_update_failure', { applicationId: persisted.applicationId });
  }

  services.log?.('submission_success', {
    applicationId: persisted.applicationId,
    applicantEmailSent,
  });
  return { type: 'success', applicationId: persisted.applicationId };
}

type RateEntry = { count: number; expiresAt: number };

export class DlbRateLimiter {
  private readonly entries = new Map<string, RateEntry>();

  constructor(
    private readonly maximum: number,
    private readonly windowSeconds: number,
    private readonly now: () => number = Date.now,
  ) {
    if (!Number.isInteger(maximum) || maximum < 1) throw new Error('Invalid DLB rate limit maximum.');
    if (!Number.isInteger(windowSeconds) || windowSeconds < 1) throw new Error('Invalid DLB rate limit window.');
  }

  allow(clientIp: string): boolean {
    const now = this.now();
    this.removeExpired(now);
    const identity = clientIp === 'unknown' ? 'unknown' : createHash('sha256').update(clientIp).digest('hex');
    const key = `dlb:${identity}`;
    const current = this.entries.get(key);
    const effectiveMaximum = clientIp === 'unknown' ? this.maximum * 20 : this.maximum;

    if (!current || current.expiresAt <= now) {
      this.entries.set(key, { count: 1, expiresAt: now + this.windowSeconds * 1000 });
      return true;
    }

    if (current.count >= effectiveMaximum) return false;
    current.count += 1;
    return true;
  }

  private removeExpired(now: number): void {
    if (this.entries.size < 100) return;
    for (const [key, entry] of this.entries) {
      if (entry.expiresAt <= now) this.entries.delete(key);
    }
  }
}

export function isHoneypotFilled(input: unknown): boolean {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return false;
  const value = (input as Record<string, unknown>).website;
  return typeof value === 'string' && value.trim().length > 0;
}
