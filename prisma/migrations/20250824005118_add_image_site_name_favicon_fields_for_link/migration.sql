-- AlterTable
ALTER TABLE "public"."Link" ADD COLUMN     "favicon" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "siteName" TEXT,
ALTER COLUMN "description" DROP NOT NULL;
