import { env } from "node:process";
import nodemailer from "nodemailer";

export default class Email {
  constructor(url, user) {
    this.to = user.email;
    this.url = url;
    this.from = "company@gmail.com";
    this.firstName = user.username;
  }

  newTransport() {
    if(process.env.NODE_ENV === production) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      })
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail() {
    const mailOption = {
      to: this.to,
      from: this.from,
      text: `please login to this address. ${this.url}`,
      subject: `hi ${this.firstName}. welcome to our family`,
    };

    this.newTransport().sendMail(mailOption);
  }
}
