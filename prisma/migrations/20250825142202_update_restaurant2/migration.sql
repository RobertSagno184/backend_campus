/*
  Warnings:

  - You are about to drop the `Utilisateur` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Utilisateur`;

-- CreateTable
CREATE TABLE `users` (
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
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `role` ENUM('ETUDIANT', 'ADMIN', 'MODERATEUR') NOT NULL,
    `langue` VARCHAR(191) NULL DEFAULT 'fr',

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_favorites` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `country_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_favorites_user_id_idx`(`user_id`),
    UNIQUE INDEX `user_favorites_user_id_country_name_key`(`user_id`, `country_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_favorite_programs` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `program_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_favorite_programs_user_id_idx`(`user_id`),
    INDEX `user_favorite_programs_program_id_idx`(`program_id`),
    UNIQUE INDEX `user_favorite_programs_user_id_program_id_key`(`user_id`, `program_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `countries` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `name_en` VARCHAR(191) NOT NULL,
    `name_fr` VARCHAR(191) NOT NULL,
    `drapeau` VARCHAR(191) NOT NULL,
    `continent` ENUM('AFRIQUE', 'AMERIQUE', 'ASIE', 'EUROPE', 'OCEANIE') NOT NULL,
    `region` VARCHAR(191) NULL,
    `avantages` TEXT NOT NULL,
    `advantages_en` TEXT NOT NULL,
    `advantages_fr` TEXT NOT NULL,
    `popularite` INTEGER NOT NULL DEFAULT 50,
    `cout` INTEGER NOT NULL,
    `langue` VARCHAR(191) NOT NULL,
    `monnaie` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `countries_nom_key`(`nom`),
    INDEX `countries_continent_idx`(`continent`),
    INDEX `countries_popularite_idx`(`popularite`),
    INDEX `countries_cout_idx`(`cout`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cities` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `name_en` VARCHAR(191) NOT NULL,
    `name_fr` VARCHAR(191) NOT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `population` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cities_nom_idx`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `country_cities` (
    `id` VARCHAR(191) NOT NULL,
    `country_id` VARCHAR(191) NOT NULL,
    `city_id` VARCHAR(191) NOT NULL,

    INDEX `country_cities_country_id_idx`(`country_id`),
    INDEX `country_cities_city_id_idx`(`city_id`),
    UNIQUE INDEX `country_cities_country_id_city_id_key`(`country_id`, `city_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guides` (
    `id` VARCHAR(191) NOT NULL,
    `pays` VARCHAR(191) NOT NULL,
    `section` VARCHAR(191) NOT NULL,
    `etape` INTEGER NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `title_en` VARCHAR(191) NOT NULL,
    `title_fr` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `description_en` TEXT NOT NULL,
    `description_fr` TEXT NOT NULL,
    `exemple` TEXT NULL,
    `example_en` TEXT NULL,
    `example_fr` TEXT NULL,
    `documents` JSON NULL,
    `duree` VARCHAR(191) NULL,
    `cout` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `guides_pays_section_etape_idx`(`pays`, `section`, `etape`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `motivation_letters` (
    `id` VARCHAR(191) NOT NULL,
    `pays` VARCHAR(191) NOT NULL,
    `type` ENUM('university', 'visa', 'scholarship') NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `title_en` VARCHAR(191) NOT NULL,
    `title_fr` VARCHAR(191) NOT NULL,
    `contenu` TEXT NOT NULL,
    `content_en` TEXT NOT NULL,
    `content_fr` TEXT NOT NULL,
    `exemple` TEXT NOT NULL,
    `example_en` TEXT NOT NULL,
    `example_fr` TEXT NOT NULL,
    `conseils` JSON NOT NULL,
    `tips_en` JSON NOT NULL,
    `tips_fr` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `motivation_letters_pays_type_idx`(`pays`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `programs` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(500) NOT NULL,
    `name_en` VARCHAR(500) NOT NULL,
    `name_fr` VARCHAR(500) NOT NULL,
    `niveau` VARCHAR(191) NULL,
    `domaine` VARCHAR(191) NULL,
    `duree` VARCHAR(191) NULL,
    `diplome` VARCHAR(191) NULL,
    `teaching_language` VARCHAR(191) NULL,
    `annual_cost` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `description_en` TEXT NULL,
    `description_fr` TEXT NULL,
    `prerequis` JSON NULL,
    `debouches` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `programs_niveau_idx`(`niveau`),
    INDEX `programs_domaine_idx`(`domaine`),
    INDEX `programs_nom_idx`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `world_universities` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(500) NOT NULL,
    `name_en` VARCHAR(500) NOT NULL,
    `name_fr` VARCHAR(500) NOT NULL,
    `pays` VARCHAR(191) NOT NULL,
    `siteWeb` VARCHAR(500) NULL,
    `domaine` VARCHAR(191) NULL,
    `ror_id` VARCHAR(100) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `name_norm` VARCHAR(500) NOT NULL,
    `country_norm` VARCHAR(191) NOT NULL,
    `fournisseur` ENUM('hipo', 'ror', 'custom') NOT NULL,
    `last_synced_at` BIGINT NOT NULL,
    `description` TEXT NULL,
    `description_en` TEXT NULL,
    `description_fr` TEXT NULL,
    `founded_year` INTEGER NULL,
    `statut` VARCHAR(191) NULL,
    `ranking` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `typeEtablissement` ENUM('public', 'private') NULL,

    INDEX `world_universities_country_norm_idx`(`country_norm`),
    INDEX `world_universities_name_norm_idx`(`name_norm`),
    INDEX `world_universities_pays_idx`(`pays`),
    INDEX `world_universities_ranking_idx`(`ranking`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `city_universities` (
    `id` VARCHAR(191) NOT NULL,
    `city_id` VARCHAR(191) NOT NULL,
    `university_id` VARCHAR(191) NOT NULL,

    INDEX `city_universities_city_id_idx`(`city_id`),
    INDEX `city_universities_university_id_idx`(`university_id`),
    UNIQUE INDEX `city_universities_city_id_university_id_key`(`city_id`, `university_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `university_programs` (
    `id` VARCHAR(191) NOT NULL,
    `university_id` VARCHAR(191) NOT NULL,
    `program_id` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NULL,
    `enrollment_fee` VARCHAR(191) NULL,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `teaching_language` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `university_programs_university_id_idx`(`university_id`),
    INDEX `university_programs_program_id_idx`(`program_id`),
    UNIQUE INDEX `university_programs_university_id_program_id_key`(`university_id`, `program_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `advertisements` (
    `id` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `title_en` VARCHAR(191) NOT NULL,
    `title_fr` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `description_en` TEXT NOT NULL,
    `description_fr` TEXT NOT NULL,
    `image_url` VARCHAR(500) NULL,
    `target_url` VARCHAR(500) NOT NULL,
    `categorie` ENUM('language', 'loan', 'insurance', 'housing') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `priorite` INTEGER NOT NULL DEFAULT 0,
    `geo_target` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `advertisements_categorie_is_active_idx`(`categorie`, `is_active`),
    INDEX `advertisements_priorite_idx`(`priorite`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_favorites` ADD CONSTRAINT `user_favorites_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_favorites` ADD CONSTRAINT `user_favorites_country_name_fkey` FOREIGN KEY (`country_name`) REFERENCES `countries`(`nom`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_favorite_programs` ADD CONSTRAINT `user_favorite_programs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_favorite_programs` ADD CONSTRAINT `user_favorite_programs_program_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `country_cities` ADD CONSTRAINT `country_cities_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `country_cities` ADD CONSTRAINT `country_cities_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guides` ADD CONSTRAINT `guides_pays_fkey` FOREIGN KEY (`pays`) REFERENCES `countries`(`nom`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `motivation_letters` ADD CONSTRAINT `motivation_letters_pays_fkey` FOREIGN KEY (`pays`) REFERENCES `countries`(`nom`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `city_universities` ADD CONSTRAINT `city_universities_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `city_universities` ADD CONSTRAINT `city_universities_university_id_fkey` FOREIGN KEY (`university_id`) REFERENCES `world_universities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `university_programs` ADD CONSTRAINT `university_programs_university_id_fkey` FOREIGN KEY (`university_id`) REFERENCES `world_universities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `university_programs` ADD CONSTRAINT `university_programs_program_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
