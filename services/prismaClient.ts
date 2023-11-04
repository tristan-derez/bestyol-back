import { PrismaClient, Species, Success, DailyTasks, UserTasks, Users } from "@prisma/client";

// Create a singleton instance of the Prisma client
const prisma = new PrismaClient({ log: ["warn", "error"] });

export { prisma, Species, Success, DailyTasks, UserTasks, Users };
