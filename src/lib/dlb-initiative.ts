import isEmail from 'validator/lib/isEmail.js';

export const DLB_STUDY_WORK_OPTIONS = [
  'طالبة',
  'بشتغل',
  'الاتنين',
  'حاليًا لا ده ولا ده',
] as const;

export const DLB_PROJECT_IDEA_OPTIONS = [
  'أيوه',
  'لسه بدور على فكرة',
] as const;

export type DlbSubmission = {
  full_name: string;
  age: number;
  governorate: string;
  study_work_status: (typeof DLB_STUDY_WORK_OPTIONS)[number];
  study_work_details: string;
  proud_achievement: string;
  initiative_reason: string;
  expected_outcome: string;
  if_not_accepted: string;
  has_project_idea: (typeof DLB_PROJECT_IDEA_OPTIONS)[number];
  project_idea: string;
  desired_field: string;
  biggest_fear: string;
  failure_story: string;
  idea_change_reaction: string;
  biggest_strength: string;
  trait_to_improve: string;
  future_letter: string;
  whatsapp: string;
  email: string;
  privacy_accepted: true;
};

export type DlbFieldErrors = Record<string, string>;

export type DlbValidationResult =
  | { success: true; data: DlbSubmission }
  | { success: false; errors: DlbFieldErrors };

const REQUIRED_MESSAGE = 'هذا الحقل مطلوب.';
const MAX_MESSAGE = 'تجاوزت الحد الأقصى المسموح.';

const TEXTAREA_LIMITS: Record<string, number> = {
  study_work_details: 500,
  proud_achievement: 500,
  initiative_reason: 500,
  expected_outcome: 500,
  if_not_accepted: 500,
  project_idea: 500,
  desired_field: 500,
  biggest_fear: 500,
  failure_story: 700,
  idea_change_reaction: 700,
  biggest_strength: 500,
  trait_to_improve: 500,
  future_letter: 1000,
};

export function normalizeSingleLine(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/gu, ' ') : '';
}

export function normalizeMultiline(value: unknown): string {
  if (typeof value !== 'string') return '';

  return value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim().replace(/[\t ]+/g, ' '))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function normalizeEgyptianWhatsApp(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const digits = value.trim().replace(/[\s().-]/g, '');
  if (/^01[0125]\d{8}$/.test(digits)) {
    return `+20${digits.slice(1)}`;
  }
  if (/^\+201[0125]\d{8}$/.test(digits)) {
    return digits;
  }
  return null;
}

function readText(body: Record<string, unknown>, field: string, multiline = false): string {
  return multiline ? normalizeMultiline(body[field]) : normalizeSingleLine(body[field]);
}

function validateRequiredText(
  errors: DlbFieldErrors,
  field: string,
  value: string,
  max: number,
  min = 1,
): void {
  if (!value) {
    errors[field] = REQUIRED_MESSAGE;
  } else if (value.length < min) {
    errors[field] = `يجب ألا يقل هذا الحقل عن ${min} أحرف.`;
  } else if (value.length > max) {
    errors[field] = MAX_MESSAGE;
  }
}

export function validateDlbSubmission(input: unknown): DlbValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { success: false, errors: { form: 'تعذّر قراءة البيانات. حاولي مرة أخرى.' } };
  }

  const body = input as Record<string, unknown>;
  const errors: DlbFieldErrors = {};

  const fullName = readText(body, 'full_name');
  const governorate = readText(body, 'governorate');
  const studyWorkStatus = readText(body, 'study_work_status');
  const hasProjectIdea = readText(body, 'has_project_idea');
  const email = readText(body, 'email').toLowerCase();
  const whatsappRaw = readText(body, 'whatsapp');
  const whatsapp = normalizeEgyptianWhatsApp(whatsappRaw);

  const ageValue = typeof body.age === 'number' ? body.age : Number(readText(body, 'age'));

  validateRequiredText(errors, 'full_name', fullName, 100, 3);
  validateRequiredText(errors, 'governorate', governorate, 100);

  if (!Number.isInteger(ageValue) || ageValue < 16 || ageValue > 80) {
    errors.age = 'يرجى إدخال سن صحيح من 16 إلى 80.';
  }

  if (!DLB_STUDY_WORK_OPTIONS.includes(studyWorkStatus as (typeof DLB_STUDY_WORK_OPTIONS)[number])) {
    errors.study_work_status = REQUIRED_MESSAGE;
  }

  const textareaValues: Record<string, string> = {};
  for (const [field, max] of Object.entries(TEXTAREA_LIMITS)) {
    const value = readText(body, field, true);
    textareaValues[field] = value;

    if (field === 'study_work_details') {
      if (value.length > max) errors[field] = MAX_MESSAGE;
      continue;
    }

    if (field === 'project_idea' || field === 'desired_field') continue;
    validateRequiredText(errors, field, value, max);
  }

  if (!DLB_PROJECT_IDEA_OPTIONS.includes(hasProjectIdea as (typeof DLB_PROJECT_IDEA_OPTIONS)[number])) {
    errors.has_project_idea = REQUIRED_MESSAGE;
  } else if (hasProjectIdea === 'أيوه') {
    validateRequiredText(errors, 'project_idea', textareaValues.project_idea, 500);
    textareaValues.desired_field = '';
  } else {
    validateRequiredText(errors, 'desired_field', textareaValues.desired_field, 500);
    textareaValues.project_idea = '';
  }

  if (!whatsapp || whatsappRaw.length > 20) {
    errors.whatsapp = 'يرجى إدخال رقم واتساب صحيح.';
  }

  if (!email || email.length > 254 || !isEmail(email)) {
    errors.email = 'يرجى إدخال بريد إلكتروني صحيح.';
  }

  if (body.privacy_accepted !== true) {
    errors.privacy_accepted = 'يجب الموافقة على سياسة الخصوصية.';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      full_name: fullName,
      age: ageValue,
      governorate,
      study_work_status: studyWorkStatus as DlbSubmission['study_work_status'],
      study_work_details: textareaValues.study_work_details,
      proud_achievement: textareaValues.proud_achievement,
      initiative_reason: textareaValues.initiative_reason,
      expected_outcome: textareaValues.expected_outcome,
      if_not_accepted: textareaValues.if_not_accepted,
      has_project_idea: hasProjectIdea as DlbSubmission['has_project_idea'],
      project_idea: textareaValues.project_idea,
      desired_field: textareaValues.desired_field,
      biggest_fear: textareaValues.biggest_fear,
      failure_story: textareaValues.failure_story,
      idea_change_reaction: textareaValues.idea_change_reaction,
      biggest_strength: textareaValues.biggest_strength,
      trait_to_improve: textareaValues.trait_to_improve,
      future_letter: textareaValues.future_letter,
      whatsapp,
      email,
      privacy_accepted: true,
    },
  };
}

export function normalizeClientIp(raw: string): string {
  const address = (raw ?? '').trim();
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(address)) {
    const octets = address.split('.').map(Number);
    if (octets.every((octet) => octet <= 255)) {
      const isPrivate = octets[0] === 10 ||
        octets[0] === 127 ||
        (octets[0] === 169 && octets[1] === 254) ||
        (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
        (octets[0] === 192 && octets[1] === 168);
      return isPrivate ? 'unknown' : address;
    }
  }
  if (address.includes(':') && /^[0-9a-fA-F:]{2,45}$/.test(address)) {
    const normalized = address.toLowerCase();
    if (
      normalized === '::1' ||
      normalized.startsWith('fe80:') ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd')
    ) {
      return 'unknown';
    }
    return normalized;
  }
  return 'unknown';
}

export function formatApplicationId(sequence: number): string {
  if (!Number.isSafeInteger(sequence) || sequence < 1 || sequence > 9999) {
    throw new Error('DLB application sequence is outside the supported range.');
  }
  return `DLB-2026-${String(sequence).padStart(4, '0')}`;
}
