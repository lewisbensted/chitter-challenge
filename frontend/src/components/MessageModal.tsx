import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { IConversation, IMessage } from "../utils/interfaces";
import axios from "axios";
import { serverURL } from "../utils/serverURL";
import Message from "./Message";
import ErrorModal from "./ErrorModal";
import SendMessage from "./SendMessage";
import { CircularProgress, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

interface Props {
    userId?: number;
    interlocutorId: number;
    isOpen: boolean;
    isComponentLoading: boolean;
    closeModal: (conversations: IConversation[]) => void;
    setComponentLoading: (arg: boolean) => void;
    setConversations: (arg: IConversation[]) => void;
    isUserPage?: boolean;
}

const MessageModal: React.FC<Props> = ({
    userId,
    interlocutorId,
    isOpen,
    isComponentLoading,
    closeModal,
    setComponentLoading,
    isUserPage,
}) => {
    const [errors, setErrors] = useState<string[]>([]);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [messagesError, setMessagesError] = useState<string>("");
    const [isMessagesLoading, setMessagesLoading] = useState<boolean>(true);
    const [updatedConversations, setUpdatedConversations] = useState<IConversation[]>([]);

    useEffect(() => {
        if (isOpen) {
            setComponentLoading(true);
            axios
                .get(`${serverURL}/messages/${interlocutorId}`, {
                    withCredentials: true,
                })
                .then((res: { data: IMessage[] }) => {
                    setMessages(res.data);
                    setMessagesLoading(false);
                    setComponentLoading(false);
                })
                .catch(() => {
                    setMessagesError("An unexpected error occured while loading messages.");
                    setMessagesLoading(false);
                    setComponentLoading(false);
                });
        }
    }, [isOpen]);

    useEffect(() => {
        axios
            .get(`${serverURL}/conversations/${isUserPage ? interlocutorId : ""}`, {
                withCredentials: true,
            })
            .then((res: { data: IConversation[] }) => {
                setUpdatedConversations(res.data);
                setComponentLoading(false);
            })
            .catch(() => {
                setMessagesError("An unexpected error occured while loading messages.");
                setComponentLoading(false);
            });
    }, [messages]);

    return (
        <Modal isOpen={isOpen} ariaHideApp={false}>
            <ErrorModal errors={errors} closeModal={() => setErrors([])} />
            <div>
                {isMessagesLoading ? (
                    <CircularProgress />
                ) : messagesError ? (
                    messagesError
                ) : (
                    messages.map((message, key) => (
                        <Message
                            key={key}
                            userId={userId}
                            message={message}
                            setMessages={setMessages}
                            isComponentLoading={isComponentLoading}
                            setComponentLoading={setComponentLoading}
                            setErrors={setErrors}
                        />
                    ))
                )}
            </div>
            <SendMessage
                recipientId={interlocutorId}
                isDisabled={isComponentLoading}
                setMessages={setMessages}
                setErrors={setErrors}
                setComponentLoading={setComponentLoading}
            />
            <IconButton onClick={() => closeModal(updatedConversations)} disabled={isComponentLoading}>
                <Close />
            </IconButton>
        </Modal>
    );
};

export default MessageModal;
