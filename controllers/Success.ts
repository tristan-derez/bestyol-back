import { Request, Response } from "express";

import { prisma, Success } from "../utils/prismaClient";

//* GET
export const getAllSuccess = async (_req: Request, res: Response) => {
    try {
        const success: Success[] = await prisma.success.findMany();

        if (success === null) {
            return res.status(404).json({ message: "Succès introuvables 😢" });
        }

        return res.status(200).json({ success });
    } catch (error: any) {
        return res.status(404).json({ erreur: error });
    }
};

export const getOneSuccess = async (req: Request, res: Response) => {
    const successId: string = req.params.id;

    if (isNaN(parseInt(successId, 10))) {
        res.status(400).json({ erreur: "Le paramètre userId doit être un nombre valide" });
        return;
    }

    if (!successId) {
        res.status(400).json({ erreur: "Le paramètre userId est absent de la requête" });
    }

    try {
        const success: Success | null = await prisma.success.findUnique({ where: { id: parseInt(successId, 10) } });

        if (success === null) {
            return res.status(404).json({ message: "Succès introuvable 😢" });
        }

        return res.status(200).json({ ...success });
    } catch (error: any) {
        return res.status(404).json({ erreur: error });
    }
};

export default {
    getAllSuccess,
    getOneSuccess,
};
