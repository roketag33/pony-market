import { z } from 'zod';
import { Role, Status } from '../../Type';

export const UserResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.nativeEnum(Role),
  status: z.nativeEnum(Status),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UsersResponseSchema = z.object({
  users: z.array(UserResponseSchema),
  total: z.number(),
});
