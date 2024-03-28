import { z } from 'zod';


const LoginResponseSchema = z.object({
    access_token: z.string(),
    refresh_token: z.string(),
});

type LoginResponse = z.infer<typeof LoginResponseSchema>;

export type { LoginResponseSchema, LoginResponse };
