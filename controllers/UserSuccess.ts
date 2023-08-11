import { Request, Response } from "express";

import { prisma } from "../utils/prismaClient";

//* GET
export const getAllUserSuccessByUserId = async (req: Request, res: Response) => {
    const userId: string = req.params.userId;

    try {
        if (!userId) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre userId est absent de la requête",
            });
        }

        if (isNaN(parseInt(userId, 10))) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre userId doit être un nombre valide",
            });
        }

        const userSuccess = await prisma.userSuccess.findMany({
            where: {
                userId: parseInt(userId, 10),
            },
            include: {
                success: true,
            },
        });

        if (userSuccess.length === 0) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Succès introuvables pour cet utilisateur 😢",
            });
        }

        return res.status(200).json({ userSuccess });
    } catch (error: any) {
        return res.status(error.status || 500).json({ erreur: error.message || "Erreur interne" });
    }
};

//* PATCH
export const validateSuccess = async (req: Request, res: Response) => {
    const userSuccessId: string = req.params.id;
    const yolId: number = req.body.yolId;

    try {
        if (!userSuccessId) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre userSuccessId est absent du corps de la requête",
            });
        }

        if (isNaN(parseInt(userSuccessId, 10))) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre userSuccessId doit être un nombre valide",
            });
        }

        if (!yolId) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre yolId est absent du corps de la requête",
            });
        }

        if (isNaN(yolId)) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre yolId doit être un nombre valide",
            });
        }

        const userSuccess = await prisma.userSuccess.findUnique({
            where: { id: parseInt(userSuccessId, 10) },
        });

        if (!userSuccess) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Succès utilisateur introuvable 😢",
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

        await prisma.userSuccess.update({
            where: { id: parseInt(userSuccessId, 10) },
            data: { isCompleted: true },
        });

        const updatedYol = await prisma.yol.update({
            where: { id: yolId },
            data: { xp: { increment: matchingSuccess.successXp } },
        });

        if (!updatedYol) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Erreur lors de l'ajout d'experience au Yol",
            });
        }

        return res.status(200).json({ message: "Votre Yol a gagné de l'expérience !", yol: updatedYol });
    } catch (error: any) {
        return res.status(error.status || 500).json({ erreur: error.message || "Erreur interne" });
    }
};

export default {
    getAllUserSuccessByUserId,
    validateSuccess,
};
