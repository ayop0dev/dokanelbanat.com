import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { DlbSubmission } from './dlb-initiative';

const ADMIN_EMAIL = 'dlb.egy@gmail.com';

type DlbMailConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
};

export interface DlbMailService {
  sendApplicantConfirmation(applicationId: string, submission: DlbSubmission): Promise<void>;
  sendAdminNotification(applicationId: string, submittedAt: string, submission: DlbSubmission): Promise<void>;
}

export type DlbEmailMessage = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function validateConfig(config: DlbMailConfig): void {
  if (
    config.host !== 'smtp.titan.email' ||
    config.port !== 465 ||
    !config.username ||
    !config.password ||
    config.fromName !== 'DokanElbanat.com' ||
    config.fromEmail !== 'info@dokanelbanat.com'
  ) {
    throw new Error('DLB Titan SMTP configuration is incomplete or invalid.');
  }
}

export class NodemailerDlbMailService implements DlbMailService {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: DlbMailConfig) {
    validateConfig(config);
    this.from = `"${config.fromName.replace(/["\r\n]/g, '')}" <${config.fromEmail}>`;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: true,
      auth: {
        user: config.username,
        pass: config.password,
      },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 30_000,
    });
  }

  async sendApplicantConfirmation(applicationId: string, submission: DlbSubmission): Promise<void> {
    const message = buildApplicantMessage(applicationId, submission);
    await this.transporter.sendMail({
      from: this.from,
      to: submission.email,
      ...message,
    });
  }

  async sendAdminNotification(
    applicationId: string,
    submittedAt: string,
    submission: DlbSubmission,
  ): Promise<void> {
    const message = buildAdminMessage(applicationId, submittedAt, submission);
    await this.transporter.sendMail({
      from: this.from,
      to: ADMIN_EMAIL,
      ...message,
    });
  }
}

export function buildApplicantMessage(applicationId: string, submission: DlbSubmission): DlbEmailMessage {
    const safeName = escapeHtml(submission.full_name);
    const safeApplicationId = escapeHtml(applicationId);
    const text = [
      `أهلًا ${submission.full_name}،`,
      '',
      'تم استلام طلب انضمامك إلى مبادرة 100 دكان لـ100 بنت بنجاح.',
      `رقم الطلب: ${applicationId}`,
      '',
      'سيتم مراجعة طلبك بعناية. احتفظي برقم الطلب للرجوع إليه عند الحاجة.',
      '',
      'مع تحيات فريق DokanElbanat.com',
    ].join('\n');

    return {
      subject: 'تم استلام طلب انضمامك بنجاح',
      text,
      html: `<!doctype html>
<html lang="ar" dir="rtl">
<body style="margin:0;background:#fff5fb;color:#1a0512;font-family:Tahoma,Arial,sans-serif;">
  <div style="padding:32px 16px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #f0dce8;padding:32px;">
      <p style="margin:0 0 16px;font-size:18px;line-height:1.8;">أهلًا ${safeName}،</p>
      <h1 style="margin:0 0 16px;font-size:28px;line-height:1.4;color:#1a0512;">تم استلام طلب انضمامك بنجاح</h1>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.8;color:#6b5b66;">وصلنا طلبك للانضمام إلى مبادرة 100 دكان لـ100 بنت، وسيتم مراجعته بعناية.</p>
      <div style="margin:0 0 24px;padding:20px;background:#fff5fb;border:1px solid #ffbfe8;text-align:center;">
        <div style="margin-bottom:8px;font-size:14px;color:#6b5b66;">رقم الطلب</div>
        <strong dir="ltr" style="font-size:24px;color:#cc007f;letter-spacing:1px;">${safeApplicationId}</strong>
      </div>
      <p style="margin:0;font-size:16px;line-height:1.8;color:#6b5b66;">احتفظي برقم الطلب للرجوع إليه عند الحاجة.</p>
      <p style="margin:24px 0 0;font-size:14px;line-height:1.8;color:#9e8e99;">مع تحيات فريق DokanElbanat.com</p>
    </div>
  </div>
</body>
</html>`,
    };
}

export function buildAdminMessage(
  applicationId: string,
  submittedAt: string,
  submission: DlbSubmission,
): DlbEmailMessage {
    const fields = [
      ['رقم الطلب', applicationId],
      ['الاسم', submission.full_name],
      ['البريد الإلكتروني', submission.email],
      ['رقم الواتساب', submission.whatsapp],
      ['وقت الإرسال', submittedAt],
    ] as const;
    const text = ['طلب جديد - مبادرة 100 دكان لـ100 بنت', '', ...fields.map(([label, value]) => `${label}: ${value}`)].join('\n');
    const rows = fields
      .map(([label, value]) => `<tr><th style="padding:10px;border:1px solid #f0dce8;text-align:right;">${escapeHtml(label)}</th><td style="padding:10px;border:1px solid #f0dce8;">${escapeHtml(value)}</td></tr>`)
      .join('');

    return {
      subject: 'طلب جديد - مبادرة 100 دكان لـ100 بنت',
      text,
      html: `<!doctype html><html lang="ar" dir="rtl"><body style="font-family:Tahoma,Arial,sans-serif;color:#1a0512;"><h1 style="font-size:22px;">طلب جديد - مبادرة 100 دكان لـ100 بنت</h1><table style="border-collapse:collapse;width:100%;max-width:640px;">${rows}</table></body></html>`,
    };
}
