-- CreateTable
CREATE TABLE `DetailFormation` (
    `id` VARCHAR(191) NOT NULL,
    `contenuFr` TEXT NOT NULL,
    `contenuEn` TEXT NOT NULL,
    `lienFr` VARCHAR(500) NULL,
    `lienEn` VARCHAR(500) NULL,
    `videoFr` VARCHAR(500) NULL,
    `videoEn` VARCHAR(500) NULL,
    `formationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `DetailFormation_formationId_key`(`formationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DetailFormation` ADD CONSTRAINT `DetailFormation_formationId_fkey` FOREIGN KEY (`formationId`) REFERENCES `Formation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
