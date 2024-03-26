import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class Logindto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
