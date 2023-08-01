-- AlterTable
ALTER TABLE "Species" ADD COLUMN     "gif" TEXT;

-- AlterTable
ALTER TABLE "UserTasks" ALTER COLUMN "completedAt" DROP NOT NULL;
