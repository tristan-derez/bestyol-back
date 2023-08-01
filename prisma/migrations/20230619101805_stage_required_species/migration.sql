/*
  Warnings:

  - Made the column `stage` on table `Species` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Species" ALTER COLUMN "stage" SET NOT NULL;
