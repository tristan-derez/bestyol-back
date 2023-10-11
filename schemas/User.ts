import { z } from "zod";

const usernameMinChar: number = 2;
const usernameMaxChar: number = 40;
const usernameMinError: string = `Le nom d'utilisateur doit contenir au moins ${usernameMinChar} caractères`;
const usernameMaxError: string = `Le nom d'utilisateur ne doit pas dépasser ${usernameMaxChar} caractères`;

const emailError: string = "L'email doit avoir un format valide";

const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
const passwordError = "Le mot de passe doit contenir au minimum 8 caractères, un nombre et un caractère spécial";

export const SignUpSchema = z.object({
    body: z.object({
        username: z.string().min(usernameMinChar, { message: usernameMinError }).max(usernameMaxChar, { message: usernameMaxError }),
        email: z.string().email({ message: emailError }),
        password: z.string().regex(passwordRegex, {
            message: passwordError,
        }),
    }),
});

export const LoginSchema = z.object({
    body: z.object({
        username: z.string().min(usernameMinChar, { message: usernameMinError }).max(usernameMaxChar, { message: usernameMaxError }),
        password: z.string().regex(passwordRegex, {
            message: passwordError,
        }),
    }),
});

export const EditUsernameEmailSchema = z.object({
    body: z.object({
        username: z.string().min(usernameMinChar, { message: usernameMinError }).max(usernameMaxChar, { message: usernameMaxError }).optional(),
        email: z.string().email({ message: emailError }).optional(),
    }),
});

export const EditUserPassword = z.object({
    body: z.object({
        newPassword: z.string().regex(passwordRegex, {
            message: passwordError,
        }),
    }),
});

export const EditUserPicture = z.object({
    body: z.object({
        pictureNumber: z.number(),
    }),
});
