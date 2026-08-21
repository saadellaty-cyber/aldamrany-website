-- CreateEnum
CREATE TYPE "CapabilityGroup" AS ENUM ('EXPERIENCE', 'RESOURCES', 'FIELDS');

-- DropIndex
DROP INDEX "Capability_status_sortOrder_idx";

-- AlterTable
ALTER TABLE "Capability" ADD COLUMN     "group" "CapabilityGroup" NOT NULL DEFAULT 'FIELDS';

-- CreateIndex
CREATE INDEX "Capability_status_group_sortOrder_idx" ON "Capability"("status", "group", "sortOrder");

-- Place the nine existing capabilities in the band each one belongs to, so the
-- section reads as three ideas rather than one undifferentiated list. Anything
-- added later defaults to FIELDS and can be moved in the dashboard.
UPDATE "Capability" SET "group" = 'EXPERIENCE', "sortOrder" = 0 WHERE slug = 'technical-expertise';
UPDATE "Capability" SET "group" = 'EXPERIENCE', "sortOrder" = 1 WHERE slug = 'specialized-teams';
UPDATE "Capability" SET "group" = 'EXPERIENCE', "sortOrder" = 2 WHERE slug = 'project-execution';

UPDATE "Capability" SET "group" = 'RESOURCES',  "sortOrder" = 0 WHERE slug = 'operational-capabilities';

UPDATE "Capability" SET "group" = 'FIELDS',     "sortOrder" = 0 WHERE slug = 'roads';
UPDATE "Capability" SET "group" = 'FIELDS',     "sortOrder" = 1 WHERE slug = 'paving';
UPDATE "Capability" SET "group" = 'FIELDS',     "sortOrder" = 2 WHERE slug = 'asphalt';
UPDATE "Capability" SET "group" = 'FIELDS',     "sortOrder" = 3 WHERE slug = 'concrete';
UPDATE "Capability" SET "group" = 'FIELDS',     "sortOrder" = 4 WHERE slug = 'infrastructure';