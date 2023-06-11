import { IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { VerificationLinkDto } from './verification-link.dto';

export class VerificationTotpDto extends PartialType(VerificationLinkDto) {
  @IsNotEmpty()
  totp: number;
}
