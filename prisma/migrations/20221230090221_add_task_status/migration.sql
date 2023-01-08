/*
  Warnings:

  - Added the required column `Status` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('CREATED', 'DOING', 'DONE');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "Status" "TaskStatus" NOT NULL;
