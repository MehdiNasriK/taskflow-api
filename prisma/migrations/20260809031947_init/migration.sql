-- CreateEnum
CREATE TYPE "Status" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEMBER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "refreshToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR(100),
    "title" VARCHAR(50) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'TODO',
    "priority" "Priority",
    "projectId" INTEGER,
    "creatorId" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "taskId" INTEGER NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER,
    "oldData" JSONB,
    "newData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" INTEGER,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
