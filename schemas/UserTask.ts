import z from "zod";

export const CreateUserCustomTaskSchema = z.object({
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
        title: z
            .string({ invalid_type_error: "Le titre doit être une chaine de caractères", required_error: "Ce champ est requis" })
            .max(200, "Le titre ne peut pas faire plus de 200 caractères"),
    }),
});

export const CreateUserDailyTasksSchema = z.object({
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

export const GetUserTasksSchema = z.object({
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

export const UpdateCustomTaskSchema = z.object({
    params: z.object({
        taskId: z.string().refine(
            (value) => {
                const parsedValue = parseInt(value, 10);
                return !isNaN(parsedValue) && isFinite(parsedValue);
            },
            {
                message: "Le paramètre taskId doit être un nombre valide",
                path: ["taskId"],
            }
        ),
    }),
    body: z.object({
        title: z
            .string({ invalid_type_error: "Le titre doit être une chaine de caractères", required_error: "Ce champ est requis" })
            .max(200, "Le titre ne peut pas faire plus de 200 caractères"),
    }),
});

export const ValidateDailyTaskSchema = z.object({
    params: z.object({
        userTaskId: z.string().refine(
            (value) => {
                const parsedValue = parseInt(value, 10);
                return !isNaN(parsedValue) && isFinite(parsedValue);
            },
            {
                message: "Le paramètre userTaskId doit être un nombre valide",
                path: ["userTaskId"],
            }
        ),
    }),
    body: z.object({
        yolId: z.number({ invalid_type_error: "yolId doit être un nombre valide", required_error: "Ce champ est requis" }),
    }),
});

export const ValidateCustomTaskSchema = z.object({
    params: z.object({
        userTaskId: z.string().refine(
            (value) => {
                const parsedValue = parseInt(value, 10);
                return !isNaN(parsedValue) && isFinite(parsedValue);
            },
            {
                message: "Le paramètre userTaskId doit être un nombre valide",
                path: ["userTaskId"],
            }
        ),
    }),
});

export const DeleteCustomTaskSchema = z.object({
    params: z.object({
        taskId: z.string().refine(
            (value) => {
                const parsedValue = parseInt(value, 10);
                return !isNaN(parsedValue) && isFinite(parsedValue);
            },
            {
                message: "Le paramètre taskId doit être un nombre valide",
                path: ["taskId"],
            }
        ),
    }),
});
