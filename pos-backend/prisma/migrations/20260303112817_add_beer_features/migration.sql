-- CreateEnum
CREATE TYPE "KegStatus" AS ENUM ('NEW', 'ACTIVE', 'EMPTY', 'TAP_RESERVED');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "abv" DECIMAL(4,1),
ADD COLUMN     "brewery" TEXT,
ADD COLUMN     "ibu" INTEGER,
ADD COLUMN     "is_tap_item" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "style" TEXT,
ADD COLUMN     "unit_volume" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "sale_items" ADD COLUMN     "keg_id" TEXT;

-- CreateTable
CREATE TABLE "kegs" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "total_volume" DECIMAL(10,2) NOT NULL,
    "current_volume" DECIMAL(10,2) NOT NULL,
    "status" "KegStatus" NOT NULL DEFAULT 'NEW',
    "tapped_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kegs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taps" (
    "id" INTEGER NOT NULL,
    "keg_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "kegs_product_id_idx" ON "kegs"("product_id");

-- CreateIndex
CREATE INDEX "kegs_status_idx" ON "kegs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "taps_keg_id_key" ON "taps"("keg_id");

-- CreateIndex
CREATE INDEX "sale_items_keg_id_idx" ON "sale_items"("keg_id");

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_keg_id_fkey" FOREIGN KEY ("keg_id") REFERENCES "kegs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegs" ADD CONSTRAINT "kegs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taps" ADD CONSTRAINT "taps_keg_id_fkey" FOREIGN KEY ("keg_id") REFERENCES "kegs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
