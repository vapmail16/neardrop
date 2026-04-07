/**
 * Outbound email abstraction (MVP: log or SMTP; Phase 3+ SES/Resend).
 * Same interface for web-triggered flows and future mobile push routing via unified notifications.
 */
export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export interface EmailChannel {
  send(message: EmailMessage): Promise<void>;
}
