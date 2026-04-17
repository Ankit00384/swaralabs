/*
  Warnings:

  - You are about to drop the column `repetitionPenalty` on the `Generation` table. All the data in the column will be lost.
  - You are about to drop the column `temperature` on the `Generation` table. All the data in the column will be lost.
  - You are about to drop the column `topK` on the `Generation` table. All the data in the column will be lost.
  - You are about to drop the column `topP` on the `Generation` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "STTMode" AS ENUM ('TRANSCRIBE', 'TRANSLATE', 'VERBATIM', 'TRANSLIT', 'CODEMIX');

-- CreateEnum
CREATE TYPE "OCRStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "OCROutputFormat" AS ENUM ('HTML', 'MD');

-- AlterTable
ALTER TABLE "Generation" DROP COLUMN "repetitionPenalty",
DROP COLUMN "temperature",
DROP COLUMN "topK",
DROP COLUMN "topP",
ADD COLUMN     "pace" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "speechSampleRate" INTEGER NOT NULL DEFAULT 22050;

-- CreateTable
CREATE TABLE "Transcription" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "audioFileName" TEXT NOT NULL,
    "audioFileUrl" TEXT,
    "r2ObjectKey" TEXT,
    "language" TEXT NOT NULL DEFAULT 'auto',
    "mode" "STTMode" NOT NULL DEFAULT 'TRANSCRIBE',
    "transcript" TEXT NOT NULL,
    "translatedText" TEXT,
    "transliteratedText" TEXT,
    "verbatimTranscript" TEXT,
    "codeMixedText" TEXT,
    "diarization" JSONB,
    "withDiarization" BOOLEAN NOT NULL DEFAULT false,
    "jobId" TEXT,
    "batchJobCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transcription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentOCR" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "documentFileName" TEXT NOT NULL,
    "documentFileUrl" TEXT,
    "r2ObjectKey" TEXT,
    "language" TEXT NOT NULL DEFAULT 'auto',
    "outputFormat" "OCROutputFormat" NOT NULL DEFAULT 'MD',
    "extractedText" TEXT NOT NULL,
    "extractedStructure" JSONB,
    "jobId" TEXT,
    "status" "OCRStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "r2OutputKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentOCR_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transcription_orgId_idx" ON "Transcription"("orgId");

-- CreateIndex
CREATE INDEX "Transcription_jobId_idx" ON "Transcription"("jobId");

-- CreateIndex
CREATE INDEX "DocumentOCR_orgId_idx" ON "DocumentOCR"("orgId");

-- CreateIndex
CREATE INDEX "DocumentOCR_jobId_idx" ON "DocumentOCR"("jobId");

-- CreateIndex
CREATE INDEX "DocumentOCR_status_idx" ON "DocumentOCR"("status");
