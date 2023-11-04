import { Request, Response } from "express";

import { prisma, Success } from "../services/prismaClient";

//* GET
export const getAllSuccess = async (_req: Request, res: Response) => {
    try {
        const success: Success[] = await prisma.success.findMany();

        if (!success) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Succès introuvables",
            });
        }

        return res.status(200).json({ success });
    } catch (error: any) {
        return res.status(error.status || 500).json({ message: error.message || "Erreur interne" });
    }
};

export const getOneSuccess = async (req: Request, res: Response) => {
    const successId: number = Number(req.params.id);

    try {
        if (!successId || isNaN(successId)) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "successId est absent de la requête ou n'est pas un nombre valide",
            });
        }

        const success = await prisma.success.findUnique({ where: { id: successId } });

        if (!success) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Succès introuvable",
            });
        }

        return res.status(200).json({ ...success });
    } catch (error: any) {
        return res.status(error.status || 500).json({ message: error.message || "Erreur interne" });
    }
};

export default {
    getAllSuccess,
    getOneSuccess,
};
