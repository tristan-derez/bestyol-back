import { Species, Yol } from "@prisma/client";
import { incrementEvolveSuccess } from "./incrementEvolveSuccess";
import { prisma } from "../services/prismaClient";

interface YolWithSpecies extends Yol {
    species: Species;
}

export const switchYolStage = async (yolId: number, yol: YolWithSpecies) => {
    try {
        switch (yol.species.stage) {
            case "Egg":
                if (yol.xp >= 100) {
                    const matchingSpeciesBabyStage = await prisma.species.findFirst({
                        where: {
                            name: yol.species.name,
                            stage: "Baby",
                        },
                    });

                    if (!matchingSpeciesBabyStage) return new Error("Évolution introuvable");

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

                    await incrementEvolveSuccess(yol.userId, "Egg");

                    return { message: "Votre Yol a éclos !", newSpecies: yolBaby.species };
                } else {
                    throw Object.assign(new Error(), {
                        status: 400,
                        message: `Le Yol n'a pas l'xp requise pour évoluer, xp nécessaire: 100, xp du yol: ${yol.xp}`,
                    });
                }
            case "Baby":
                if (yol.xp >= 700) {
                    const matchingSpeciesAdolescentStage = await prisma.species.findFirst({
                        where: {
                            name: yol.species.name,
                            stage: "Adolescent",
                        },
                    });

                    if (!matchingSpeciesAdolescentStage) return new Error("Évolution introuvable");

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

                    await incrementEvolveSuccess(yol.userId, "Baby");

                    return { message: "Votre Yol est passé au stade d'adolescent !", newSpecies: yolAdo.species };
                } else {
                    throw Object.assign(new Error(), {
                        status: 400,
                        message: `Le Yol n'a pas l'xp requise pour évoluer, xp nécessaire: 700, xp du yol: ${yol.xp}`,
                    });
                }

            case "Adolescent":
                if (yol.xp >= 1750) {
                    const matchingSpeciesFinalStage = await prisma.species.findFirst({
                        where: {
                            name: yol.species.name,
                            stage: "Final",
                        },
                    });

                    if (!matchingSpeciesFinalStage) return new Error("Évolution introuvable");

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

                    await incrementEvolveSuccess(yol.userId, "Adolescent");

                    return { message: "Votre Yol est passé au stade final !", newSpecies: yolFinal.species };
                } else {
                    throw Object.assign(new Error(), {
                        status: 400,
                        message: `Le Yol n'a pas l'xp requise pour évoluer, xp nécessaire: 1750, xp du yol: ${yol.xp}`,
                    });
                }

            case "Final":
                return { message: "Le Yol a atteint sa forme finale. Il ne peut plus évoluer.", newSpecies: yol.species };

            default:
                return;
        }
    } catch (error: any) {
        throw Error(error);
    }
};
