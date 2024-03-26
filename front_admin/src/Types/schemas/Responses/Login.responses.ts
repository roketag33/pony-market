import { z } from 'zod';

// Supposons que vous ayez déjà un énum pour Role quelque part dans votre code

const LoginResponseSchema = z.object({
    access_token: z.string(),
    refresh_token: z.string(),
});

// Type inféré pour utiliser dans le code TypeScript
type LoginResponse = z.infer<typeof LoginResponseSchema>;

export type { LoginResponseSchema, LoginResponse }; // Modifié ici
