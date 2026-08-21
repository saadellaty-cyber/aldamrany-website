-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "adminLocale" TEXT NOT NULL DEFAULT 'ar',
ADD COLUMN     "arabicFont" TEXT NOT NULL DEFAULT 'cairo';
