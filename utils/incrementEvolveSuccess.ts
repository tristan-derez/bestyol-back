import { error } from "console";
import { prisma } from "../services/prismaClient";

export async function incrementEvolveSuccess(userId: number, formerStage: string) {
    const errorSuccess = "Erreur au moment d'incrémenter le succès utilisateur : succès correspondant à l'évolution introuvable";
    const errorUserSuccess = "Erreur au moment d'incrémenter le succès utilisateur : succès utilisateur correspondant à l'évolution introuvable";

    switch (formerStage) {
        case "Egg":
            // search corresponding success in success table to get the id
            const matchingEggEvolutionSuccess = await prisma.success.findFirst({
                where: {
                    title: "Sorti de l'oeuf",
                },
                select: {
                    id: true,
                    amountNeeded: true,
                },
            });

            // throw if not found, but is unlikely
            if (!matchingEggEvolutionSuccess) throw new Error(errorSuccess);

            // we check if user got the success
            const matchingEggEvolutionUserSuccess = await prisma.userSuccess.findFirst({
                where: {
                    successId: matchingEggEvolutionSuccess.id,
                    userId: userId,
                },
                select: {
                    actualAmount: true,
                    id: true,
                },
            });

            // throw if not found
            if (!matchingEggEvolutionUserSuccess) throw new Error(errorUserSuccess);

            // increment userSuccess by one if found and the actualAmount is less than amoundNeeded
            if (matchingEggEvolutionUserSuccess.actualAmount < matchingEggEvolutionSuccess.amountNeeded) {
                await prisma.userSuccess.update({
                    where: {
                        id: matchingEggEvolutionUserSuccess.id,
                    },
                    data: {
                        actualAmount: {
                            increment: 1,
                        },
                    },
                });
            }

            break;

        case "Baby":
            const matchingBabyEvolutionSuccess = await prisma.success.findFirst({
                where: {
                    title: "Mini Yol",
                },
                select: {
                    id: true,
                    amountNeeded: true,
                },
            });

            if (!matchingBabyEvolutionSuccess) throw new Error(errorSuccess);

            const matchingBabyEvolutionUserSuccess = await prisma.userSuccess.findFirst({
                where: {
                    successId: matchingBabyEvolutionSuccess.id,
                    userId: userId,
                },
                select: {
                    actualAmount: true,
                    id: true,
                },
            });

            if (!matchingBabyEvolutionUserSuccess) throw new Error(errorUserSuccess);

            if (matchingBabyEvolutionUserSuccess.actualAmount < matchingBabyEvolutionSuccess.amountNeeded) {
                await prisma.userSuccess.update({
                    where: {
                        id: matchingBabyEvolutionUserSuccess.id,
                    },
                    data: {
                        actualAmount: {
                            increment: 1,
                        },
                    },
                });
            }

            break;

        case "Adolescent":
            const matchingAdoEvolutionSuccess = await prisma.success.findFirst({
                where: {
                    title: "Grand Yol",
                },
                select: {
                    id: true,
                    amountNeeded: true,
                },
            });

            if (!matchingAdoEvolutionSuccess) throw new Error(errorSuccess);

            const matchingAdoEvolutionUserSuccess = await prisma.userSuccess.findFirst({
                where: {
                    successId: matchingAdoEvolutionSuccess.id,
                    userId: userId,
                },
                select: {
                    actualAmount: true,
                    id: true,
                },
            });

            if (!matchingAdoEvolutionUserSuccess) throw new Error(errorUserSuccess);

            if (matchingAdoEvolutionUserSuccess.actualAmount < matchingAdoEvolutionSuccess.amountNeeded) {
                await prisma.userSuccess.update({
                    where: {
                        id: matchingAdoEvolutionUserSuccess.id,
                    },
                    data: {
                        actualAmount: {
                            increment: 1,
                        },
                    },
                });
            }

            break;
        default:
            return;
    }
}
