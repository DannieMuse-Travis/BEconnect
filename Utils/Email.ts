import nodemailer, { Transporter } from 'nodemailer';
import pug from 'pug';
const htmlToText = require('html-to-text'); // Import html-to-text using CommonJS require

interface User {
  email: string;
  name: string;
}

export default class Email {
  private to: string;
  private firstName: string;
  private url: string;
  private from: string;

  constructor(user: User, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Jonas Schmedtmann <${process.env.EMAIL_FROM}>`;
  }

  private newTransport(): Transporter {
    // Create nodemailer transporter based on environment
    if (process.env.NODE_ENV === 'production') {
      // Use SendGrid for production
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME!,
          pass: process.env.SENDGRID_PASSWORD!
        }
      });
    } else {
      // Use SMTP transport for development
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST!,
        port: Number(process.env.EMAIL_PORT!),
        auth: {
          user: process.env.EMAIL_USERNAME!,
          pass: process.env.EMAIL_PASSWORD!
        }
      });
    }
  }

  async send(template: string, subject: string): Promise<void> {
    // Render HTML based on a Pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    // Generate plain text version of the HTML content
    const textVersion = htmlToText.fromString(html);

    // Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: textVersion
    };

    // Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome(): Promise<void> {
    // Send welcome email
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset(): Promise<void> {
    // Send password reset email
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
}
