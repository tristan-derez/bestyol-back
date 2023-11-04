import { NextFunction, Request, Response } from "express";

import { prisma, Species } from "../services/prismaClient";

//* GET
export const getAllSpecies = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const species: Species[] = await prisma.species.findMany();

        return res.status(200).json({ species });
    } catch (error: any) {
        next(error);
    }
};

export default { getAllSpecies };
