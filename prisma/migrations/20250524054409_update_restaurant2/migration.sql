-- AlterTable
ALTER TABLE `Restaurant` ADD COLUMN `abonnementId` INTEGER NULL,
    ADD COLUMN `nombreConnexion` INTEGER NULL DEFAULT 0,
    ADD COLUMN `nombreTablette` INTEGER NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Abonnement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dateFin` DATETIME(3) NULL,
    `estActif` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TypeAbonnement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prix` DOUBLE NOT NULL,
    `duree` INTEGER NOT NULL,
    `abonnementId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Restaurant` ADD CONSTRAINT `Restaurant_abonnementId_fkey` FOREIGN KEY (`abonnementId`) REFERENCES `Abonnement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TypeAbonnement` ADD CONSTRAINT `TypeAbonnement_abonnementId_fkey` FOREIGN KEY (`abonnementId`) REFERENCES `Abonnement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
