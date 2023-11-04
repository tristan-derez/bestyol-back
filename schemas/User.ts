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

export const GetUserByIdSchema = z.object({
    params: z.object({
        userId: z.string().refine(
            (value) => {
                const parsedValue = parseInt(value, 10);
                return !isNaN(parsedValue) && isFinite(parsedValue);
            },
            {
                message: "Le paramètre userId doit être un nombre valide",
                path: ["userId"],
            }
        ),
    }),
});

export const EditUsernameEmailSchema = z.object({
    params: z.object({
        userId: z.string().refine(
            (value) => {
                const parsedValue = parseInt(value, 10);
                return !isNaN(parsedValue) && isFinite(parsedValue);
            },
            {
                message: "Le paramètre userId doit être un nombre valide",
                path: ["userId"],
            }
        ),
    }),
    body: z.object({
        username: z.string().max(usernameMaxChar, { message: usernameLengthError }).optional(),
        email: z.string().email({ message: emailError }).optional(),
    }),
});

export const EditUserPasswordSchema = z.object({
    params: z.object({
        userId: z.string().refine(
            (value) => {
                const parsedValue = parseInt(value, 10);
                return !isNaN(parsedValue) && isFinite(parsedValue);
            },
            {
                message: "Le paramètre userId doit être un nombre valide",
                path: ["userId"],
            }
        ),
    }),
    body: z
        .object({
            formerPassword: z.string(),
            newPassword: z.string().min(12, "Le mot de passe doit contenir au moins 12 caractères"),
        })
        .refine(
            ({ formerPassword, newPassword }) => {
                return formerPassword !== newPassword;
            },
            {
                message: "Les mots de passe doivent être différents",
                path: ["newPassword"], // You can specify the field you want to associate the error with
            }
        ),
});

export const EditUserPictureSchema = z.object({
    params: z.object({
        userId: z.string().refine(
            (value) => {
                const parsedValue = parseInt(value, 10);
                return !isNaN(parsedValue) && isFinite(parsedValue);
            },
            {
                message: "Le paramètre userId doit être un nombre valide",
                path: ["userId"],
            }
        ),
    }),
    body: z.object({
        pictureNumber: z.number().refine((value) => value >= 1 && value <= 48, {
            message: "Doit être un nombre entre 1 et 48",
            path: ["pictureNumber"],
        }),
    }),
});

export const DeleteUserSchema = z.object({
    params: z.object({
        userId: z.string().refine(
            (value) => {
                const parsedValue = parseInt(value, 10);
                return !isNaN(parsedValue) && isFinite(parsedValue);
            },
            {
                message: "Le paramètre userId doit être un nombre valide",
                path: ["userId"],
            }
        ),
    }),
    body: z.object({
        password: z.string({ invalid_type_error: "Password doit être une chaine de caractères", required_error: "Le mot de passe est requis" }),
    }),
});
