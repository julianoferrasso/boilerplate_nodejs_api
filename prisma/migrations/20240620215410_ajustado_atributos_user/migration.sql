-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "avatarUrl" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;
