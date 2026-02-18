-- CreateEnum
CREATE TYPE "TabStatus" AS ENUM ('ACTIVE', 'CLOSED', 'EXHAUSTED');

-- CreateEnum
CREATE TYPE "TabTransactionType" AS ENUM ('DEPOSIT', 'PURCHASE', 'REFUND', 'CASHOUT');

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'TAB';

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "tab_id" TEXT;

-- CreateTable
CREATE TABLE "tabs" (
    "id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "phone" TEXT,
    "balance" DECIMAL(10,2) NOT NULL,
    "initial_deposit" DECIMAL(10,2) NOT NULL,
    "status" "TabStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "tabs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tab_transactions" (
    "id" TEXT NOT NULL,
    "tab_id" TEXT NOT NULL,
    "type" "TabTransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "sale_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tab_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tabs_status_idx" ON "tabs"("status");

-- CreateIndex
CREATE INDEX "tabs_customer_name_idx" ON "tabs"("customer_name");

-- CreateIndex
CREATE INDEX "tabs_created_by_id_idx" ON "tabs"("created_by_id");

-- CreateIndex
CREATE INDEX "tab_transactions_tab_id_idx" ON "tab_transactions"("tab_id");

-- CreateIndex
CREATE INDEX "sales_tab_id_idx" ON "sales"("tab_id");

-- CreateIndex
CREATE INDEX "sales_user_id_created_at_idx" ON "sales"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "sales_status_created_at_idx" ON "sales"("status", "created_at");

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_tab_id_fkey" FOREIGN KEY ("tab_id") REFERENCES "tabs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tabs" ADD CONSTRAINT "tabs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_transactions" ADD CONSTRAINT "tab_transactions_tab_id_fkey" FOREIGN KEY ("tab_id") REFERENCES "tabs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_transactions" ADD CONSTRAINT "tab_transactions_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;
