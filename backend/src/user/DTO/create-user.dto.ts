import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Status } from '../enums/user.enums';
import { Role } from '@prisma/client'; // Importez Role depuis le client Prisma

export class CreateUserdto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  role: Role;

  @IsNotEmpty()
  status: Status;

  @IsOptional()
  avatarUrl?: string;

  @IsOptional()
  bio?: string;

  @IsOptional()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
