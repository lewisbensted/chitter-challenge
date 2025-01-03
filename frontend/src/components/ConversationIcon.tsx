import React, { Fragment, useState } from "react";
import { IConversation } from "../utils/interfaces";
import MessageModal from "./MessageModal";
import IconButton from "@mui/material/IconButton/IconButton";
import Chat from "@mui/icons-material/Chat";
import MarkUnreadChatAlt from "@mui/icons-material/MarkUnreadChatAlt";

interface Props {
    userId?: string;
    conversation: IConversation;
    isComponentLoading: boolean;
    setComponentLoading: (arg: boolean) => void;
    setConversations: (arg: IConversation[]) => void;
    isUserPage?: boolean;
    reloadTrigger: boolean;
    toggleReloadTrigger: (arg: boolean) => void;
}

const ConversationIcon: React.FC<Props> = ({
    userId,
    conversation,
    isComponentLoading,
    setComponentLoading,
    setConversations,
    reloadTrigger,
    toggleReloadTrigger,
}) => {
    const [messageModalOpen, setMessageModalOpen] = useState<boolean>(false);
    const [reloadWhenClosed, setReloadWhenClosed] = useState<boolean>(false);

    return (
        <Fragment>
            <MessageModal
                userId={userId}
                interlocutorId={conversation.interlocutorId}
                isOpen={messageModalOpen}
                isComponentLoading={isComponentLoading}
                setComponentLoading={setComponentLoading}
                closeModal={() => {
                    setMessageModalOpen(false);
                    if (reloadWhenClosed) {
                        toggleReloadTrigger(!reloadTrigger);
                        setReloadWhenClosed(false);
                    }
                }}
                setConversations={setConversations}
                reloadTrigger={reloadTrigger}
                toggleReloadTrigger={toggleReloadTrigger}
                setReloadWhenClosed={setReloadWhenClosed}
                unread={conversation.unread}
            />
            <IconButton onClick={() => setMessageModalOpen(true)} disabled={isComponentLoading} color="primary">
                {conversation.unread > 0 ? <MarkUnreadChatAlt /> : <Chat />}
            </IconButton>
        </Fragment>
    );
};

export default ConversationIcon;
