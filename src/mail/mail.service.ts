import * as nodemailer from 'nodemailer';

import { AdminService } from 'src/admin/admin.service';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { SignupMode } from 'src/common/enums/sign-mode.enum';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly adminService: AdminService,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Gmail
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMail(to: string, jwt: string, totp?: string) {
    try {
      // Send mail with defined transport object
      await this.transporter.sendMail({
        from: 'developthug@gmail.com',
        to,
        subject: 'Email Verification',
        text: this.getText(jwt, totp),
      });
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  private getText(jwt: string, totp?: string) {
    switch (this.adminService.getSignupMode()) {
      case SignupMode.LINK:
        return `Your verification link is: https://auth-react-one.vercel.app/link/${jwt}`;
      case SignupMode.TOTP:
        return `Your verification code is: ${totp}, link is: https://auth-react-one.vercel.app/totp/${jwt}`;
    }
  }
}
