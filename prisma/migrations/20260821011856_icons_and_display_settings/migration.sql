-- AlterTable
ALTER TABLE "Sector" ADD COLUMN     "icon" TEXT;

-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "showIcons" BOOLEAN NOT NULL DEFAULT true;
