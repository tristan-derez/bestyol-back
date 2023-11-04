import z from "zod";

export const GetAllUserSuccessByUserIdSchema = z.object({
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

export const ValidateUserSuccessSchema = z.object({
    params: z.object({
        userSuccessId: z.string().refine(
            (value) => {
                const parsedValue = parseInt(value, 10);
                return !isNaN(parsedValue) && isFinite(parsedValue);
            },
            {
                message: "Le paramètre userSuccessId doit être un nombre valide",
                path: ["userSuccessId"],
            }
        ),
    }),
    body: z.object({
        yolId: z.number({ invalid_type_error: "yolId doit être un nombre valide", required_error: "Ce champ est requis" }),
    }),
});
