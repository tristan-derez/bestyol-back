import { Request, Response } from "express";

import { prisma } from "../utils/prismaClient";

//* GET
export const getAllUserSuccessByUserId = async (req: Request, res: Response) => {
    const userId: string = req.params.userId;

    if (isNaN(parseInt(userId, 10))) {
        res.status(400).json({ erreur: "Le paramètre userId doit être un nombre valide" });
        return;
    }

    if (!userId) {
        res.status(400).json({ erreur: "Le paramètre userId est absent de la requête" });
    }

    try {
        const userSuccess = await prisma.userSuccess.findMany({
            where: {
                userId: parseInt(userId, 10),
            },
            include: {
                success: true,
            },
        });

        if (userSuccess.length === 0) {
            return res.status(404).json({ message: "Succès introuvables pour cet utilisateur 😢" });
        }

        return res.status(200).json({ userSuccess });
    } catch (error: any) {
        return res.status(404).json({ erreur: error });
    }
};

//* PATCH
export const validateSuccess = async (req: Request, res: Response) => {
    const userSuccessId: string = req.params.id;
    const yolId: number = req.body.yolId;

    if (isNaN(yolId)) {
        res.status(400).json({ erreur: "Le paramètre yolId doit être un nombre valide" });
        return;
    }

    if (!yolId) {
        res.status(400).json({ erreur: "Le paramètre yolId est absent du corps de la requête" });
        return;
    }

    if (isNaN(parseInt(userSuccessId, 10))) {
        res.status(400).json({ erreur: "Le paramètre userSuccessId doit être un nombre valide" });
        return;
    }

    if (!userSuccessId) {
        res.status(400).json({ erreur: "Le paramètre userSuccessId est absent de la requête" });
        return;
    }

    try {
        const userSuccess = await prisma.userSuccess.findUnique({
            where: { id: parseInt(userSuccessId, 10) },
        });

        if (userSuccess === null) {
            return res.status(404).json({ message: "Succès utilisateur introuvable 😢" });
        } else if (userSuccess.isCompleted === true) {
            return res.status(500).json({ message: "Le succès utilisateur a déjà été complété" });
        }

        const matchingSuccess = await prisma.success.findUnique({
            where: { id: userSuccess.successId },
        });

        if (userSuccess.actualAmount !== matchingSuccess?.amountNeeded) {
            return res.status(500).json({
                message: "Le montant requis pour valider le succès n'a pas été atteint",
                "montant actuel": userSuccess.actualAmount,
                "montant requis": matchingSuccess?.amountNeeded,
            });
        }

        await prisma.userSuccess.update({
            where: { id: parseInt(userSuccessId, 10) },
            data: { isCompleted: true },
        });

        const updatedYol = await prisma.yol.update({
            where: { id: yolId },
            data: { xp: { increment: matchingSuccess.successXp } },
        });

        return res.status(200).json({ message: "Votre Yol a gagné de l'expérience !", yol: updatedYol });
    } catch (error: any) {
        return res.status(500).json({ erreur: "Une erreur s'est produite lors de la validation du succès", error });
    }
};

export default {
    getAllUserSuccessByUserId,
    validateSuccess,
};
