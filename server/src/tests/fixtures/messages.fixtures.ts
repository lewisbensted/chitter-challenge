import { Message } from "@prisma/client";

export const testMessages: Message[] = [
    {
        id: 1,
        senderId: 1,
        senderUsername: "testuser1",
        recipientId: 2,
        recipientUsername: "testuser2",
        text: "test message from testuser1 to testuser2",
        createdAt: new Date(2000, 0, 1, 0, 0, 0),
        updatedAt: new Date(2000, 0, 1, 0, 0, 0),
        isRead : true
    },
    {
        id: 2,
        senderId: 1,
        senderUsername: "testuser1",
        recipientId: 2,
        recipientUsername: "testuser2",
        text: "second test message from testuser1 to testuser2",
        createdAt: new Date(2000, 0, 1, 0, 0, 4),
        updatedAt: new Date(2000, 0, 1, 0, 0, 4),
        isRead: false
    },
    {
        id: 3,
        senderId: 1,
        senderUsername: "testuser1",
        recipientId: 3,
        recipientUsername: "testuser3",
        text: "test message from testuser1 to testuser3",
        createdAt: new Date(2000, 0, 1, 0, 0, 6),
        updatedAt: new Date(2000, 0, 1, 0, 0, 6),
        isRead: true
    },
    {
        id: 4,
        senderId: 2,
        senderUsername: "testuser2",
        recipientId: 1,
        recipientUsername: "testuser1",
        text: "test message from testuser2 to testuser1",
        createdAt: new Date(2000, 0, 1, 0, 0, 2),
        updatedAt: new Date(2000, 0, 1, 0, 0, 2),
        isRead: false
    },
    {
        id: 5,
        senderId: 2,
        senderUsername: "testuser2",
        recipientId: 1,
        recipientUsername: "testuser1",
        text: "second test message from testuser2 to testuser1",
        createdAt: new Date(2000, 0, 1, 0, 0, 12),
        updatedAt: new Date(2000, 0, 1, 0, 0, 12),
        isRead: false
    },
    {
        id: 6,
        senderId: 2,
        senderUsername: "testuser2",
        recipientId: 3,
        recipientUsername: "testuser3",
        text: "test message from testuser2 to testuser3",
        createdAt: new Date(2000, 0, 1, 0, 0, 1),
        updatedAt: new Date(2000, 0, 1, 0, 0, 1),
        isRead: true
    },
    {
        id: 7,
        senderId: 2,
        senderUsername: "testuser2",
        recipientId: 3,
        recipientUsername: "testuser3",
        text: "second test message from testuser2 to testuser3",
        createdAt: new Date(2000, 0, 1, 0, 0, 5),
        updatedAt: new Date(2000, 0, 1, 0, 0, 5),
        isRead: false
    },
    {
        id: 8,
        senderId: 3,
        senderUsername: "testuser3",
        recipientId: 1,
        recipientUsername: "testuser1",
        text: "test message from testuser3 to testuser1",
        createdAt: new Date(2000, 0, 1, 0, 0, 3),
        updatedAt: new Date(2000, 0, 1, 0, 0, 3),
        isRead: true
    },
    {
        id: 9,
        senderId: 3,
        senderUsername: "testuser3",
        recipientId: 1,
        recipientUsername: "testuser1",
        text: "second test message from testuser3 to testuser1",
        createdAt: new Date(2000, 0, 1, 0, 0, 7),
        updatedAt: new Date(2000, 0, 1, 0, 0, 7),
        isRead: true
    },
    {
        id: 10,
        senderId: 3,
        senderUsername: "testuser3",
        recipientId: 1,
        recipientUsername: "testuser1",
        text: "third test message from testuser3 to testuser1",
        createdAt: new Date(2000, 0, 1, 0, 0, 10),
        updatedAt: new Date(2000, 0, 1, 0, 0, 10),
        isRead: false
    },
    {
        id: 11,
        senderId: 3,
        senderUsername: "testuser3",
        recipientId: 2,
        recipientUsername: "testuser2",
        text: "test message from testuser3 to testuser2",
        createdAt: new Date(2000, 0, 1, 0, 0, 8),
        updatedAt: new Date(2000, 0, 1, 0, 0, 8),
        isRead: false
    },
    {
        id: 12,
        senderId: 3,
        senderUsername: "testuser3",
        recipientId: 2,
        recipientUsername: "testuser2",
        text: "second test message from testuser3 to testuser2",
        createdAt: new Date(2000, 0, 1, 0, 0, 9),
        updatedAt: new Date(2000, 0, 1, 0, 0, 9),
        isRead: false
    },
    {
        id: 13,
        senderId: 3,
        senderUsername: "testuser3",
        recipientId: 2,
        recipientUsername: "testuser2",
        text: "third test message from testuser3 to testuser2",
        createdAt: new Date(2000, 0, 1, 0, 0, 13),
        updatedAt: new Date(2000, 0, 1, 0, 0, 13),
        isRead: false
    },
    {
        id: 14,
        senderId: 4,
        senderUsername: "testuser4",
        recipientId: 2,
        recipientUsername: "testuser2",
        text: "test message from testuser4 to testuser2",
        createdAt: new Date(2000, 0, 1, 0, 0, 11),
        updatedAt: new Date(2000, 0, 1, 0, 0, 11),
        isRead: false
    }
];
