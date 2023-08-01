import { z } from "zod";

const usernameMinError = "Le nom d'utilisateur doit contenir au moins 3 caractères";
const usernameMaxError = "Le nom d'utilisateur ne doit pas dépasser 20 caractères";

const emailError = "L'email doit avoir un format valide";

const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
const passwordError = "Le mot de passe doit contenir au minimum 8 caractères, un nombre et un caractère spécial";

export const SignUpSchema = z.object({
    body: z.object({
        username: z.string().min(3, { message: usernameMinError }).max(20, { message: usernameMaxError }),
        email: z.string().email({ message: emailError }),
        password: z.string().regex(passwordRegex, {
            message: passwordError,
        }),
    }),
});

export const LoginSchema = z.object({
    body: z.object({
        username: z.string().min(3, { message: usernameMinError }).max(20, { message: usernameMaxError }),
        password: z.string().regex(passwordRegex, {
            message: passwordError,
        }),
    }),
});

export const EditUsernameEmailSchema = z.object({
    body: z.object({
        username: z.string().min(3, { message: usernameMinError }).max(20, { message: usernameMaxError }).optional(),
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
