import z from "zod";

export const GetSuccessByIdSchema = z.object({
    params: z.object({
        successId: z.string().refine(
            (value) => {
                const parsedValue = parseInt(value, 10);
                return !isNaN(parsedValue) && isFinite(parsedValue);
            },
            {
                message: "Le paramètre successId doit être un nombre valide",
                path: ["successId"],
            }
        ),
    }),
});
