import React, { useEffect, useState } from "react";
import { IConversation, IMessage } from "../utils/interfaces";
import axios from "axios";
import { serverURL } from "../utils/serverURL";
import Message from "./Message";
import ErrorModal from "./ErrorModal";
import SendMessage from "./SendMessage";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Close from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";

interface Props {
    userId?: string;
    interlocutorId: string;
    isOpen: boolean;
    isComponentLoading: boolean;
    closeModal: () => void;
    setComponentLoading: (arg: boolean) => void;
    setConversations: (arg: IConversation[]) => void;
    reloadTrigger: boolean;
    toggleReloadTrigger: (arg: boolean) => void;
}

const MessageModal: React.FC<Props> = ({
    userId,
    interlocutorId,
    isOpen,
    isComponentLoading,
    closeModal,
    setComponentLoading,
    reloadTrigger,
    toggleReloadTrigger,
}) => {
    const [errors, setErrors] = useState<string[]>([]);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [messagesError, setMessagesError] = useState<string>("");
    const [isMessagesLoading, setMessagesLoading] = useState<boolean>(true);

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
                    toggleReloadTrigger(!reloadTrigger);
                })
                .catch(() => {
                    setMessagesError("An unexpected error occured while loading messages.");
                    setMessagesLoading(false);
                    setComponentLoading(false);
                });
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen}>
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
            <IconButton onClick={closeModal} disabled={isComponentLoading}>
                <Close />
            </IconButton>
        </Dialog>
    );
};

export default MessageModal;
