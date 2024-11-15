import React, { useState } from "react";
import { IConversation } from "../utils/interfaces";
import MessageModal from "./MessageModal";
import { IconButton } from "@mui/material";
import {Chat, MarkUnreadChatAlt} from "@mui/icons-material";


interface Props {
    userId?: number;
    conversation: IConversation;
    isComponentLoading: boolean;
    setComponentLoading: (arg: boolean) => void;
    setConversations: (arg: IConversation[]) => void;
    isUserPage? : boolean
}

const Conversation: React.FC<Props> = ({ userId, conversation, isComponentLoading, setComponentLoading, setConversations, isUserPage }) => {
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
                isComponentLoading={isComponentLoading}
                setComponentLoading={setComponentLoading}
                closeModal={onCloseModal}
                setConversations={setConversations}
                isUserPage = {isUserPage}
            />
            <IconButton onClick={() => setMessageModalOpen(true)} disabled={isComponentLoading}>
                {conversation.unread > 0 ? <MarkUnreadChatAlt /> : <Chat />}
            </IconButton>
            &nbsp;
        </span>
    );
};

export default Conversation;
