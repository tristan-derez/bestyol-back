import { Yol } from "@prisma/client";
import { prisma } from "../services/prismaClient";

export const checkYolXpToValidateSuccess = async (userId: number, yol: Yol[]) => {
    const xpToReachLevelThree = 250;
    const xpToReachLevelTen = 2700;
    const xpToReachLevelTwenty = 10450;

    try {
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
    } catch (error: any) {
        throw Object.assign(new Error(), {
            message: "Erreur lors de la vérifications des succès associés au Yol",
        });
    }
};
