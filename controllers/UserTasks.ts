import { Request, Response } from "express";
import { startOfDay, endOfDay } from "date-fns";
import { newActiveDaily } from "../utils/switchActiveStatus";
import { AuthenticatedRequest } from "../middlewares/idValidation";

import { prisma, DailyTasks, UserTasks } from "../utils/prismaClient";

//* POST
export const createUserCustomTask = async (req: AuthenticatedRequest, res: Response) => {
    const userId: string = req.params.userId;
    const { title }: { title: string } = req.body;

    if (isNaN(parseInt(userId, 10))) {
        return res.status(400).json({ erreur: "Le paramètre userId doit être un nombre valide" });
    }

    if (!title) {
        return res.status(400).json({ erreur: "le titre de la tâche est absent du corps de la requête" });
    }

    try {
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

        return res.status(201).json({ userTask, message: "Tâche créée 🥳🎉" });
    } catch (error: any) {
        return res.status(500).json({ erreur: "Erreur lors de la création de la tâche 😕", error });
    }
};

export const createUserDailyTasks = async (req: AuthenticatedRequest, res: Response) => {
    const userId: string = req.params.userId;

    if (isNaN(parseInt(userId, 10))) {
        res.status(400).json({ erreur: "Le paramètre userId doit être un nombre valide" });
        return;
    }

    const today: Date = new Date();
    const startOfToday: number | Date = startOfDay(today);
    const endOfToday: number | Date = endOfDay(today);

    try {
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
            res.status(500).json({ erreur: "L'utilisateur a déjà des tâches quotidiennes pour cette date 😕" });
            return;
        }

        const expiredDailytasks = await prisma.userTasks.findFirst({
            where: {
                userId: parseInt(userId, 10),
                isDaily: true,
                createdAt: {
                    lt: startOfToday,
                },
            },
        });

        if (expiredDailytasks) {
            const incompleteTasks = await prisma.userTasks.findMany({
                where: {
                    userId: parseInt(userId, 10),
                    isDaily: true,
                    isCompleted: false,
                    createdAt: {
                        lt: startOfToday,
                    },
                },
            });

            if (incompleteTasks.length > 0) {
                await prisma.userTasks.deleteMany({
                    where: {
                        userId: parseInt(userId, 10),
                        isDaily: true,
                        isCompleted: false,
                        createdAt: {
                            lt: startOfToday,
                        },
                    },
                });
            }
        }

        await newActiveDaily(6);

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

        res.status(200).json({ userTasks, message: "Tâches quotidiennes assignées 🥳🎉" });
    } catch (error: any) {
        res.status(500).json({ erreur: error });
    }
};

//* GET
export const getUserTasks = async (req: AuthenticatedRequest, res: Response) => {
    const userId: string = req.params.userId;

    if (isNaN(parseInt(userId, 10))) {
        res.status(400).json({ erreur: "Le paramètre userId doit être un nombre valide" });
        return;
    }

    try {
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
        res.status(500).json({
            erreur: "Une erreur est survenue lors de la récupération des tâches de l'utilisateur 😕",
            error,
        });
    }
};

//* PATCH
export const changeTitleCustomTask = async (req: Request, res: Response) => {
    const taskId: string = req.params.taskId;
    const { title }: { title: string } = req.body;

    if (isNaN(parseInt(taskId, 10))) {
        res.status(400).json({ erreur: "Le paramètre taskId doit être un nombre valide" });
        return;
    }

    if (!title) {
        res.status(400).json({ erreur: "le titre de la tâche est absent du corps de la requête" });
        return;
    }

    try {
        const updatedTask = await prisma.userTasks.update({
            where: {
                id: parseInt(taskId, 10),
            },
            data: {
                title: title,
            },
        });

        res.status(200).json({ updatedTask, message: "Tâche modifiée 🥳🎉" });
    } catch (error: any) {
        res.status(500).json({ erreur: "Erreur lors du changement de titre 😕", error });
    }
};

export const validateDailyTask = async (req: Request, res: Response) => {
    const userTaskId: string = req.params.userTaskId;
    const { yolId }: { yolId: number } = req.body;

    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    if (isNaN(yolId)) {
        return res.status(400).json({ erreur: "yolId doit être un nombre valide" });
    }

    if (isNaN(parseInt(userTaskId, 10))) {
        return res.status(400).json({ erreur: "Le paramètre userTaskId doit être un nombre valide" });
    }

    if (!yolId) {
        return res.status(400).json({ erreur: "yolId est absent du corps de la requête" });
    }

    try {
        const userTask = await prisma.userTasks.findUnique({
            where: {
                id: parseInt(userTaskId, 10),
            },
            include: {
                dailyTask: true,
            },
        });

        if (!userTask) {
            return res.status(404).json({ error: "Tâche non trouvée 😕" });
        }

        await prisma.yol.update({
            where: {
                id: yolId,
            },
            data: {
                xp: {
                    increment: userTask?.dailyTask?.xp,
                },
            },
        });

        const successId: number | null | undefined = userTask?.dailyTask?.successId;
        const userId = userTask?.userId;

        if (successId !== null) {
            const userSuccessToIncrement = await prisma.userSuccess.findFirst({
                where: {
                    successId: successId as number,
                    isCompleted: false,
                    userId: userId,
                },
            });

            if (userSuccessToIncrement) {
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

        const updatedTask = await prisma.userTasks.update({
            where: {
                id: userTask?.id,
            },
            data: {
                isCompleted: true,
                completedAt: new Date(),
            },
        });

        const searchForEveryDaily = await prisma.userTasks.findMany({
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

        if (searchForEveryDaily.length === 6) {
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

        return res.status(200).json({ message: "Tâche validée 🥳🎉", yolXpGain: userTask?.dailyTask?.xp, updatedTask });
    } catch (error: any) {
        return res.status(500).json({ error });
    }
};

export const validateCustomTask = async (req: Request, res: Response) => {
    const userTaskId: string = req.params.userTaskId;

    if (isNaN(parseInt(userTaskId, 10))) {
        res.status(400).json({ erreur: "Le paramètre userTaskId doit être un nombre valide" });
        return;
    }

    try {
        const userTask = await prisma.userTasks.findUnique({
            where: {
                id: parseInt(userTaskId, 10),
            },
        });

        if (!userTask) {
            return res.status(404).json({ error: "Tâche non trouvée 😕" });
        }

        if (!userTask.isDaily) {
            if (userTask.isCompleted) {
                return res.status(400).json({ error: "Tâche déjà complétée" });
            }

            const firstTimeCompletingCustomTask = await prisma.userTasks.count({
                where: {
                    userId: userTask.userId,
                    isDaily: false,
                    isCompleted: true,
                },
            });

            if (firstTimeCompletingCustomTask !== 0) {
                await prisma.userTasks.update({
                    where: {
                        id: parseInt(userTaskId, 10),
                    },
                    data: {
                        isCompleted: true,
                    },
                });

                return res.status(200).json({ message: "Tâche complétée" });
            } else {
                const successId: number = 15;
                const successToValidate = await prisma.userSuccess.findFirst({
                    where: {
                        successId: successId,
                        userId: userTask.userId,
                    },
                });

                await prisma.userSuccess.update({
                    where: {
                        id: successToValidate?.id,
                    },
                    data: {
                        actualAmount: {
                            increment: 1,
                        },
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
                return res.status(200).json({ message: "Tâche complétée" });
            }
        } else {
            return res.status(400).json({ error: "Requête invalide" });
        }
    } catch (error: any) {
        return res.status(500).json({ error: error });
    }
};

//* DELETE
export const deleteCustomTask = async (req: Request, res: Response) => {
    const taskId: string = req.params.taskId;

    if (isNaN(parseInt(taskId, 10))) {
        res.status(400).json({ erreur: "Le paramètre taskId doit être un nombre valide" });
        return;
    }

    try {
        const task = await prisma.userTasks.findUnique({
            where: {
                id: parseInt(taskId, 10),
            },
        });

        if (task?.isDaily === true) {
            throw Object.assign(new Error(), {
                status: 401,
                details: "La tâche utilisateur est une tâche quotidienne et ne peut pas être supprimée de cette manière",
            });
        }

        await prisma.userTasks.delete({
            where: {
                id: parseInt(taskId, 10),
            },
        });

        res.status(200).json({ message: "Tâche supprimée 🔫", task });
    } catch (error: any) {
        res.status(500).json({ erreur: "Erreur lors de la suppression de la tâche 😕", error });
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
