import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  resetToken: string;

  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
