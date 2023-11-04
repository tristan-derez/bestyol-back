import { z } from "zod";

const yolMinChar: number = 1;
const yolMaxChar: number = 50;
const yolLengthError: string = `Le nom du Yol doit contenir entre ${yolMinChar} et ${yolMaxChar} caractères`;
const validSpeciesIds = [1, 5, 9];

export const CreateYolSchema = z.object({
    body: z.object({
        name: z.string().min(yolMinChar, { message: yolLengthError }).max(yolMaxChar, { message: yolLengthError }),
        userId: z.number({ invalid_type_error: "userId doit être une chaine de caractère", required_error: "Ce champ est requis" }),
        speciesId: z
            .number({ invalid_type_error: "speciesId doit être un nombre", required_error: "Ce champ est requis" })
            .refine((value) => validSpeciesIds.includes(value), {
                message: "speciesId doit être l'une des valeurs suivantes: 1, 5, 9",
            }),
    }),
});

export const GetOneYolSchema = z.object({
    params: z.object({
        yolId: z.string().refine(
            (value) => {
                const parsedValue = parseInt(value, 10);
                return !isNaN(parsedValue) && isFinite(parsedValue);
            },
            {
                message: "Ce paramètre doit être un nombre valide",
                path: ["yolId"],
            }
        ),
    }),
});

export const GetOneYolByUserIdSchema = z.object({
    params: z.object({
        userId: z.string().refine(
            (value) => {
                const parsedValue = parseInt(value, 10);
                return !isNaN(parsedValue) && isFinite(parsedValue);
            },
            {
                message: "Ce paramètre doit être un nombre valide",
                path: ["userId"],
            }
        ),
    }),
});

export const EvolveYolSchema = z.object({
    params: z.object({
        yolId: z.string().refine(
            (value) => {
                const parsedValue = parseInt(value, 10);
                return !isNaN(parsedValue) && isFinite(parsedValue);
            },
            {
                message: "Ce paramètre doit être un nombre valide",
                path: ["yolId"],
            }
        ),
    }),
});
