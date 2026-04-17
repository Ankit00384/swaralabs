-- Delete voices with NARRATIVE category (Amelia and Sophia)
DELETE FROM "Voice" WHERE category = 'NARRATIVE';

-- Remove NARRATIVE from VoiceCategory enum
-- For PostgreSQL, we need to create a new type without NARRATIVE and swap it
CREATE TYPE "VoiceCategory_new" AS ENUM ('AUDIOBOOK', 'CONVERSATIONAL', 'CUSTOMER_SERVICE', 'GENERAL', 'ENTERTAINMENT', 'SALES', 'CHARACTERS', 'MEDITATION', 'MOTIVATIONAL', 'PODCAST', 'ADVERTISING', 'VOICEOVER', 'CORPORATE');
ALTER TABLE "Voice" ALTER COLUMN category TYPE "VoiceCategory_new" USING category::text::"VoiceCategory_new";
DROP TYPE "VoiceCategory";
ALTER TYPE "VoiceCategory_new" RENAME TO "VoiceCategory";
