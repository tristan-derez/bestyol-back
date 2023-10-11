import { Request, Response } from "express";
import { startOfDay, endOfDay } from "date-fns";
import { newActiveDaily } from "../utils/switchActiveStatus";
import { AuthenticatedRequest } from "../middlewares/idValidation";

import { prisma, DailyTasks, UserTasks } from "../utils/prismaClient";

//* POST
export const createUserCustomTask = async (req: AuthenticatedRequest, res: Response) => {
    const userId: string = req.params.userId;
    const { title }: { title: string } = req.body;

    try {
        if (!userId) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre userId est absent de la requête",
            });
        }

        if (isNaN(parseInt(userId, 10))) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre userId doit être un nombre valide",
            });
        }

        if (!title) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le champ title est absent du corps de la requête",
            });
        }

        const userTask = await prisma.userTasks.create({
            data: {
                title,
                isDaily: false,
                isCompleted: false,
                completedAt: null,
                createdAt: new Date(),
                userId: parseInt(userId, 10),
                dailyTaskId: null,
            },
        });

        return res.status(201).json({ userTask });
    } catch (error: any) {
        return res.status(error.status || 500).json({ erreur: error.message || "Erreur lors de la création de la tâche" });
    }
};

export const createUserDailyTasks = async (req: AuthenticatedRequest, res: Response) => {
    const userId: string = req.params.userId;

    const today: Date = new Date();
    const startOfToday: number | Date = startOfDay(today);
    const endOfToday: number | Date = endOfDay(today);

    try {
        if (!userId || isNaN(parseInt(userId, 10))) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre userId est absent de la requête et/ou doit être un nombre valide",
            });
        }

        const existingDailyTasks = await prisma.userTasks.findFirst({
            where: {
                userId: parseInt(userId, 10),
                isDaily: true,
                createdAt: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
            },
        });

        if (existingDailyTasks) {
            res.status(200).json({ existingDailyTasks });
            return;
        }

        const tasks: DailyTasks[] = await prisma.dailyTasks.findMany({
            where: {
                isActive: true,
            },
        });

        const userTasks: UserTasks[] = [];

        for (const task of tasks) {
            const userTask: UserTasks = await prisma.userTasks.create({
                data: {
                    title: task.title,
                    isDaily: true,
                    isCompleted: false,
                    completedAt: null,
                    userId: parseInt(userId, 10),
                    dailyTaskId: task.id,
                },
                include: {
                    dailyTask: true,
                },
            });

            userTasks.push(userTask);
        }

        res.status(200).json({ userTasks });
    } catch (error: any) {
        res.status(error.status || 500).json({ erreur: error.message || "Erreur lors de l'assignation des tâches quotidiennes à l'utilisateur" });
    }
};

//* GET
export const getUserTasks = async (req: AuthenticatedRequest, res: Response) => {
    const userId: string = req.params.userId;

    try {
        if (!userId || isNaN(parseInt(userId, 10))) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre userId absent de la requête et/ou doit être un nombre valide",
            });
        }

        const userTasks: UserTasks[] = await prisma.userTasks.findMany({
            where: {
                userId: parseInt(userId, 10),
            },
            include: {
                dailyTask: true,
            },
        });

        const customTasks: UserTasks[] = [];
        const dailyTasks: UserTasks[] = [];

        userTasks.forEach((task: UserTasks) => {
            if (task.isDaily) {
                dailyTasks.push(task);
            } else {
                customTasks.push(task);
            }
        });

        res.status(200).json({ customTasks, dailyTasks });
    } catch (error: any) {
        res.status(error.status || 500).json({
            erreur: error.message || "Une erreur est survenue lors de la récupération des tâches de l'utilisateur",
        });
    }
};

//* PATCH
export const changeTitleCustomTask = async (req: Request, res: Response) => {
    const taskId: string = req.params.taskId;
    const { title }: { title: string } = req.body;

    try {
        if (!taskId || isNaN(parseInt(taskId, 10)) || !title) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Il manque des éléments nécessaires à la requête",
            });
        }

        const updatedTask = await prisma.userTasks.update({
            where: {
                id: parseInt(taskId, 10),
            },
            data: {
                title: title,
            },
        });

        res.status(200).json({ updatedTask });
    } catch (error: any) {
        res.status(error.status || 500).json({ erreur: error.message || "Erreur lors du changement de titre" });
    }
};

export const validateDailyTask = async (req: Request, res: Response) => {
    const userTaskId: string = req.params.userTaskId;
    const { yolId }: { yolId: number } = req.body;

    const today: Date = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    try {
        if (!userTaskId || !yolId || isNaN(yolId) || isNaN(parseInt(userTaskId, 10))) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Certains paramètres sont absents de la requêtes ou invalides",
            });
        }

        const userTask = await prisma.userTasks.findUnique({
            where: {
                id: parseInt(userTaskId, 10),
            },
            include: {
                dailyTask: true,
            },
        });

        if (!userTask) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Tâche non trouvée",
            });
        }

        await prisma.yol.update({
            where: {
                id: yolId,
            },
            data: {
                xp: {
                    increment: userTask.dailyTask?.xp,
                },
            },
        });

        const successId: number | null | undefined = userTask.dailyTask?.successId;
        const userId = userTask.userId;

        if (successId) {
            const userSuccessToIncrement = await prisma.userSuccess.findFirst({
                where: {
                    successId: successId as number,
                    isCompleted: false,
                    userId: userId,
                },
            });

            if (!userSuccessToIncrement) {
                throw Object.assign(new Error(), {
                    status: 500,
                    message: "Erreur interne",
                });
            } else if (userSuccessToIncrement) {
                await prisma.userSuccess.update({
                    where: {
                        id: userSuccessToIncrement.id,
                    },
                    data: {
                        actualAmount: {
                            increment: 1,
                        },
                    },
                });
            }

            const questMasterSuccess = await prisma.userSuccess.findFirst({
                where: {
                    userId: userId,
                    successId: 14,
                },
            });

            if (questMasterSuccess) {
                await prisma.userSuccess.update({
                    where: {
                        id: questMasterSuccess.id,
                    },
                    data: {
                        actualAmount: {
                            increment: 1,
                        },
                    },
                });
            }
        }

        const updatedTask: UserTasks = await prisma.userTasks.update({
            where: {
                id: userTask?.id,
            },
            data: {
                isCompleted: true,
                completedAt: new Date(),
            },
        });

        const DailyTasksDoneToday: number = await prisma.userTasks.count({
            where: {
                userId: userId,
                isDaily: true,
                createdAt: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
                isCompleted: true,
            },
        });

        if (DailyTasksDoneToday === 6) {
            const userSuccessToUpdate = await prisma.userSuccess.findFirst({
                where: {
                    userId: userId,
                    successId: 16,
                },
            });

            if (userSuccessToUpdate) {
                await prisma.userSuccess.update({
                    where: {
                        id: userSuccessToUpdate.id,
                    },
                    data: {
                        actualAmount: {
                            increment: 1,
                        },
                    },
                });
            }
        }

        return res.status(200).json({ yolXpGain: userTask.dailyTask?.xp, updatedTask });
    } catch (error: any) {
        return res.status(error.status || 500).json({ erreur: error.message || "Erreur interne" });
    }
};

export const validateCustomTask = async (req: Request, res: Response) => {
    const userTaskId: string = req.params.userTaskId;

    try {
        if (!userTaskId || isNaN(parseInt(userTaskId, 10))) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "le paramètre userTaskId est absent de la requête ou n'est pas un chiffre valide",
            });
        }

        const userTask = await prisma.userTasks.findUnique({
            where: {
                id: parseInt(userTaskId, 10),
            },
        });

        if (!userTask) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Tâche introuvable",
            });
        }

        if (userTask.isDaily) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Les tâches quotidiennes ne peuvent pas être modifiées",
            });
        }

        if (userTask.isCompleted) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Tâche déjà complétée",
            });
        }

        const countCustomUserTasksDone = await prisma.userTasks.count({
            where: {
                userId: userTask.userId,
                isDaily: false,
                isCompleted: true,
            },
        });

        await prisma.userTasks.update({
            where: {
                id: parseInt(userTaskId, 10),
            },
            data: {
                isCompleted: true,
            },
        });

        // completing a custom task for the first time
        // validate a success
        // we increment success accordingly based on this
        if (countCustomUserTasksDone === 0) {
            const firstCustomTaskValidatedSuccessId: number = 15;

            const successToValidate = await prisma.userSuccess.findFirst({
                where: {
                    successId: firstCustomTaskValidatedSuccessId,
                    userId: userTask.userId,
                },
            });

            if (!successToValidate) {
                throw Object.assign(new Error(), {
                    status: 404,
                    message: "Le succès de l'utilisateur est introuvable",
                });
            }

            await prisma.userSuccess.update({
                where: {
                    id: successToValidate.id,
                },
                data: {
                    actualAmount: {
                        increment: 1,
                    },
                },
            });
        }

        return res.status(204).send();
    } catch (error: any) {
        return res.status(error.status || 500).json({ error: error.message || "Erreur interne" });
    }
};

//* DELETE
export const deleteCustomTask = async (req: Request, res: Response) => {
    const taskId: string = req.params.taskId;

    try {
        if (!taskId || isNaN(parseInt(taskId, 10))) {
            throw Object.assign(new Error(), {
                status: 400,
                message: "Le paramètre taskId est absent de la requête ou n'est pas un nombre valide",
            });
        }

        const task = await prisma.userTasks.findUnique({
            where: {
                id: parseInt(taskId, 10),
            },
        });

        if (!task) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Tâche introuvable",
            });
        }

        if (task.isDaily) {
            throw Object.assign(new Error(), {
                status: 401,
                details: "La tâche utilisateur est une tâche quotidienne et ne peut pas être supprimée",
            });
        }

        await prisma.userTasks.delete({
            where: {
                id: parseInt(taskId, 10),
            },
        });

        res.status(204).json();
    } catch (error: any) {
        res.status(error.status || 500).json({ erreur: error.message || "Erreur lors de la suppression de la tâche" });
    }
};

export default {
    createUserCustomTask,
    createUserDailyTasks,
    getUserTasks,
    changeTitleCustomTask,
    deleteCustomTask,
    validateDailyTask,
    validateCustomTask,
};
