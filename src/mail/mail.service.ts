import * as nodemailer from 'nodemailer';

import { AdminService } from 'src/admin/admin.service';
import { ConfigService } from '@nestjs/config';
import { CreateMailDto } from './dto/create-mail.dto';
import { Injectable } from '@nestjs/common';
import { SignupMode } from 'src/common/enums/sign-mode.enum';
import { UpdateMailDto } from './dto/update-mail.dto';

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
}

@Injectable()
export class MailService {
  private transporter;
  private mailOptions: MailOptions;
  private signUpMode: SignupMode;
  constructor(
    private readonly adminService: AdminService,
    private configService: ConfigService,
  ) {
    // this.transporter = nodemailer.createTransport({
    //   service: configService.get<string>('smtp.service'), // Gmail
    //   auth: {
    //     user: configService.get<string>('smtp.user'),
    //     pass: configService.get<string>('smtp.pass'),
    //   },
    // });
    // this.mailOptions.from = configService.get<string>('smtp.user');
    // this.signUpMode = this.adminService.getSignupMode();
  }

  getSendMailOptions() {
    //TODO Check valid values
    return this.mailOptions;
  }

  async sendSignUpMail(email: string) {
    try {
      this.transporter.sendMail(this.getSendMailOptions());
      console.log('Email sent successfully!');
    } catch (error) {
      console.log('Error occurred:', error.message);
    }
  }

  private getEmailFormat() {
    switch (this.signUpMode) {
      case SignupMode.EmailVerification:
        return 'Please verify your account';
      case SignupMode.OTP:
        return 'Your OTP';
      case SignupMode.NoEmailVerification:
        return 'Your account has been created';
    }
  }
}
