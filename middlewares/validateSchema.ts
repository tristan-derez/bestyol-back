import { NextFunction, Request, Response } from "express";

export const validateSchema = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
        });

        next();
    } catch (err: any) {
        return res.status(400).json({ message: err.issues[0].message });
    }
};

export default validateSchema;
