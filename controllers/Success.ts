import { NextFunction, Request, Response } from "express";

import { prisma, Success } from "../services/prismaClient";

//* GET
export const getAllSuccess = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const success: Success[] = await prisma.success.findMany();

        if (!success) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Succès introuvables",
            });
        }

        return res.status(200).json({ data: [{ success }] });
    } catch (error: any) {
        next(error);
    }
};

export const getOneSuccess = async (req: Request, res: Response, next: NextFunction) => {
    const successId: number = Number(req.params.successId);

    try {
        const success: Success | null = await prisma.success.findUnique({ where: { id: successId } });

        if (!success) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Succès introuvable",
            });
        }

        return res.status(200).json({ ...success });
    } catch (error: any) {
        next(error);
    }
};

export default {
    getAllSuccess,
    getOneSuccess,
};
