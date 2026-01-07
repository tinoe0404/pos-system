-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'ECOCASH');

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL DEFAULT 'CASH';
