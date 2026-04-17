/*
  Warnings:

  - You are about to drop the `DocumentOCR` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transcription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "DocumentOCR";

-- DropTable
DROP TABLE "Transcription";

-- DropEnum
DROP TYPE "OCROutputFormat";

-- DropEnum
DROP TYPE "OCRStatus";

-- DropEnum
DROP TYPE "STTMode";

-- CreateTable
CREATE TABLE "SalesLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalesLead_createdAt_idx" ON "SalesLead"("createdAt");
