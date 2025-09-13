/*
  Warnings:

  - You are about to drop the `favoris_formations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `favoris_pays` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `formations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `guides` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lettres_motivation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pays` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pays_villes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `publicites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `universites_formations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `universites_mondiales` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `utilisateurs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `villes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `villes_universites` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `favoris_formations` DROP FOREIGN KEY `favoris_formations_formationId_fkey`;

-- DropForeignKey
ALTER TABLE `favoris_formations` DROP FOREIGN KEY `favoris_formations_utilisateurId_fkey`;

-- DropForeignKey
ALTER TABLE `favoris_pays` DROP FOREIGN KEY `favoris_pays_nomPays_fkey`;

-- DropForeignKey
ALTER TABLE `favoris_pays` DROP FOREIGN KEY `favoris_pays_utilisateurId_fkey`;

-- DropForeignKey
ALTER TABLE `guides` DROP FOREIGN KEY `guides_pays_fkey`;

-- DropForeignKey
ALTER TABLE `lettres_motivation` DROP FOREIGN KEY `lettres_motivation_pays_fkey`;

-- DropForeignKey
ALTER TABLE `pays_villes` DROP FOREIGN KEY `pays_villes_paysId_fkey`;

-- DropForeignKey
ALTER TABLE `pays_villes` DROP FOREIGN KEY `pays_villes_villeId_fkey`;

-- DropForeignKey
ALTER TABLE `universites_formations` DROP FOREIGN KEY `universites_formations_formationId_fkey`;

-- DropForeignKey
ALTER TABLE `universites_formations` DROP FOREIGN KEY `universites_formations_universiteId_fkey`;

-- DropForeignKey
ALTER TABLE `villes_universites` DROP FOREIGN KEY `villes_universites_universiteId_fkey`;

-- DropForeignKey
ALTER TABLE `villes_universites` DROP FOREIGN KEY `villes_universites_villeId_fkey`;

-- DropTable
DROP TABLE `favoris_formations`;

-- DropTable
DROP TABLE `favoris_pays`;

-- DropTable
DROP TABLE `formations`;

-- DropTable
DROP TABLE `guides`;

-- DropTable
DROP TABLE `lettres_motivation`;

-- DropTable
DROP TABLE `pays`;

-- DropTable
DROP TABLE `pays_villes`;

-- DropTable
DROP TABLE `publicites`;

-- DropTable
DROP TABLE `universites_formations`;

-- DropTable
DROP TABLE `universites_mondiales`;

-- DropTable
DROP TABLE `utilisateurs`;

-- DropTable
DROP TABLE `villes`;

-- DropTable
DROP TABLE `villes_universites`;

-- CreateTable
CREATE TABLE `Utilisateur` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `motdepasse` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NULL,
    `numero` VARCHAR(191) NULL,
    `dateNaissance` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pays` VARCHAR(191) NULL,
    `ville` VARCHAR(191) NULL,
    `estEnLigne` BOOLEAN NULL DEFAULT false,
    `creeA` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifieA` DATETIME(3) NULL,
    `role` ENUM('ETUDIANT', 'ADMIN', 'MODERATEUR') NOT NULL,
    `langue` VARCHAR(191) NULL DEFAULT 'fr',

    UNIQUE INDEX `Utilisateur_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FavoriPays` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` INTEGER NOT NULL,
    `nomPays` VARCHAR(191) NOT NULL,
    `creeA` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FavoriPays_utilisateurId_idx`(`utilisateurId`),
    UNIQUE INDEX `FavoriPays_utilisateurId_nomPays_key`(`utilisateurId`, `nomPays`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FavoriFormation` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` INTEGER NOT NULL,
    `formationId` VARCHAR(191) NOT NULL,
    `creeA` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FavoriFormation_utilisateurId_idx`(`utilisateurId`),
    INDEX `FavoriFormation_formationId_idx`(`formationId`),
    UNIQUE INDEX `FavoriFormation_utilisateurId_formationId_key`(`utilisateurId`, `formationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pays` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `nomEn` VARCHAR(191) NOT NULL,
    `nomFr` VARCHAR(191) NOT NULL,
    `drapeau` VARCHAR(191) NOT NULL,
    `continent` ENUM('AFRIQUE', 'AMERIQUE', 'ASIE', 'EUROPE', 'OCEANIE') NOT NULL,
    `region` VARCHAR(191) NULL,
    `avantages` TEXT NOT NULL,
    `avantagesEn` TEXT NOT NULL,
    `avantagesFr` TEXT NOT NULL,
    `popularite` INTEGER NOT NULL DEFAULT 50,
    `cout` INTEGER NOT NULL,
    `langue` VARCHAR(191) NOT NULL,
    `monnaie` VARCHAR(191) NOT NULL,
    `creeA` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifieA` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Pays_nom_key`(`nom`),
    INDEX `Pays_continent_idx`(`continent`),
    INDEX `Pays_popularite_idx`(`popularite`),
    INDEX `Pays_cout_idx`(`cout`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ville` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `nomEn` VARCHAR(191) NOT NULL,
    `nomFr` VARCHAR(191) NOT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `population` INTEGER NULL,
    `creeA` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifieA` DATETIME(3) NOT NULL,

    INDEX `Ville_nom_idx`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaysVille` (
    `id` VARCHAR(191) NOT NULL,
    `paysId` VARCHAR(191) NOT NULL,
    `villeId` VARCHAR(191) NOT NULL,

    INDEX `PaysVille_paysId_idx`(`paysId`),
    INDEX `PaysVille_villeId_idx`(`villeId`),
    UNIQUE INDEX `PaysVille_paysId_villeId_key`(`paysId`, `villeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Guide` (
    `id` VARCHAR(191) NOT NULL,
    `pays` VARCHAR(191) NOT NULL,
    `section` VARCHAR(191) NOT NULL,
    `etape` INTEGER NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `titreEn` VARCHAR(191) NOT NULL,
    `titreFr` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `descriptionEn` TEXT NOT NULL,
    `descriptionFr` TEXT NOT NULL,
    `exemple` TEXT NULL,
    `exempleEn` TEXT NULL,
    `exempleFr` TEXT NULL,
    `documents` JSON NULL,
    `duree` VARCHAR(191) NULL,
    `cout` VARCHAR(191) NULL,
    `creeA` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifieA` DATETIME(3) NOT NULL,

    INDEX `Guide_pays_section_etape_idx`(`pays`, `section`, `etape`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LettreMotivation` (
    `id` VARCHAR(191) NOT NULL,
    `pays` VARCHAR(191) NOT NULL,
    `type` ENUM('universite', 'visa', 'bourse') NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `titreEn` VARCHAR(191) NOT NULL,
    `titreFr` VARCHAR(191) NOT NULL,
    `contenu` TEXT NOT NULL,
    `contenuEn` TEXT NOT NULL,
    `contenuFr` TEXT NOT NULL,
    `exemple` TEXT NOT NULL,
    `exempleEn` TEXT NOT NULL,
    `exempleFr` TEXT NOT NULL,
    `conseils` JSON NOT NULL,
    `conseilsEn` JSON NOT NULL,
    `conseilsFr` JSON NOT NULL,
    `creeA` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifieA` DATETIME(3) NOT NULL,

    INDEX `LettreMotivation_pays_type_idx`(`pays`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Formation` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(500) NOT NULL,
    `nomEn` VARCHAR(500) NOT NULL,
    `nomFr` VARCHAR(500) NOT NULL,
    `niveau` VARCHAR(191) NULL,
    `domaine` VARCHAR(191) NULL,
    `duree` VARCHAR(191) NULL,
    `diplome` VARCHAR(191) NULL,
    `langueEnseignement` VARCHAR(191) NULL,
    `coutAnnuel` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `descriptionEn` TEXT NULL,
    `descriptionFr` TEXT NULL,
    `prerequis` JSON NULL,
    `debouches` JSON NULL,
    `creeA` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifieA` DATETIME(3) NOT NULL,

    INDEX `Formation_niveau_idx`(`niveau`),
    INDEX `Formation_domaine_idx`(`domaine`),
    INDEX `Formation_nom_idx`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UniversiteMondiale` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(500) NOT NULL,
    `nomEn` VARCHAR(500) NOT NULL,
    `nomFr` VARCHAR(500) NOT NULL,
    `pays` VARCHAR(191) NOT NULL,
    `siteWeb` VARCHAR(500) NULL,
    `domaine` VARCHAR(191) NULL,
    `idRor` VARCHAR(100) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `nomNorme` VARCHAR(500) NOT NULL,
    `paysNorme` VARCHAR(191) NOT NULL,
    `fournisseur` ENUM('hipo', 'ror', 'personnalise') NOT NULL,
    `dernierSync` BIGINT NOT NULL,
    `description` TEXT NULL,
    `descriptionEn` TEXT NULL,
    `descriptionFr` TEXT NULL,
    `fondee` INTEGER NULL,
    `statut` VARCHAR(191) NULL,
    `classement` INTEGER NULL,
    `creeA` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifieA` DATETIME(3) NOT NULL,
    `typeEtablissement` ENUM('public', 'prive') NULL,

    INDEX `UniversiteMondiale_paysNorme_idx`(`paysNorme`),
    INDEX `UniversiteMondiale_nomNorme_idx`(`nomNorme`),
    INDEX `UniversiteMondiale_pays_idx`(`pays`),
    INDEX `UniversiteMondiale_classement_idx`(`classement`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VilleUniversite` (
    `id` VARCHAR(191) NOT NULL,
    `villeId` VARCHAR(191) NOT NULL,
    `universiteId` VARCHAR(191) NOT NULL,

    INDEX `VilleUniversite_villeId_idx`(`villeId`),
    INDEX `VilleUniversite_universiteId_idx`(`universiteId`),
    UNIQUE INDEX `VilleUniversite_villeId_universiteId_key`(`villeId`, `universiteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UniversiteFormation` (
    `id` VARCHAR(191) NOT NULL,
    `universiteId` VARCHAR(191) NOT NULL,
    `formationId` VARCHAR(191) NOT NULL,
    `capacite` INTEGER NULL,
    `fraisInscription` VARCHAR(191) NULL,
    `dateDebut` DATETIME(3) NULL,
    `dateFin` DATETIME(3) NULL,
    `langueEnseignement` VARCHAR(191) NULL,
    `creeA` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifieA` DATETIME(3) NOT NULL,

    INDEX `UniversiteFormation_universiteId_idx`(`universiteId`),
    INDEX `UniversiteFormation_formationId_idx`(`formationId`),
    UNIQUE INDEX `UniversiteFormation_universiteId_formationId_key`(`universiteId`, `formationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Publicite` (
    `id` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `titreEn` VARCHAR(191) NOT NULL,
    `titreFr` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `descriptionEn` TEXT NOT NULL,
    `descriptionFr` TEXT NOT NULL,
    `urlImage` VARCHAR(500) NULL,
    `urlCible` VARCHAR(500) NOT NULL,
    `categorie` ENUM('langue', 'pret', 'assurance', 'logement') NOT NULL,
    `estActif` BOOLEAN NOT NULL DEFAULT true,
    `priorite` INTEGER NOT NULL DEFAULT 0,
    `cibleGeo` JSON NULL,
    `creeA` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifieA` DATETIME(3) NOT NULL,

    INDEX `Publicite_categorie_estActif_idx`(`categorie`, `estActif`),
    INDEX `Publicite_priorite_idx`(`priorite`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FavoriPays` ADD CONSTRAINT `FavoriPays_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriPays` ADD CONSTRAINT `FavoriPays_nomPays_fkey` FOREIGN KEY (`nomPays`) REFERENCES `Pays`(`nom`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriFormation` ADD CONSTRAINT `FavoriFormation_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FavoriFormation` ADD CONSTRAINT `FavoriFormation_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `Formation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaysVille` ADD CONSTRAINT `PaysVille_paysId_fkey` FOREIGN KEY (`paysId`) REFERENCES `Pays`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaysVille` ADD CONSTRAINT `PaysVille_villeId_fkey` FOREIGN KEY (`villeId`) REFERENCES `Ville`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Guide` ADD CONSTRAINT `Guide_pays_fkey` FOREIGN KEY (`pays`) REFERENCES `Pays`(`nom`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LettreMotivation` ADD CONSTRAINT `LettreMotivation_pays_fkey` FOREIGN KEY (`pays`) REFERENCES `Pays`(`nom`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VilleUniversite` ADD CONSTRAINT `VilleUniversite_villeId_fkey` FOREIGN KEY (`villeId`) REFERENCES `Ville`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VilleUniversite` ADD CONSTRAINT `VilleUniversite_universiteId_fkey` FOREIGN KEY (`universiteId`) REFERENCES `UniversiteMondiale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UniversiteFormation` ADD CONSTRAINT `UniversiteFormation_universiteId_fkey` FOREIGN KEY (`universiteId`) REFERENCES `UniversiteMondiale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UniversiteFormation` ADD CONSTRAINT `UniversiteFormation_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `Formation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
