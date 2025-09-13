/*
  Warnings:

  - You are about to drop the column `estEnEssai` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `finEssai` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the `Abonnement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Categorie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CategorieSupplement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CategorieSupplementProduit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Commande` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DetailCommande` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Produit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProduitSupplement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Publicite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Restaurant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RestaurantCategorie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TypeAbonnement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `CategorieSupplementProduit` DROP FOREIGN KEY `CategorieSupplementProduit_categorieSupplementId_fkey`;

-- DropForeignKey
ALTER TABLE `CategorieSupplementProduit` DROP FOREIGN KEY `CategorieSupplementProduit_produitId_fkey`;

-- DropForeignKey
ALTER TABLE `Commande` DROP FOREIGN KEY `Commande_restaurantId_fkey`;

-- DropForeignKey
ALTER TABLE `DetailCommande` DROP FOREIGN KEY `DetailCommande_commandeId_fkey`;

-- DropForeignKey
ALTER TABLE `Produit` DROP FOREIGN KEY `Produit_categorieId_fkey`;

-- DropForeignKey
ALTER TABLE `ProduitSupplement` DROP FOREIGN KEY `ProduitSupplement_categorieSupplementId_fkey`;

-- DropForeignKey
ALTER TABLE `Restaurant` DROP FOREIGN KEY `Restaurant_abonnementId_fkey`;

-- DropForeignKey
ALTER TABLE `Restaurant` DROP FOREIGN KEY `Restaurant_utilisateurId_fkey`;

-- DropForeignKey
ALTER TABLE `RestaurantCategorie` DROP FOREIGN KEY `RestaurantCategorie_categorieId_fkey`;

-- DropForeignKey
ALTER TABLE `RestaurantCategorie` DROP FOREIGN KEY `RestaurantCategorie_restaurantId_fkey`;

-- DropForeignKey
ALTER TABLE `TypeAbonnement` DROP FOREIGN KEY `TypeAbonnement_abonnementId_fkey`;

-- AlterTable
ALTER TABLE `Utilisateur` DROP COLUMN `estEnEssai`,
    DROP COLUMN `finEssai`,
    DROP COLUMN `role`;

-- DropTable
DROP TABLE `Abonnement`;

-- DropTable
DROP TABLE `Categorie`;

-- DropTable
DROP TABLE `CategorieSupplement`;

-- DropTable
DROP TABLE `CategorieSupplementProduit`;

-- DropTable
DROP TABLE `Commande`;

-- DropTable
DROP TABLE `DetailCommande`;

-- DropTable
DROP TABLE `Produit`;

-- DropTable
DROP TABLE `ProduitSupplement`;

-- DropTable
DROP TABLE `Publicite`;

-- DropTable
DROP TABLE `Restaurant`;

-- DropTable
DROP TABLE `RestaurantCategorie`;

-- DropTable
DROP TABLE `TypeAbonnement`;

-- CreateTable
CREATE TABLE `Livre` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titre` VARCHAR(191) NOT NULL,
    `auteur` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `prix` DOUBLE NOT NULL,
    `dateSortie` DATETIME(3) NOT NULL,
    `lien` VARCHAR(191) NOT NULL,
    `utilisateurId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Livre` ADD CONSTRAINT `Livre_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
