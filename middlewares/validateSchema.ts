import { NextFunction, Request, Response } from "express";

export const validateSchema = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
        });

        next();
    } catch (err: any) {
        console.log(err.errors);
        return res.status(400).json(err.issues[0].message);
    }
};

export default validateSchema;
