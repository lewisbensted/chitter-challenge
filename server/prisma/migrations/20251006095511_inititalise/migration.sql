/*
  Warnings:

  - Made the column `latestMessageId` on table `conversation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `conversation` DROP FOREIGN KEY `Conversation_latestMessageId_fkey`;

-- AlterTable
ALTER TABLE `conversation` MODIFY `latestMessageId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_latestMessageId_fkey` FOREIGN KEY (`latestMessageId`) REFERENCES `Messages`(`uuid`) ON DELETE RESTRICT ON UPDATE CASCADE;
