/*
  Warnings:

  - You are about to drop the `FavoriPays` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `FavoriFormation` DROP FOREIGN KEY `FavoriFormation_utilisateurId_fkey`;

-- DropForeignKey
ALTER TABLE `FavoriPays` DROP FOREIGN KEY `FavoriPays_nomPays_fkey`;

-- DropForeignKey
ALTER TABLE `FavoriPays` DROP FOREIGN KEY `FavoriPays_utilisateurId_fkey`;

-- DropIndex
DROP INDEX `FavoriFormation_utilisateurId_formationId_key` ON `FavoriFormation`;

-- DropIndex
DROP INDEX `FavoriFormation_utilisateurId_idx` ON `FavoriFormation`;

-- AlterTable
ALTER TABLE `Utilisateur` ADD COLUMN `codeVerification` VARCHAR(191) NULL,
    ADD COLUMN `estActif` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `FavoriPays`;
