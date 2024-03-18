import { Injectable } from '@nestjs/common';
import * as formData from 'form-data';
import Mailgun from 'mailgun.js';

@Injectable()
export class MailService {
  private mg;

  constructor() {
    const mailgun = new Mailgun(formData);
    this.mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    });
  }

  async sendEmail(to: string, subject: string, text: string, html: string) {
    const messageData = {
      from: process.env.MAIL_FROM,
      to: [to],
      subject: subject,
      text: text,
      html: html,
    };

    try {
      const msg = await this.mg.messages.create(
        process.env.MAILGUN_DOMAIN,
        messageData,
      );
      console.log(msg);
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'email:", err);
    }
  }
}
