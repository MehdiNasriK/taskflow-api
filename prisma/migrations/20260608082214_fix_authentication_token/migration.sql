/*
  Warnings:

  - You are about to drop the column `token` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "token";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "token" TEXT;
