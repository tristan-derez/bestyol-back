-- DropForeignKey
ALTER TABLE "UserTasks" DROP CONSTRAINT "UserTasks_dailyTasksId_fkey";

-- AlterTable
ALTER TABLE "UserTasks" ALTER COLUMN "dailyTasksId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "UserTasks" ADD CONSTRAINT "UserTasks_dailyTasksId_fkey" FOREIGN KEY ("dailyTasksId") REFERENCES "DailyTasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
