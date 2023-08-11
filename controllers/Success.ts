import { Request, Response } from "express";

import { prisma, Success } from "../utils/prismaClient";

//* GET
export const getAllSuccess = async (_req: Request, res: Response) => {
    try {
        const success: Success[] = await prisma.success.findMany();

        if (success === null) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Succès introuvables",
            });
        }

        return res.status(200).json({ success });
    } catch (error: any) {
        return res.status(error.status || 500).json({ erreur: error.message || "Erreur interne" });
    }
};

export const getOneSuccess = async (req: Request, res: Response) => {
    const successId: string = req.params.id;

    try {
        if (!successId) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Requête invalide, exemple: paramètre manquant",
            });
        }

        if (isNaN(parseInt(successId, 10))) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre successId doit être un nombre valide",
            });
        }

        const success = await prisma.success.findUnique({ where: { id: parseInt(successId, 10) } });

        if (!success) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Succès introuvable",
            });
        }

        return res.status(200).json({ ...success });
    } catch (error: any) {
        return res.status(error.status || 500).json({ erreur: error.message || "Erreur interne" });
    }
};

export default {
    getAllSuccess,
    getOneSuccess,
};
