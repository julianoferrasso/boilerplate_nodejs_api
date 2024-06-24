/*
  Warnings:

  - You are about to drop the column `passwordReseHashToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordReseHashToken",
ADD COLUMN     "passwordResetHashToken" TEXT;
