-- AlterTable
ALTER TABLE `ProduitSupplement` ADD COLUMN `quantite` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Publicite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
