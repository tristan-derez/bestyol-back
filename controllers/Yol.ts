import { Request, Response } from "express";
import { prisma } from "../utils/prismaClient";

import { incrementEvolveSuccess } from "../utils/incrementEvolveSuccess";

//* POST
export const createYol = async (req: Request, res: Response) => {
    const { name, userId, speciesId }: { name: string; userId: number; speciesId: number } = req.body;

    if (!name || !userId || !speciesId) {
        return res.status(400).json({
            erreur: "Certains champs requis sont absents du corps de la requête",
            example: {
                name: "Pierre",
                userId: 327,
                speciesId: 3,
            },
        });
    }

    try {
        const yol = await prisma.yol.create({
            data: {
                name: req.body.name,
                xp: 0,
                userId: req.body.userId,
                speciesId: req.body.speciesId,
            },
            include: {
                species: true,
            },
        });

        return res.status(200).json({ yol });
    } catch (error: any) {
        return res.status(404).json({ erreur: error });
    }
};

//* GET
export const getOneYol = async (req: Request, res: Response) => {
    const yolId: string = req.params.yolId;

    if (!yolId) {
        return res.status(400).json({ erreur: "yolId est absent des paramètres de la requête" });
    }

    if (isNaN(parseInt(yolId, 10))) {
        return res.status(400).json({ erreur: "yolId doit être un nombre valide" });
    }

    try {
        const yol = await prisma.yol.findUnique({
            where: {
                id: parseInt(yolId, 10),
            },
            include: {
                species: true,
            },
        });

        return res.status(200).json({ yol });
    } catch (error: any) {
        return res.status(404).json({ erreur: error });
    }
};

export const getOneYolByUserId = async (req: Request, res: Response) => {
    const userId: string = req.params.userId;
    const xpToReachLevelThree = 250;
    const xpToReachLevelTen = 2700;
    const xpToReachLevelTwenty = 10450;

    if (!userId) {
        res.status(400).json({ erreur: "userId est absent des paramètres de la requête" });
        return;
    }

    if (isNaN(parseInt(userId, 10))) {
        res.status(400).json({ erreur: "yolId doit être un nombre valide" });
        return;
    }

    try {
        const yol = await prisma.yol.findMany({
            where: {
                userId: parseInt(userId, 10),
            },
            include: {
                species: true,
            },
        });

        if (yol.length === 0) {
            return res.status(200).json({ message: "Cet utilisateur ne possède pas de Yol !" });
        }

        if (yol[0].xp >= xpToReachLevelThree) {
            const yolLevelThree = await prisma.userSuccess.findFirst({
                where: {
                    userId: parseInt(userId, 10),
                    successId: 17,
                },
            });

            if (yolLevelThree) {
                await prisma.userSuccess.update({
                    where: {
                        id: yolLevelThree.id,
                    },
                    data: {
                        actualAmount: {
                            increment: 1,
                        },
                    },
                });
            }
        } else if (yol[0].xp >= xpToReachLevelTen) {
            const yolLevelTen = await prisma.userSuccess.findFirst({
                where: {
                    userId: parseInt(userId, 10),
                    successId: 18,
                },
            });

            if (yolLevelTen) {
                await prisma.userSuccess.update({
                    where: {
                        id: yolLevelTen.id,
                    },
                    data: {
                        actualAmount: {
                            increment: 1,
                        },
                    },
                });
            }
        } else if (yol[0].xp >= xpToReachLevelTwenty) {
            const yolLevelTwenty = await prisma.userSuccess.findFirst({
                where: {
                    userId: parseInt(userId, 10),
                    successId: 19,
                },
            });

            if (yolLevelTwenty) {
                await prisma.userSuccess.update({
                    where: {
                        id: yolLevelTwenty.id,
                    },
                    data: {
                        actualAmount: {
                            increment: 1,
                        },
                    },
                });
            }
        }

        return res.status(200).json(yol[0]);
    } catch (error: any) {
        return res.status(500).json({ erreur: error });
    }
};

//* PATCH
export const evolve = async (req: Request, res: Response) => {
    const yolId: string = req.params.yolId;

    if (!yolId) {
        res.status(400).json({ details: "yolId est absent des paramètres de la requête" });
        return;
    }

    if (isNaN(parseInt(yolId, 10))) {
        res.status(400).json({ details: "yolId doit être un nombre valide" });
        return;
    }

    try {
        const yolInfo = await prisma.yol.findFirst({
            where: {
                id: parseInt(yolId, 10),
            },
            include: {
                species: true,
            },
        });

        switch (yolInfo?.species.stage) {
            case "Egg":
                if (yolInfo.xp >= 100) {
                    const matchingSpeciesBabyStage = await prisma.species.findFirst({
                        where: {
                            name: yolInfo?.species.name,
                            stage: "Baby",
                        },
                    });

                    if (matchingSpeciesBabyStage === null) {
                        throw Object.assign(new Error(), { details: "Espèce de l'évolution introuvable" });
                    }

                    const yolBaby = await prisma.yol.update({
                        where: {
                            id: parseInt(yolId, 10),
                        },
                        data: {
                            speciesId: matchingSpeciesBabyStage?.id,
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
                        details: "Le Yol n'a pas l'xp requise pour évoluer",
                        xpNeeded: 100,
                        xpYol: yolInfo?.xp,
                    });
                }

            case "Baby":
                if (yolInfo.xp >= 700) {
                    const matchingSpeciesAdolescentStage = await prisma.species.findFirst({
                        where: {
                            name: yolInfo?.species.name,
                            stage: "Adolescent",
                        },
                    });

                    if (matchingSpeciesAdolescentStage === null) {
                        throw Object.assign(new Error(), { details: "Espèce de l'évolution introuvable" });
                    }

                    const yolAdo = await prisma.yol.update({
                        where: {
                            id: parseInt(yolId, 10),
                        },
                        data: {
                            speciesId: matchingSpeciesAdolescentStage?.id,
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
                        details: "Le Yol n'a pas l'xp requise pour évoluer",
                        xpNeeded: 700,
                        xpYol: yolInfo?.xp,
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

                    if (matchingSpeciesFinalStage === null) {
                        throw Object.assign(new Error(), { details: "Espèce de l'évolution introuvable" });
                    }

                    const yolFinal = await prisma.yol.update({
                        where: {
                            id: parseInt(yolId, 10),
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
                        details: "Le Yol n'a pas l'xp requise pour évoluer",
                        xpNeeded: 1750,
                        xpYol: yolInfo?.xp,
                    });
                }

            case "Final":
                res.status(400).json({ details: "Votre Yol est au stade final, il ne peut plus évoluer !" });
                break;

            default:
                return;
        }
    } catch (error: any) {
        console.log(error.message);
        const { status, ...errorWithoutStatus } = error;
        return res.status(error.status || 500).json(errorWithoutStatus);
    }
};

export default {
    createYol,
    getOneYol,
    getOneYolByUserId,
    evolve,
};
