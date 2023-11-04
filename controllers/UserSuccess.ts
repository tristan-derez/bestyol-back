import { Request, Response, NextFunction } from "express";

import { prisma } from "../services/prismaClient";

//* GET
export const getAllUserSuccessByUserId = async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = Number(req.params.userId);

    try {
        const userSuccess = await prisma.userSuccess.findMany({
            where: {
                userId: userId,
            },
            include: {
                success: true,
            },
        });

        if (userSuccess.length === 0) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Succès introuvables pour cet utilisateur",
            });
        }

        return res.status(200).json({ data: [{ userSuccess }] });
    } catch (error: any) {
        next(error);
    }
};

//* PATCH
export const validateSuccess = async (req: Request, res: Response, next: NextFunction) => {
    const userSuccessId: number = Number(req.params.userSuccessId);
    const yolId: number = Number(req.body.yolId);

    try {
        const userSuccess = await prisma.userSuccess.findUnique({
            where: { id: userSuccessId, isCompleted: false },
        });

        if (!userSuccess) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Succès utilisateur introuvable",
            });
        }

        const matchingSuccess = await prisma.success.findUnique({
            where: { id: userSuccess.successId },
            select: { id: true, amountNeeded: true, successXp: true },
        });

        if (!matchingSuccess) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Succès associé au succès utilisateur introuvable",
            });
        }

        if (userSuccess.actualAmount < matchingSuccess.amountNeeded) {
            throw Object.assign(new Error(), {
                status: 400,
                message: `Le montant requis pour valider le succès n'a pas été atteint, montant actuel: ${userSuccess.actualAmount}, montant demandé: ${matchingSuccess.amountNeeded}`,
            });
        }

        await prisma.$transaction([
            prisma.userSuccess.update({
                where: { id: userSuccessId },
                data: { isCompleted: true },
            }),
            prisma.yol.update({
                where: { id: yolId },
                data: { xp: { increment: matchingSuccess.successXp } },
            }),
        ]);

        const updatedYol = await prisma.yol.findFirst({
            where: { id: yolId },
        });

        return res.status(200).json({ yol: updatedYol });
    } catch (error: any) {
        next(error);
    }
};

export default {
    getAllUserSuccessByUserId,
    validateSuccess,
};
