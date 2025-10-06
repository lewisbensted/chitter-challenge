-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(36) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(30) NOT NULL,
    `password_hash` CHAR(60) NOT NULL,

    UNIQUE INDEX `Users_uuid_key`(`uuid`),
    UNIQUE INDEX `Users_email_key`(`email`),
    UNIQUE INDEX `Users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Follows` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `follower_id` VARCHAR(191) NOT NULL,
    `following_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Follows_follower_id_following_id_key`(`follower_id`, `following_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cheets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `text` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cheets_uuid_key`(`uuid`),
    INDEX `Cheets_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cheet_Status` (
    `cheetId` VARCHAR(191) NOT NULL,
    `has_replies` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`cheetId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Replies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `cheet_id` VARCHAR(191) NOT NULL,
    `text` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Replies_uuid_key`(`uuid`),
    INDEX `Replies_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(36) NOT NULL,
    `sender_id` VARCHAR(191) NOT NULL,
    `recipient_id` VARCHAR(191) NOT NULL,
    `text` VARCHAR(200) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Messages_uuid_key`(`uuid`),
    INDEX `Messages_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message_Status` (
    `messageId` VARCHAR(191) NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`messageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conversation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `latestMessageId` VARCHAR(191) NULL,
    `user1_id` VARCHAR(191) NOT NULL,
    `user1Unread` BOOLEAN NOT NULL DEFAULT false,
    `user2_id` VARCHAR(191) NOT NULL,
    `user2Unread` BOOLEAN NOT NULL DEFAULT false,
    `key` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Conversation_latestMessageId_key`(`latestMessageId`),
    UNIQUE INDEX `Conversation_key_key`(`key`),
    INDEX `Conversation_user1_id_idx`(`user1_id`),
    INDEX `Conversation_user2_id_idx`(`user2_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Follows` ADD CONSTRAINT `Follows_follower_id_fkey` FOREIGN KEY (`follower_id`) REFERENCES `Users`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Follows` ADD CONSTRAINT `Follows_following_id_fkey` FOREIGN KEY (`following_id`) REFERENCES `Users`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cheets` ADD CONSTRAINT `Cheets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cheet_Status` ADD CONSTRAINT `Cheet_Status_cheetId_fkey` FOREIGN KEY (`cheetId`) REFERENCES `Cheets`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Replies` ADD CONSTRAINT `Replies_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Replies` ADD CONSTRAINT `Replies_cheet_id_fkey` FOREIGN KEY (`cheet_id`) REFERENCES `Cheets`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `Users`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `Users`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message_Status` ADD CONSTRAINT `Message_Status_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Messages`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_latestMessageId_fkey` FOREIGN KEY (`latestMessageId`) REFERENCES `Messages`(`uuid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_user1_id_fkey` FOREIGN KEY (`user1_id`) REFERENCES `Users`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_user2_id_fkey` FOREIGN KEY (`user2_id`) REFERENCES `Users`(`uuid`) ON DELETE CASCADE ON UPDATE CASCADE;
