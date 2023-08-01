/*
  Warnings:

  - You are about to drop the `_DailyTasksToUserTasks` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dailyTasksId` to the `UserTasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_DailyTasksToUserTasks" DROP CONSTRAINT "_DailyTasksToUserTasks_A_fkey";

-- DropForeignKey
ALTER TABLE "_DailyTasksToUserTasks" DROP CONSTRAINT "_DailyTasksToUserTasks_B_fkey";

-- AlterTable
ALTER TABLE "UserTasks" ADD COLUMN     "dailyTasksId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_DailyTasksToUserTasks";

-- AddForeignKey
ALTER TABLE "UserTasks" ADD CONSTRAINT "UserTasks_dailyTasksId_fkey" FOREIGN KEY ("dailyTasksId") REFERENCES "DailyTasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
