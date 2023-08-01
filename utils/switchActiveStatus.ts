import { getRandomElements } from "./getRandomElements";

import { prisma, DailyTasks } from "./prismaClient";

export async function newActiveDaily(count: number) {
    const currentDate: Date = new Date();

    const activeTasks = await prisma.dailyTasks.findMany({
        where: {
            isActive: true,
        },
    });

    if (activeTasks.length === 0) {
        const tasks: DailyTasks[] = await prisma.dailyTasks.findMany();
        const selectedTasks: DailyTasks[] = getRandomElements(tasks, count);

        await prisma.dailyTasks.updateMany({
            where: {
                id: {
                    in: selectedTasks.map((task) => task.id),
                },
            },
            data: {
                isActive: true,
                lastAssignDate: currentDate,
            },
        });

        return;
    }

    const tasksToUpdate = activeTasks.filter(
        (task) => (task.lastAssignDate && new Date(task.lastAssignDate) < currentDate) || task.lastAssignDate === null
    );

    if (tasksToUpdate.length === 0) {
        return;
    }

    await prisma.dailyTasks.updateMany({
        where: {
            id: {
                in: activeTasks.map((task) => task.id),
            },
        },
        data: {
            isActive: false,
        },
    });

    const tasks: DailyTasks[] = await prisma.dailyTasks.findMany();
    const selectedTasks: DailyTasks[] = getRandomElements(tasks, count);

    await prisma.dailyTasks.updateMany({
        where: {
            id: {
                in: selectedTasks.map((task) => task.id),
            },
        },
        data: {
            isActive: true,
            lastAssignDate: currentDate,
        },
    });

    return;
}
