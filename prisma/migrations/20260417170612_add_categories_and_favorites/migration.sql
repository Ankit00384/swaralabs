-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VoiceCategory" ADD VALUE 'ENTERTAINMENT';
ALTER TYPE "VoiceCategory" ADD VALUE 'SALES';

-- CreateTable
CREATE TABLE "VoiceFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voiceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VoiceFavorite_userId_idx" ON "VoiceFavorite"("userId");

-- CreateIndex
CREATE INDEX "VoiceFavorite_voiceId_idx" ON "VoiceFavorite"("voiceId");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceFavorite_userId_voiceId_key" ON "VoiceFavorite"("userId", "voiceId");

-- AddForeignKey
ALTER TABLE "VoiceFavorite" ADD CONSTRAINT "VoiceFavorite_voiceId_fkey" FOREIGN KEY ("voiceId") REFERENCES "Voice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
