-- CreateTable
CREATE TABLE `Utilisateur` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `motdepasse` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'GERANT') NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `dateNaissance` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estEnEssai` BOOLEAN NOT NULL DEFAULT true,
    `pays` VARCHAR(191) NOT NULL,
    `ville` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Utilisateur_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Restaurant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `motdepasse` VARCHAR(191) NOT NULL,
    `tokenActif` VARCHAR(191) NULL,
    `restaurantId` INTEGER NULL,
    `adresse` VARCHAR(191) NULL,

    UNIQUE INDEX `Restaurant_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commande` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `etat` ENUM('SURPLACE', 'ENPORTER') NOT NULL,
    `restaurantId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categorie` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Categorie_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetailCommande` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomProduit` VARCHAR(191) NOT NULL,
    `quantite` INTEGER NOT NULL,
    `prix` DOUBLE NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `commandeId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RestaurantCategorie` (
    `restaurantId` INTEGER NOT NULL,
    `categorieId` INTEGER NOT NULL,
    `dateAchat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`restaurantId`, `categorieId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prix` DOUBLE NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `categorieId` INTEGER NOT NULL,

    UNIQUE INDEX `Produit_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategorieSupplement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `produitId` INTEGER NOT NULL,

    UNIQUE INDEX `CategorieSupplement_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProduitSupplement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prix` DOUBLE NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `categorieSupplementId` INTEGER NOT NULL,

    UNIQUE INDEX `ProduitSupplement_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Restaurant` ADD CONSTRAINT `Restaurant_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Utilisateur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commande` ADD CONSTRAINT `Commande_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailCommande` ADD CONSTRAINT `DetailCommande_commandeId_fkey` FOREIGN KEY (`commandeId`) REFERENCES `Commande`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestaurantCategorie` ADD CONSTRAINT `RestaurantCategorie_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RestaurantCategorie` ADD CONSTRAINT `RestaurantCategorie_categorieId_fkey` FOREIGN KEY (`categorieId`) REFERENCES `Categorie`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Produit` ADD CONSTRAINT `Produit_categorieId_fkey` FOREIGN KEY (`categorieId`) REFERENCES `Categorie`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategorieSupplement` ADD CONSTRAINT `CategorieSupplement_produitId_fkey` FOREIGN KEY (`produitId`) REFERENCES `Produit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProduitSupplement` ADD CONSTRAINT `ProduitSupplement_categorieSupplementId_fkey` FOREIGN KEY (`categorieSupplementId`) REFERENCES `CategorieSupplement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
