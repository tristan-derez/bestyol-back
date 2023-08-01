import { prisma } from "./prismaClient";

export async function createUserSuccess(userId: number) {
    try {
        const allSuccess = await prisma.success.findMany();

        for (const success of allSuccess) {
            try {
                await prisma.userSuccess.create({
                    data: {
                        actualAmount: 0,
                        isCompleted: false,
                        userId: userId,
                        successId: success.id,
                    },
                });
            } catch (error: any) {
                console.log("error create:", error);
            }
        }
    } catch (error: any) {
        console.log("error findMany:", error);
    }
}
