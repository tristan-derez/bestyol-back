import { Request, Response } from "express";
import { prisma } from "../utils/prismaClient";

import { incrementEvolveSuccess } from "../utils/incrementEvolveSuccess";

//* POST
export const createYol = async (req: Request, res: Response) => {
    const { name, userId, speciesId }: { name: string; userId: number; speciesId: number } = req.body;

    // we prevent user from selecting
    // something else than every species as egg
    if (![1, 5, 9].includes(speciesId)) {
        throw Object.assign(new Error(), {
            status: 400,
            message: "speciesId must be 1, 5, or 9",
        });
    }

    if (!name || !userId || !speciesId) {
        throw Object.assign(new Error(), {
            status: 400,
            exemple: {
                name: "Pika",
                userId: 327,
                speciesId: 1,
            },
            message: "Certains champs requis sont absents du corps de la requête",
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
        const errorMessage = error.message || "Erreur interne";
        const errorStatus = error.status || 500;
        const errorExample = error.exemple || null;
        return res.status(errorStatus).json({ message: errorMessage, exemple: errorExample });
    }
};

//* GET
export const getOneYol = async (req: Request, res: Response) => {
    const yolId: number = Number(req.params.yolId);

    if (!yolId || isNaN(yolId)) {
        throw Object.assign(new Error(), {
            status: 400,
            message: "yolId est absent de la requête ou n'est pas un nombre valide",
        });
    }

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
        const errorMessage = error.message || "Erreur interne";
        const errorStatus = error.status || 500;
        return res.status(errorStatus).json({ message: errorMessage });
    }
};

export const getOneYolByUserId = async (req: Request, res: Response) => {
    const userId: number = Number(req.params.userId);
    const xpToReachLevelThree = 250;
    const xpToReachLevelTen = 2700;
    const xpToReachLevelTwenty = 10450;

    try {
        if (!userId || isNaN(userId)) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "userId est absent de la requête ou n'est pas un nombre valide",
            });
        }

        const yol = await prisma.yol.findMany({
            where: {
                userId: userId,
            },
            include: {
                species: true,
            },
        });

        if (yol.length === 0) {
            return res.status(200).json({ message: "Cet utilisateur ne possède pas de Yol !" });
        }

        if (yol[0].xp >= xpToReachLevelThree) {
            const yolLevelThreeUserSuccess = await prisma.userSuccess.findFirst({
                where: {
                    userId: userId,
                    successId: 17,
                },
            });

            if (yolLevelThreeUserSuccess && !yolLevelThreeUserSuccess.isCompleted) {
                await prisma.userSuccess.update({
                    where: {
                        id: yolLevelThreeUserSuccess.id,
                    },
                    data: {
                        actualAmount: {
                            increment: 1,
                        },
                        isCompleted: true,
                    },
                });
            }
        }

        if (yol[0].xp >= xpToReachLevelTen) {
            const yolLevelTenUserSuccess = await prisma.userSuccess.findFirst({
                where: {
                    userId: userId,
                    successId: 18,
                },
            });

            if (yolLevelTenUserSuccess && !yolLevelTenUserSuccess.isCompleted) {
                await prisma.userSuccess.update({
                    where: {
                        id: yolLevelTenUserSuccess.id,
                    },
                    data: {
                        actualAmount: {
                            increment: 1,
                        },
                        isCompleted: true,
                    },
                });
            }
        }

        if (yol[0].xp >= xpToReachLevelTwenty) {
            const yolLevelTwentyUserSuccess = await prisma.userSuccess.findFirst({
                where: {
                    userId: userId,
                    successId: 19,
                },
            });

            if (yolLevelTwentyUserSuccess && !yolLevelTwentyUserSuccess.isCompleted) {
                await prisma.userSuccess.update({
                    where: {
                        id: yolLevelTwentyUserSuccess.id,
                    },
                    data: {
                        actualAmount: {
                            increment: 1,
                        },
                        isCompleted: true,
                    },
                });
            }
        }

        return res.status(200).json(yol[0]);
    } catch (error: any) {
        return res.status(500).json({ message: error });
    }
};

//* PATCH
export const evolve = async (req: Request, res: Response) => {
    const yolId: number = Number(req.params.yolId);

    try {
        if (!yolId || isNaN(yolId)) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "yolId est absent de la requête ou n'est pas un nombre valide",
            });
        }

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
        return res.status(error.status || 500).json(errorWithoutStatus);
    }
};

export default {
    createYol,
    getOneYol,
    getOneYolByUserId,
    evolve,
};
