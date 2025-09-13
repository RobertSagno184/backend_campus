/*
  Warnings:

  - Added the required column `restaurantId` to the `CategorieSupplement` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `CategorieSupplement_nom_key` ON `CategorieSupplement`;

-- DropIndex
DROP INDEX `ProduitSupplement_nom_key` ON `ProduitSupplement`;

-- AlterTable
ALTER TABLE `CategorieSupplement` ADD COLUMN `restaurantId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `CategorieSupplement` ADD CONSTRAINT `CategorieSupplement_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
