import { startOfDay } from "date-fns";
import { getRandomElements } from "./getRandomElements";

import { prisma, DailyTasks } from "../services/prismaClient";

export async function newActiveDaily(count: number) {
    try {
        const currentDate: Date = new Date();
        const startOfToday: Date = startOfDay(currentDate);

        // Deactivate all active tasks
        await prisma.dailyTasks.updateMany({
            where: {
                isActive: true,
            },
            data: {
                isActive: false,
            },
        });

        // Fetch all tasks and select new ones to activate
        const tasks: DailyTasks[] = await prisma.dailyTasks.findMany();
        const selectedTasks: DailyTasks[] = getRandomElements(tasks, count);

        // Activate the selected tasks
        await prisma.dailyTasks.updateMany({
            where: {
                id: {
                    in: selectedTasks.map((task) => task.id),
                },
            },
            data: {
                isActive: true,
                lastAssignDate: startOfToday,
            },
        });
        console.log("daily tasks created");
    } catch (error) {
        console.error("There was an error generating active daily tasks: ", error);
    }
}
