import { z } from "zod";

const usernameMinChar: number = 1;
const usernameMaxChar: number = 50;
const usernameLengthError: string = `Le nom d'utilisateur doit faire entre ${usernameMinChar} et ${usernameMaxChar} caractères`;
const emailError: string = "Adresse email invalide";

export const SignUpSchema = z.object({
    body: z.object({
        username: z
            .string()
            .min(usernameMinChar, usernameLengthError)
            .max(usernameMaxChar, usernameLengthError)
            .refine((value) => value.trim().length > 0, {
                message: "Le nom d'utilisateur ne peut pas être vide ou contenir uniquement des espaces",
            }),
        email: z.string().email({ message: emailError }),
        password: z.string().min(12, "Le mot de passe doit contenir au moins 12 caractères"),
    }),
});

export const LoginSchema = z.object({
    body: z.object({
        username: z.string(),
        password: z.string(),
    }),
});

export const EditUsernameEmailSchema = z.object({
    body: z.object({
        username: z.string().max(usernameMaxChar, { message: usernameLengthError }).optional(),
        email: z.string().email({ message: emailError }).optional(),
    }),
});

export const EditUserPassword = z.object({
    body: z.object({
        newPassword: z.string().min(12, "Le mot de passe doit contenir au moins 12 caractères"),
    }),
});

export const EditUserPicture = z.object({
    body: z.object({
        pictureNumber: z.number(),
    }),
});
