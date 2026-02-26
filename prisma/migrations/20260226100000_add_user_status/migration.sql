-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ONLINE', 'BUSY', 'OFFLINE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'OFFLINE';
ALTER TABLE "User" ADD COLUMN "lastSeenAt" TIMESTAMP(3);
