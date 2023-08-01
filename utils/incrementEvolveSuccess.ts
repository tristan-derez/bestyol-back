import { prisma } from "./prismaClient";

export async function incrementEvolveSuccess(userId: number, formerStage: string) {
    const errorSuccess = "Erreur au moment d'incrémenter le succès utilisateur : succès correspondant à l'évolution introuvable";
    const errorUserSuccess = "Erreur au moment d'incrémenter le succès utilisateur : succès utilisateur correspondant à l'évolution introuvable";
    const errorAmount = "Erreur au moment d'incrémenter le succès utilisateur : actualAmount ou amountNeeded undefined";

    switch (formerStage) {
        case "Egg":
            const matchingEggEvolutionSuccess = await prisma.success.findFirst({
                where: {
                    title: "Sorti de l'oeuf",
                },
            });

            if (matchingEggEvolutionSuccess === null) {
                throw Object.assign(new Error(), {
                    details: errorSuccess,
                });
            }

            const matchingEggEvolutionUserSuccess = await prisma.userSuccess.findFirst({
                where: {
                    successId: matchingEggEvolutionSuccess?.id,
                    userId: userId,
                },
            });

            if (matchingEggEvolutionUserSuccess === null) {
                throw Object.assign(new Error(), {
                    details: errorUserSuccess,
                });
            }

            if (matchingEggEvolutionUserSuccess?.actualAmount !== undefined && matchingEggEvolutionSuccess?.amountNeeded !== undefined) {
                if (matchingEggEvolutionUserSuccess.actualAmount < matchingEggEvolutionSuccess.amountNeeded) {
                    await prisma.userSuccess.update({
                        where: {
                            id: matchingEggEvolutionUserSuccess?.id,
                        },
                        data: {
                            actualAmount: {
                                increment: 1,
                            },
                        },
                    });
                }
            } else {
                throw Object.assign(new Error(), {
                    details: errorAmount,
                });
            }
            break;

        case "Baby":
            const matchingBabyEvolutionSuccess = await prisma.success.findFirst({
                where: {
                    title: "Mini Yol",
                },
            });

            if (matchingBabyEvolutionSuccess === null) {
                throw Object.assign(new Error(), {
                    details: errorSuccess,
                });
            }

            const matchingBabyEvolutionUserSuccess = await prisma.userSuccess.findFirst({
                where: {
                    successId: matchingBabyEvolutionSuccess?.id,
                    userId: userId,
                },
            });

            if (matchingBabyEvolutionUserSuccess === null) {
                throw Object.assign(new Error(), {
                    details: errorUserSuccess,
                });
            }

            if (matchingBabyEvolutionUserSuccess?.actualAmount !== undefined && matchingBabyEvolutionSuccess?.amountNeeded !== undefined) {
                if (matchingBabyEvolutionUserSuccess.actualAmount < matchingBabyEvolutionSuccess.amountNeeded) {
                    await prisma.userSuccess.update({
                        where: {
                            id: matchingBabyEvolutionUserSuccess?.id,
                        },
                        data: {
                            actualAmount: {
                                increment: 1,
                            },
                        },
                    });
                }
            } else {
                throw Object.assign(new Error(), {
                    details: errorAmount,
                });
            }
            break;

        case "Adolescent":
            const matchingAdoEvolutionSuccess = await prisma.success.findFirst({
                where: {
                    title: "Grand Yol",
                },
            });

            if (matchingAdoEvolutionSuccess === null) {
                throw Object.assign(new Error(), {
                    details: errorSuccess,
                });
            }

            const matchingAdoEvolutionUserSuccess = await prisma.userSuccess.findFirst({
                where: {
                    successId: matchingAdoEvolutionSuccess?.id,
                    userId: userId,
                },
            });

            if (matchingAdoEvolutionUserSuccess === null) {
                throw Object.assign(new Error(), {
                    details: errorUserSuccess,
                });
            }

            if (matchingAdoEvolutionUserSuccess?.actualAmount !== undefined && matchingAdoEvolutionSuccess?.amountNeeded !== undefined) {
                if (matchingAdoEvolutionUserSuccess.actualAmount < matchingAdoEvolutionSuccess.amountNeeded) {
                    await prisma.userSuccess.update({
                        where: {
                            id: matchingAdoEvolutionUserSuccess?.id,
                        },
                        data: {
                            actualAmount: {
                                increment: 1,
                            },
                        },
                    });
                }
            } else {
                throw Object.assign(new Error(), {
                    details: errorAmount,
                });
            }
            break;
        default:
            return;
    }
}
