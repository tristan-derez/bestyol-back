import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateSchema = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    const errors = [];

    try {
        schema.parse({
            headers: req.headers,
            params: req.params,
            body: req.body,
        });

        next();
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            for (const issue of err.issues) {
                errors.push({
                    path: issue.path[1],
                    message: issue.message.toLowerCase(),
                });
            }

            return res.status(400).json({ erreurs: errors });
        }
    }
};

export default validateSchema;
