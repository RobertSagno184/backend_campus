/*
  Warnings:

  - You are about to drop the column `produitId` on the `CategorieSupplement` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `CategorieSupplement` DROP FOREIGN KEY `CategorieSupplement_produitId_fkey`;

-- DropIndex
DROP INDEX `CategorieSupplement_produitId_fkey` ON `CategorieSupplement`;

-- AlterTable
ALTER TABLE `CategorieSupplement` DROP COLUMN `produitId`;

-- CreateTable
CREATE TABLE `CategorieSupplementProduit` (
    `produitId` INTEGER NOT NULL,
    `categorieSupplementId` INTEGER NOT NULL,
    `estObligatoire` BOOLEAN NOT NULL DEFAULT false,
    `quantiteMax` INTEGER NULL,

    PRIMARY KEY (`produitId`, `categorieSupplementId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CategorieSupplementProduit` ADD CONSTRAINT `CategorieSupplementProduit_produitId_fkey` FOREIGN KEY (`produitId`) REFERENCES `Produit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategorieSupplementProduit` ADD CONSTRAINT `CategorieSupplementProduit_categorieSupplementId_fkey` FOREIGN KEY (`categorieSupplementId`) REFERENCES `CategorieSupplement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
