/*
  Warnings:

  - A unique constraint covering the columns `[value]` on the table `cash_item` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cash_item_value_key" ON "cash_item"("value");
