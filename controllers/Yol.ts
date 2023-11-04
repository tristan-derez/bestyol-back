import { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/prismaClient";

import { AuthenticatedRequest } from "../middlewares/idValidation";
import { checkYolXpToValidateSuccess } from "../utils/checkYolXpToValidateSuccess";
import { switchYolStage } from "../utils/switchYolStage";

//* POST
export const createYol = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { name, userId, speciesId }: { name: string; userId: number; speciesId: number } = req.body;

    try {
        const yol = await prisma.yol.create({
            data: {
                name,
                xp: 0,
                userId,
                speciesId: speciesId,
            },
            include: {
                species: true,
            },
        });

        return res.status(200).json({ yol });
    } catch (error: any) {
        next(error);
    }
};

//* GET
export const getOneYol = async (req: Request, res: Response, next: NextFunction) => {
    const yolId: number = Number(req.params.yolId);

    try {
        const yol = await prisma.yol.findUnique({
            where: {
                id: yolId,
            },
            include: {
                species: true,
            },
        });

        return res.status(200).json({ yol });
    } catch (error: any) {
        next(error);
    }
};

export const getOneYolByUserId = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId: number = Number(req.params.userId);

    try {
        const yol = await prisma.yol.findMany({
            where: {
                userId: userId,
            },
            include: {
                species: true,
            },
        });

        if (yol.length === 0) {
            return res.status(200).json({ message: "Cet utilisateur ne possède pas de Yol" });
        }

        // we check if the Yol has enough XP to validate success
        // associated to it
        checkYolXpToValidateSuccess(userId, yol);

        return res.status(200).json(yol[0]);
    } catch (error: any) {
        next(error);
    }
};

//* PATCH
export const evolveYol = async (req: Request, res: Response, next: NextFunction) => {
    const yolId: number = Number(req.params.yolId);

    try {
        const yolInfo = await prisma.yol.findFirst({
            where: {
                id: yolId,
            },
            include: {
                species: true,
            },
        });

        if (!yolInfo) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Le Yol est introuvable",
            });
        }

        await switchYolStage(yolId, yolInfo);
    } catch (error: any) {
        next(error);
    }
};

export default {
    createYol,
    getOneYol,
    getOneYolByUserId,
    evolveYol,
};
