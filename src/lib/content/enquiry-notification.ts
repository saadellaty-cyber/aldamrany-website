import 'server-only';
import { env } from '@/lib/env';
import { sendMail } from '@/lib/mail';
import { getSiteSettings } from '@/lib/content/site';

/**
 * Tells the company an enquiry has arrived.
 *
 * The address is the contact email in Site Settings, so it is changed in the
 * dashboard rather than in an environment variable — and it is the same
 * address the site already publishes, which is where enquiries are expected.
 * With no address saved there is nobody to notify and the mail is skipped.
 */
export type EnquiryNotification = {
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  projectType: string | null;
  message: string;
  locale: string | null;
};

export async function notifyNewEnquiry(enquiry: EnquiryNotification): Promise<void> {
  let to: string | null = null;
  try {
    const settings = await getSiteSettings();
    to = settings.email;
  } catch {
    // Settings unreadable: nothing to do but leave the enquiry in the inbox.
  }

  if (!to) {
    console.warn('[enquiry] no contact email saved in Site Settings — notification skipped');
    return;
  }

  const line = (label: string, value: string | null) => (value ? `${label}: ${value}\n` : '');

  const body =
    `رسالة جديدة من نموذج التواصل على الموقع.\n` +
    `A new enquiry has arrived from the website contact form.\n\n` +
    line('الاسم / Name', enquiry.name) +
    line('البريد / Email', enquiry.email) +
    line('الهاتف / Phone', enquiry.phone) +
    line('الشركة / Company', enquiry.company) +
    line('نوع المشروع / Project type', enquiry.projectType) +
    line('اللغة / Language', enquiry.locale) +
    `\nالرسالة / Message:\n${enquiry.message}\n\n` +
    `—\n` +
    `للرد: اضغط رد على هذه الرسالة وسيصل ردك إلى ${enquiry.email} مباشرة.\n` +
    `Reply to this email and your reply goes straight to the sender.\n\n` +
    `كل الرسائل: ${env.siteUrl}/admin/messages\n`;

  await sendMail({
    to,
    subject: `طلب تواصل جديد — ${enquiry.name}`,
    text: body,
    // So hitting reply in the inbox answers the enquirer directly.
    replyTo: enquiry.email,
  });
}
