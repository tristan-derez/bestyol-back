/*
  Warnings:

  - You are about to drop the column `dailyTasksId` on the `UserTasks` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserTasks" DROP CONSTRAINT "UserTasks_dailyTasksId_fkey";

-- AlterTable
ALTER TABLE "UserTasks" DROP COLUMN "dailyTasksId",
ADD COLUMN     "dailyTaskId" INTEGER;

-- AddForeignKey
ALTER TABLE "UserTasks" ADD CONSTRAINT "UserTasks_dailyTaskId_fkey" FOREIGN KEY ("dailyTaskId") REFERENCES "DailyTasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
