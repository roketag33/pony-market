import { Injectable } from '@nestjs/common';
import * as formData from 'form-data';
import Mailgun from 'mailgun.js';
import * as fs from 'fs';
import * as path from 'path';
import handlebars from 'handlebars';

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
  async sendPasswordResetEmail(to: string, name: string, resetLink: string) {
    const templateSource = fs.readFileSync(
      path.join(
        __dirname,
        '..',
        'mail',
        'templates',
        'reset-password-email.handlebars',
      ),
      'utf8',
    );
    const template = handlebars.compile(templateSource);
    const htmlToSend = template({
      name,
      resetLink,
    });

    await this.sendEmail(
      to,
      'Réinitialisation de votre mot de passe',
      'Vous avez demandé à réinitialiser votre mot de passe. Veuillez suivre le lien ci-dessous pour définir un nouveau mot de passe.',
      htmlToSend,
    );
  }
}
