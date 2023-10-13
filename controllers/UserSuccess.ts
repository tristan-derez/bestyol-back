import { Request, Response } from "express";

import { prisma } from "../utils/prismaClient";

//* GET
export const getAllUserSuccessByUserId = async (req: Request, res: Response) => {
    const userId: number = Number(req.params.userId);

    try {
        if (!userId || isNaN(userId)) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "userId est absent de la requête ou n'est pas un nombre valide",
            });
        }

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

        return res.status(200).json({ userSuccess });
    } catch (error: any) {
        return res.status(error.status || 500).json({ message: error.message || "Erreur interne" });
    }
};

//* PATCH
export const validateSuccess = async (req: Request, res: Response) => {
    const userSuccessId: number = Number(req.params.id);
    const yolId: number = req.body.yolId;

    try {
        if (!userSuccessId || isNaN(userSuccessId)) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "userSuccessId est absent de la requête ou n'est pas un nombre valide",
            });
        }

        if (!yolId) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "yolId est absent du corps de la requête ou n'est pas un nombre valide",
            });
        }

        const userSuccess = await prisma.userSuccess.findUnique({
            where: { id: userSuccessId },
        });

        if (!userSuccess) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Succès utilisateur introuvable",
            });
        }

        if (userSuccess.isCompleted) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le succès utilisateur a déjà été complété",
            });
        }

        const matchingSuccess = await prisma.success.findUnique({
            where: { id: userSuccess.successId },
        });

        if (!matchingSuccess) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Succès associé au succès utilisateur introuvable",
            });
        }

        if (userSuccess && matchingSuccess) {
            if (userSuccess.actualAmount !== matchingSuccess.amountNeeded) {
                throw Object.assign(new Error(), {
                    status: 400,
                    message: "Le montant requis pour valider le succès n'a pas été atteint",
                    "montant actuel": userSuccess.actualAmount,
                    "montant requis": matchingSuccess.amountNeeded,
                });
            }
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
        return res.status(error.status || 500).json({ message: error.message || "Erreur interne" });
    }
};

export default {
    getAllUserSuccessByUserId,
    validateSuccess,
};
