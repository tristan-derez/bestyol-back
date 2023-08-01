-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "pp" TEXT,
    "banner" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Yol" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "xp" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "speciesId" INTEGER NOT NULL,

    CONSTRAINT "Yol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Species" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Success" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT NOT NULL,
    "amountNeeded" INTEGER NOT NULL,
    "successXp" INTEGER NOT NULL,

    CONSTRAINT "Success_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSuccess" (
    "id" SERIAL NOT NULL,
    "actualAmount" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "userId" INTEGER NOT NULL,
    "successId" INTEGER NOT NULL,

    CONSTRAINT "UserSuccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyTasks" (
    "id" SERIAL NOT NULL,
    "category" TEXT,
    "title" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,
    "isActive" BOOLEAN,

    CONSTRAINT "DailyTasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTasks" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "isDaily" BOOLEAN NOT NULL,
    "isCompleted" BOOLEAN NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserTasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DailyTasksToUserTasks" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Species_name_key" ON "Species"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Success_title_key" ON "Success"("title");

-- CreateIndex
CREATE UNIQUE INDEX "DailyTasks_title_key" ON "DailyTasks"("title");

-- CreateIndex
CREATE UNIQUE INDEX "_DailyTasksToUserTasks_AB_unique" ON "_DailyTasksToUserTasks"("A", "B");

-- CreateIndex
CREATE INDEX "_DailyTasksToUserTasks_B_index" ON "_DailyTasksToUserTasks"("B");

-- AddForeignKey
ALTER TABLE "Yol" ADD CONSTRAINT "Yol_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Yol" ADD CONSTRAINT "Yol_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSuccess" ADD CONSTRAINT "UserSuccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSuccess" ADD CONSTRAINT "UserSuccess_successId_fkey" FOREIGN KEY ("successId") REFERENCES "Success"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTasks" ADD CONSTRAINT "UserTasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DailyTasksToUserTasks" ADD CONSTRAINT "_DailyTasksToUserTasks_A_fkey" FOREIGN KEY ("A") REFERENCES "DailyTasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DailyTasksToUserTasks" ADD CONSTRAINT "_DailyTasksToUserTasks_B_fkey" FOREIGN KEY ("B") REFERENCES "UserTasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
