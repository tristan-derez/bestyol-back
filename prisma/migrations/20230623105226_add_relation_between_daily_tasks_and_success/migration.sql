/*
  Warnings:

  - A unique constraint covering the columns `[successId]` on the table `DailyTasks` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DailyTasks" ADD COLUMN     "successId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "DailyTasks_successId_key" ON "DailyTasks"("successId");

-- AddForeignKey
ALTER TABLE "DailyTasks" ADD CONSTRAINT "DailyTasks_successId_fkey" FOREIGN KEY ("successId") REFERENCES "Success"("id") ON DELETE SET NULL ON UPDATE CASCADE;
