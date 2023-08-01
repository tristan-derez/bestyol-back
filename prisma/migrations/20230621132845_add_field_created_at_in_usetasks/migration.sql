/*
  Warnings:

  - Added the required column `createdAt` to the `UserTasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserTasks" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL;
