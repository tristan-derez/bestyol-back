import { Request, Response } from "express";

import { prisma, Species } from "../utils/prismaClient";

//* GET
export const getAllSpecies = async (_req: Request, res: Response) => {
    try {
        const species: Species[] = await prisma.species.findMany();

        if (species === null) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Espèces introuvables",
            });
        }

        return res.status(200).json({ species });
    } catch (error: any) {
        return res.status(error.status || 500).json({ erreur: error.message || "Erreur interne" });
    }
};

export default {
    getAllSpecies,
};
