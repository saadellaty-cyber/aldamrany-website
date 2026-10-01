import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '@/lib/env';

/**
 * Outgoing mail.
 *
 * Every function here is best-effort. An enquiry is already stored before the
 * notification is attempted, so a mail server that is down, slow or simply not
 * configured must never cost the company a lead or show the sender an error.
 * Failures are logged and swallowed.
 */

type Mail = {
  to: string;
  subject: string;
  text: string;
  /** Set so a reply from the inbox goes to the enquirer, not to the server. */
  replyTo?: string;
};

let transport: Transporter | null | undefined;

function getTransport(): Transporter | null {
  // `undefined` means "not built yet"; `null` means "built, and unconfigured".
  if (transport !== undefined) return transport;

  const smtp = env.smtp;
  if (!smtp) {
    transport = null;
    return null;
  }

  transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.password },
    // A request thread should not hang on an unreachable mail server.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return transport;
}

export function isMailConfigured(): boolean {
  return env.smtp !== null;
}

/** Sends a message, reporting whether it went out. Never throws. */
export async function sendMail(mail: Mail): Promise<boolean> {
  const smtp = env.smtp;
  const tx = getTransport();
  if (!smtp || !tx) {
    console.warn('[mail] not configured — skipping:', mail.subject);
    return false;
  }

  try {
    await tx.sendMail({
      from: smtp.from,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      replyTo: mail.replyTo,
    });
    return true;
  } catch (error) {
    // The message is already saved; this is a notification failing, not the
    // enquiry. Log enough to diagnose without leaking the credentials.
    console.error('[mail] send failed:', error instanceof Error ? error.message : error);
    return false;
  }
}

/** Verifies the credentials and the connection. Used by the health endpoint. */
export async function verifyMail(): Promise<{ ok: boolean; error?: string }> {
  const tx = getTransport();
  if (!tx) return { ok: false, error: 'not configured' };

  try {
    await tx.verify();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
