/*
  Warnings:

  - You are about to drop the column `restaurantId` on the `CategorieSupplement` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `CategorieSupplement` DROP FOREIGN KEY `CategorieSupplement_restaurantId_fkey`;

-- DropIndex
DROP INDEX `CategorieSupplement_restaurantId_fkey` ON `CategorieSupplement`;

-- AlterTable
ALTER TABLE `CategorieSupplement` DROP COLUMN `restaurantId`;
