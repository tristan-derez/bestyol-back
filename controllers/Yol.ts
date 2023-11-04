import { NextFunction, Request, Response } from "express";
import { prisma } from "../utils/prismaClient";

import { incrementEvolveSuccess } from "../utils/incrementEvolveSuccess";
import { AuthenticatedRequest } from "../middlewares/idValidation";
import { checkYolXpToValidateSuccess } from "../utils/checkYolXpToValidateSuccess";

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

        switch (yolInfo.species.stage) {
            case "Egg":
                if (yolInfo.xp >= 100) {
                    const matchingSpeciesBabyStage = await prisma.species.findFirst({
                        where: {
                            name: yolInfo.species.name,
                            stage: "Baby",
                        },
                    });

                    if (!matchingSpeciesBabyStage) {
                        throw Object.assign(new Error(), {
                            status: 404,
                            message: "Évolution introuvable",
                        });
                    }

                    const yolBaby = await prisma.yol.update({
                        where: {
                            id: yolId,
                        },
                        data: {
                            speciesId: matchingSpeciesBabyStage.id,
                        },
                        include: {
                            species: true,
                        },
                    });

                    await incrementEvolveSuccess(yolInfo.userId, "Egg");

                    return res.status(200).json({ message: "Votre Yol a éclos !", newSpecies: yolBaby.species });
                } else {
                    throw Object.assign(new Error(), {
                        status: 400,
                        message: "Le Yol n'a pas l'xp requise pour évoluer",
                        xpNeeded: 100,
                        xpYol: yolInfo?.xp,
                    });
                }
            case "Baby":
                if (yolInfo.xp >= 700) {
                    const matchingSpeciesAdolescentStage = await prisma.species.findFirst({
                        where: {
                            name: yolInfo.species.name,
                            stage: "Adolescent",
                        },
                    });

                    if (!matchingSpeciesAdolescentStage) {
                        throw Object.assign(new Error(), { message: "Espèce de l'évolution introuvable" });
                    }

                    const yolAdo = await prisma.yol.update({
                        where: {
                            id: yolId,
                        },
                        data: {
                            speciesId: matchingSpeciesAdolescentStage.id,
                        },
                        include: {
                            species: true,
                        },
                    });

                    await incrementEvolveSuccess(yolInfo.userId, "Baby");

                    return res.status(200).json({ message: "Votre Yol est passé au stade d'adolescent !", newSpecies: yolAdo.species });
                } else {
                    throw Object.assign(new Error(), {
                        status: 400,
                        message: "Le Yol n'a pas l'xp requise pour évoluer",
                        xpNeeded: 700,
                        xpYol: yolInfo.xp,
                    });
                }

            case "Adolescent":
                if (yolInfo.xp >= 1750) {
                    const matchingSpeciesFinalStage = await prisma.species.findFirst({
                        where: {
                            name: yolInfo?.species.name,
                            stage: "Final",
                        },
                    });

                    if (!matchingSpeciesFinalStage) {
                        throw Object.assign(new Error(), { message: "Espèce de l'évolution introuvable" });
                    }

                    const yolFinal = await prisma.yol.update({
                        where: {
                            id: yolId,
                        },
                        data: {
                            speciesId: matchingSpeciesFinalStage?.id,
                        },
                        include: {
                            species: true,
                        },
                    });

                    await incrementEvolveSuccess(yolInfo.userId, "Adolescent");

                    return res.status(200).json({ message: "Votre Yol est passé au stade final !", newSpecies: yolFinal.species });
                } else {
                    throw Object.assign(new Error(), {
                        status: 400,
                        message: "Le Yol n'a pas l'xp requise pour évoluer",
                        xpNeeded: 1750,
                        xpYol: yolInfo.xp,
                    });
                }

            case "Final":
                res.status(400).json({ message: "Votre Yol est au stade final, il ne peut plus évoluer !" });
                break;

            default:
                return;
        }
    } catch (error: any) {
        const { status, ...errorWithoutStatus } = error;
        next(error);
    }
};

export default {
    createYol,
    getOneYol,
    getOneYolByUserId,
    evolveYol,
};
