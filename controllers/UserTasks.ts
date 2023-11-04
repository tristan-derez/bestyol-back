import { NextFunction, Request, Response } from "express";
import { startOfDay, endOfDay } from "date-fns";
import { newActiveDaily } from "../utils/switchActiveStatus";
import { AuthenticatedRequest } from "../middlewares/idValidation";

import { prisma, DailyTasks, UserTasks } from "../services/prismaClient";

//* POST
export const createUserCustomTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId: string = req.params.userId;
    const { title }: { title: string } = req.body;

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

        return res.status(201).json({ userTask });
    } catch (error: any) {
        next(error);
    }
};

export const createUserDailyTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId: number = Number(req.params.userId);

    const today: Date = new Date();
    const startOfToday: number | Date = startOfDay(today);
    const endOfToday: number | Date = endOfDay(today);

    try {
        // search if daily tasks are already in userTasks table
        const existingDailyTasks = await prisma.userTasks.findMany({
            where: {
                userId: userId,
                isDaily: true,
                createdAt: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
            },
        });

        // if thats the case return the existing dailyTasks
        if (existingDailyTasks.length > 1) {
            return res.status(200).json({ dailyTasks: existingDailyTasks });
        }

        // then we search if there's active daily tasks at
        // today's date in dailyTasks table
        const dailyGenerated = await prisma.dailyTasks.findFirst({
            where: {
                isActive: true,
                lastAssignDate: startOfToday,
            },
        });

        // if not, we generate them
        if (!dailyGenerated) {
            await newActiveDaily(6);
        }

        // we search for every isActive tasks in DailyTasks
        const tasks: DailyTasks[] = await prisma.dailyTasks.findMany({
            where: {
                isActive: true,
            },
        });

        const userTasks: UserTasks[] = [];

        // for every tasks found, we create an userTasks with
        // the field isDaily to true
        for (const task of tasks) {
            const userTask: UserTasks = await prisma.userTasks.create({
                data: {
                    title: task.title,
                    isDaily: true,
                    isCompleted: false,
                    completedAt: null,
                    userId: userId,
                    dailyTaskId: task.id,
                },
                include: {
                    dailyTask: true,
                },
            });

            userTasks.push(userTask);
        }

        res.status(200).json({ dailyTasks: userTasks });
    } catch (error: any) {
        next(error);
    }
};

//* GET
export const getUserTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId: string = req.params.userId;

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

        res.status(200).json({ data: [{ customTasks }, { dailyTasks }] });
    } catch (error: any) {
        next(error);
    }
};

//* PATCH
export const changeTitleCustomTask = async (req: Request, res: Response, next: NextFunction) => {
    const taskId: string = req.params.taskId;
    const { title }: { title: string } = req.body;

    try {
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
        next(error);
    }
};

export const validateDailyTask = async (req: Request, res: Response, next: NextFunction) => {
    const userTaskId: number = Number(req.params.userTaskId);
    const { yolId }: { yolId: number } = req.body;

    const today: Date = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    try {
        const userTask = await prisma.userTasks.findUnique({
            where: {
                id: userTaskId,
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
        next(error);
    }
};

export const validateCustomTask = async (req: Request, res: Response, next: NextFunction) => {
    const userTaskId: number = Number(req.params.userTaskId);

    try {
        const userTask = await prisma.userTasks.findUnique({
            where: {
                id: userTaskId,
                isDaily: false,
                isCompleted: false,
            },
        });

        if (!userTask) {
            throw Object.assign(new Error(), {
                status: 404,
                message: "Tâche introuvable",
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
                id: userTaskId,
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
        next(error);
    }
};

//* DELETE
export const deleteCustomTask = async (req: Request, res: Response, next: NextFunction) => {
    const taskId: number = Number(req.params.taskId);

    try {
        const task = await prisma.userTasks.delete({
            where: {
                id: taskId,
                isDaily: false,
            },
        });

        res.status(204).send();
    } catch (error: any) {
        next(error);
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
