import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';

@Injectable()
export class PasswordResetMailService {
  private readonly logger = new Logger(PasswordResetMailService.name);
  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(this.config.get('SMTP_HOST') && this.config.get('SMTP_USER') && this.config.get('SMTP_PASSWORD'));
  }

  async send(email: string, firstName: string, resetUrl: string) {
    if (!this.isConfigured()) throw new ServiceUnavailableException('L’envoi des e-mails de réinitialisation n’est pas encore configuré');
    const port = Number(this.config.get('SMTP_PORT', 587));
    const transporter = createTransport({
      host: this.config.getOrThrow<string>('SMTP_HOST'),
      port,
      secure: port === 465,
      auth: { user: this.config.getOrThrow<string>('SMTP_USER'), pass: this.config.getOrThrow<string>('SMTP_PASSWORD') },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
    try {
      await transporter.sendMail({
        from: this.config.get('MAIL_FROM', this.config.getOrThrow<string>('SMTP_USER')),
        to: email,
        subject: 'Réinitialisation de votre mot de passe KRITIA',
        text: `Bonjour ${firstName},\n\nPour choisir un nouveau mot de passe KRITIA, ouvrez ce lien valable 30 minutes :\n${resetUrl}\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez ce message.`,
        html: `<p>Bonjour ${this.escape(firstName)},</p><p>Vous avez demandé un nouveau mot de passe KRITIA.</p><p><a href="${this.escape(resetUrl)}">Choisir un nouveau mot de passe</a></p><p>Ce lien est valable 30 minutes et ne peut être utilisé qu’une seule fois.</p><p>Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.</p>`,
      });
    } catch (error) {
      this.logger.error('Échec de l’envoi de l’e-mail de réinitialisation', error instanceof Error ? error.stack : undefined);
      throw new ServiceUnavailableException('L’e-mail de réinitialisation n’a pas pu être envoyé');
    }
  }

  private escape(value: string) {
    return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
  }
}
