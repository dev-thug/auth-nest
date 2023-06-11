import { IsNotEmpty } from 'class-validator';

export class VerificationLinkDto {
  @IsNotEmpty()
  token: string;
}
