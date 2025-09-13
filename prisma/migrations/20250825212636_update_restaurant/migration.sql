/*
  Warnings:

  - You are about to drop the column `created_at` on the `guides` table. All the data in the column will be lost.
  - You are about to drop the column `description_en` on the `guides` table. All the data in the column will be lost.
  - You are about to drop the column `description_fr` on the `guides` table. All the data in the column will be lost.
  - You are about to drop the column `example_en` on the `guides` table. All the data in the column will be lost.
  - You are about to drop the column `example_fr` on the `guides` table. All the data in the column will be lost.
  - You are about to drop the column `title_en` on the `guides` table. All the data in the column will be lost.
  - You are about to drop the column `title_fr` on the `guides` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `guides` table. All the data in the column will be lost.
  - You are about to drop the `advertisements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `city_universities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `countries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `country_cities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `motivation_letters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `programs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `university_programs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_favorite_programs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_favorites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `world_universities` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `descriptionEn` to the `guides` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descriptionFr` to the `guides` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modifieA` to the `guides` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titreEn` to the `guides` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titreFr` to the `guides` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `city_universities` DROP FOREIGN KEY `city_universities_city_id_fkey`;

-- DropForeignKey
ALTER TABLE `city_universities` DROP FOREIGN KEY `city_universities_university_id_fkey`;

-- DropForeignKey
ALTER TABLE `country_cities` DROP FOREIGN KEY `country_cities_city_id_fkey`;

-- DropForeignKey
ALTER TABLE `country_cities` DROP FOREIGN KEY `country_cities_country_id_fkey`;

-- DropForeignKey
ALTER TABLE `guides` DROP FOREIGN KEY `guides_pays_fkey`;

-- DropForeignKey
ALTER TABLE `motivation_letters` DROP FOREIGN KEY `motivation_letters_pays_fkey`;

-- DropForeignKey
ALTER TABLE `university_programs` DROP FOREIGN KEY `university_programs_program_id_fkey`;

-- DropForeignKey
ALTER TABLE `university_programs` DROP FOREIGN KEY `university_programs_university_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_favorite_programs` DROP FOREIGN KEY `user_favorite_programs_program_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_favorite_programs` DROP FOREIGN KEY `user_favorite_programs_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_favorites` DROP FOREIGN KEY `user_favorites_country_name_fkey`;

-- DropForeignKey
ALTER TABLE `user_favorites` DROP FOREIGN KEY `user_favorites_user_id_fkey`;

-- AlterTable
ALTER TABLE `guides` DROP COLUMN `created_at`,
    DROP COLUMN `description_en`,
    DROP COLUMN `description_fr`,
    DROP COLUMN `example_en`,
    DROP COLUMN `example_fr`,
    DROP COLUMN `title_en`,
    DROP COLUMN `title_fr`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `creeA` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `descriptionEn` TEXT NOT NULL,
    ADD COLUMN `descriptionFr` TEXT NOT NULL,
    ADD COLUMN `exempleEn` TEXT NULL,
    ADD COLUMN `exempleFr` TEXT NULL,
    ADD COLUMN `modifieA` DATETIME(3) NOT NULL,
    ADD COLUMN `titreEn` VARCHAR(191) NOT NULL,
    ADD COLUMN `titreFr` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `advertisements`;

-- DropTable
DROP TABLE `cities`;

-- DropTable
DROP TABLE `city_universities`;

-- DropTable
DROP TABLE `countries`;

-- DropTable
DROP TABLE `country_cities`;

-- DropTable
DROP TABLE `motivation_letters`;

-- DropTable
DROP TABLE `programs`;

-- DropTable
DROP TABLE `university_programs`;

-- DropTable
DROP TABLE `user_favorite_programs`;

-- DropTable
DROP TABLE `user_favorites`;

-- DropTable
DROP TABLE `users`;

-- DropTable
DROP TABLE `world_universities`;

-- CreateTable
CREATE TABLE `utilisateurs` (
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

    UNIQUE INDEX `utilisateurs_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favoris_pays` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` INTEGER NOT NULL,
    `nomPays` VARCHAR(191) NOT NULL,
    `creeA` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `favoris_pays_utilisateurId_idx`(`utilisateurId`),
    UNIQUE INDEX `favoris_pays_utilisateurId_nomPays_key`(`utilisateurId`, `nomPays`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favoris_formations` (
    `id` VARCHAR(191) NOT NULL,
    `utilisateurId` INTEGER NOT NULL,
    `formationId` VARCHAR(191) NOT NULL,
    `creeA` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `favoris_formations_utilisateurId_idx`(`utilisateurId`),
    INDEX `favoris_formations_formationId_idx`(`formationId`),
    UNIQUE INDEX `favoris_formations_utilisateurId_formationId_key`(`utilisateurId`, `formationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pays` (
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

    UNIQUE INDEX `pays_nom_key`(`nom`),
    INDEX `pays_continent_idx`(`continent`),
    INDEX `pays_popularite_idx`(`popularite`),
    INDEX `pays_cout_idx`(`cout`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `villes` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `nomEn` VARCHAR(191) NOT NULL,
    `nomFr` VARCHAR(191) NOT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `population` INTEGER NULL,
    `creeA` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifieA` DATETIME(3) NOT NULL,

    INDEX `villes_nom_idx`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pays_villes` (
    `id` VARCHAR(191) NOT NULL,
    `paysId` VARCHAR(191) NOT NULL,
    `villeId` VARCHAR(191) NOT NULL,

    INDEX `pays_villes_paysId_idx`(`paysId`),
    INDEX `pays_villes_villeId_idx`(`villeId`),
    UNIQUE INDEX `pays_villes_paysId_villeId_key`(`paysId`, `villeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lettres_motivation` (
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

    INDEX `lettres_motivation_pays_type_idx`(`pays`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `formations` (
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

    INDEX `formations_niveau_idx`(`niveau`),
    INDEX `formations_domaine_idx`(`domaine`),
    INDEX `formations_nom_idx`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `universites_mondiales` (
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

    INDEX `universites_mondiales_paysNorme_idx`(`paysNorme`),
    INDEX `universites_mondiales_nomNorme_idx`(`nomNorme`),
    INDEX `universites_mondiales_pays_idx`(`pays`),
    INDEX `universites_mondiales_classement_idx`(`classement`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `villes_universites` (
    `id` VARCHAR(191) NOT NULL,
    `villeId` VARCHAR(191) NOT NULL,
    `universiteId` VARCHAR(191) NOT NULL,

    INDEX `villes_universites_villeId_idx`(`villeId`),
    INDEX `villes_universites_universiteId_idx`(`universiteId`),
    UNIQUE INDEX `villes_universites_villeId_universiteId_key`(`villeId`, `universiteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `universites_formations` (
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

    INDEX `universites_formations_universiteId_idx`(`universiteId`),
    INDEX `universites_formations_formationId_idx`(`formationId`),
    UNIQUE INDEX `universites_formations_universiteId_formationId_key`(`universiteId`, `formationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `publicites` (
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

    INDEX `publicites_categorie_estActif_idx`(`categorie`, `estActif`),
    INDEX `publicites_priorite_idx`(`priorite`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `favoris_pays` ADD CONSTRAINT `favoris_pays_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favoris_pays` ADD CONSTRAINT `favoris_pays_nomPays_fkey` FOREIGN KEY (`nomPays`) REFERENCES `pays`(`nom`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favoris_formations` ADD CONSTRAINT `favoris_formations_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favoris_formations` ADD CONSTRAINT `favoris_formations_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `formations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pays_villes` ADD CONSTRAINT `pays_villes_paysId_fkey` FOREIGN KEY (`paysId`) REFERENCES `pays`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pays_villes` ADD CONSTRAINT `pays_villes_villeId_fkey` FOREIGN KEY (`villeId`) REFERENCES `villes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guides` ADD CONSTRAINT `guides_pays_fkey` FOREIGN KEY (`pays`) REFERENCES `pays`(`nom`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lettres_motivation` ADD CONSTRAINT `lettres_motivation_pays_fkey` FOREIGN KEY (`pays`) REFERENCES `pays`(`nom`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `villes_universites` ADD CONSTRAINT `villes_universites_villeId_fkey` FOREIGN KEY (`villeId`) REFERENCES `villes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `villes_universites` ADD CONSTRAINT `villes_universites_universiteId_fkey` FOREIGN KEY (`universiteId`) REFERENCES `universites_mondiales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `universites_formations` ADD CONSTRAINT `universites_formations_universiteId_fkey` FOREIGN KEY (`universiteId`) REFERENCES `universites_mondiales`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `universites_formations` ADD CONSTRAINT `universites_formations_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `formations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
