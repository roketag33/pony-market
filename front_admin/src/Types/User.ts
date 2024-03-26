import { Role } from './enums/Role';
import { Status } from './enums/Status';

export   interface User {
  id: number;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  status: Status;
  refreshToken?: string;
  refreshTokenExpiry?: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
}
