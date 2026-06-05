-- Add cached species photo fields
ALTER TABLE "Animal" ADD COLUMN "photoUrl" TEXT;
ALTER TABLE "Animal" ADD COLUMN "photoAttribution" TEXT;

-- Indexes to keep filtered queries fast at ~1.5k animals / 20k thoughts
CREATE INDEX "Animal_species_idx" ON "Animal"("species");
CREATE INDEX "Animal_emotion_idx" ON "Animal"("emotion");
CREATE INDEX "Animal_region_idx" ON "Animal"("region");
CREATE INDEX "Thought_animalId_idx" ON "Thought"("animalId");
