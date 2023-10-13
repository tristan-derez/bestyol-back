import { z } from "zod";

const yolMinChar: number = 2;
const yolMaxChar: number = 20;
const yolMinError: string = `Le nom du Yol doit contenir au moins ${yolMinChar} caractères`;
const yolMaxError: string = `Le nom du Yol ne doit pas dépasser ${yolMaxChar} caractères`;

export const nameYolSchema = z.object({
    body: z.object({
        name: z.string().min(yolMinChar, { message: yolMinError }).max(yolMaxChar, { message: yolMaxError }),
    }),
});
