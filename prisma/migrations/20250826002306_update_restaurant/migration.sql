-- CreateTable
CREATE TABLE `Theme` (
    `id` VARCHAR(191) NOT NULL,
    `contenuFr` TEXT NOT NULL,
    `contenuEn` TEXT NOT NULL,
    `paysId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetailTheme` (
    `id` VARCHAR(191) NOT NULL,
    `contenuFr` TEXT NOT NULL,
    `contenuEn` TEXT NOT NULL,
    `themeId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lien` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `detailThemeId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Theme` ADD CONSTRAINT `Theme_paysId_fkey` FOREIGN KEY (`paysId`) REFERENCES `Pays`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailTheme` ADD CONSTRAINT `DetailTheme_themeId_fkey` FOREIGN KEY (`themeId`) REFERENCES `Theme`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lien` ADD CONSTRAINT `Lien_detailThemeId_fkey` FOREIGN KEY (`detailThemeId`) REFERENCES `DetailTheme`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
