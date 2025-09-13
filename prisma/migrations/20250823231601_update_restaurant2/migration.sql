/*
  Warnings:

  - You are about to drop the `Article` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Livre` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Livre` DROP FOREIGN KEY `Livre_utilisateurId_fkey`;

-- DropTable
DROP TABLE `Article`;

-- DropTable
DROP TABLE `Livre`;
