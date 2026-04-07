import type { FastifyBaseLogger } from 'fastify';
import type { EmailChannel, EmailMessage } from './email.channel.js';

/** Dev-friendly channel: logs payload; never throws (notification service still records DB row). */
export class LoggingEmailChannel implements EmailChannel {
  constructor(private readonly log: FastifyBaseLogger) {}

  async send(message: EmailMessage): Promise<void> {
    this.log.info(
      { to: message.to, subject: message.subject, bodyPreview: message.text.slice(0, 200) },
      'email_outbound',
    );
  }
}
