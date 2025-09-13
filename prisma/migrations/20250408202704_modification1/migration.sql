/*
  Warnings:

  - You are about to drop the column `restaurantId` on the `Restaurant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Restaurant` DROP FOREIGN KEY `Restaurant_restaurantId_fkey`;

-- DropIndex
DROP INDEX `Restaurant_restaurantId_fkey` ON `Restaurant`;

-- AlterTable
ALTER TABLE `Restaurant` DROP COLUMN `restaurantId`,
    ADD COLUMN `utilisateurId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Restaurant` ADD CONSTRAINT `Restaurant_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
