import React, { useState } from "react";
import { IConversation } from "../utils/interfaces";
import MessageModal from "./MessageModal";
import IconButton from "@mui/material/IconButton/IconButton";
import Chat from "@mui/icons-material/Chat";
import MarkUnreadChatAlt from "@mui/icons-material/MarkUnreadChatAlt";

interface Props {
    userId?: number;
    conversation: IConversation;
    isComponentLoading: boolean;
    setComponentLoading: (arg: boolean) => void;
    setConversations: (arg: IConversation[]) => void;
    isUserPage?: boolean;
    reloadTrigger: boolean;
    toggleReloadTrigger: (arg: boolean) => void;
}

const Conversation: React.FC<Props> = ({
    userId,
    conversation,
    isComponentLoading,
    setComponentLoading,
    setConversations,
    reloadTrigger,
    toggleReloadTrigger,
}) => {
    const [messageModalOpen, setMessageModalOpen] = useState<boolean>(false);

    return (
        <span>
            <MessageModal
                userId={userId}
                interlocutorId={conversation.interlocutorId}
                isOpen={messageModalOpen}
                isComponentLoading={isComponentLoading}
                setComponentLoading={setComponentLoading}
                closeModal={() => {
                    setMessageModalOpen(false);
                    toggleReloadTrigger(!reloadTrigger);
                }}
                setConversations={setConversations}
                reloadTrigger={reloadTrigger}
                toggleReloadTrigger={toggleReloadTrigger}
            />
            <IconButton onClick={() => setMessageModalOpen(true)} disabled={isComponentLoading}>
                {conversation.unread > 0 ? <MarkUnreadChatAlt /> : <Chat />}
            </IconButton>
            &nbsp;
        </span>
    );
};

export default Conversation;
