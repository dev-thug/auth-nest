// src/admin/admin.service.ts

import { Injectable } from '@nestjs/common';
import { SignupMode } from 'src/common/enums/sign-mode.enum';

interface Settings {
  signupMode: SignupMode;
}

@Injectable()
export class AdminService {
  private settings: Settings;

  constructor() {
    this.settings = {
      signupMode: SignupMode.NoEmailVerification,
    };
  }

  getSignupMode(): SignupMode {
    return this.settings.signupMode;
  }

  setSignupMode(signupMode: SignupMode): void {
    this.settings.signupMode = signupMode;
  }
}
