import React, { useState } from "react";
import { IConversation } from "../utils/interfaces";
import MessageModal from "./MessageModal";
import { IconButton } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import MarkUnreadChatAltIcon from "@mui/icons-material/MarkUnreadChatAlt";

interface Props {
    userId?: number;
    conversation: IConversation;
    isLoading: boolean;
    setLoading: (arg: boolean) => void;
    setConversations: (arg: IConversation[]) => void;
    isUserPage? : boolean
}

const Conversation: React.FC<Props> = ({ userId, conversation, isLoading, setLoading, setConversations, isUserPage }) => {
    const [messageModalOpen, setMessageModalOpen] = useState<boolean>(false);

    const onCloseModal = (convs: IConversation[]) => {
        setMessageModalOpen(false);
        setConversations(convs);
    };

    return (
        <span>
            <MessageModal
                userId={userId}
                interlocutorId={conversation.interlocutorId}
                isOpen={messageModalOpen}
                isLoading={isLoading}
                setLoading={setLoading}
                closeModal={onCloseModal}
                setConversations={setConversations}
                isUserPage = {isUserPage}
            />
            <IconButton onClick={() => setMessageModalOpen(true)} disabled={isLoading}>
                {conversation.unread > 0 ? <MarkUnreadChatAltIcon /> : <ChatIcon />}
            </IconButton>
            &nbsp;
        </span>
    );
};

export default Conversation;
