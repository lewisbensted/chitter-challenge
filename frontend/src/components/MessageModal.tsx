import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import { IConversation, IMessage } from "../utils/interfaces";
import axios from "axios";
import { serverURL } from "../utils/serverURL";
import { ClipLoader } from "react-spinners";
import Message from "./Message";
import ErrorModal from "./ErrorModal";
import SendMessage from "./SendMessage";

interface Props {
    userId?: number;
    interlocutorId: number;
    isOpen: boolean;
    isLoading: boolean;
    closeModal: (conversations: IConversation[]) => void;
    setLoading: (arg: boolean) => void;
    setConversations: (arg: IConversation[]) => void;
    isUserPage?: boolean;
}

const MessageModal: React.FC<Props> = ({
    userId,
    interlocutorId,
    isOpen,
    isLoading,
    closeModal,
    setLoading,
    isUserPage,
}) => {
    const [errors, setErrors] = useState<string[]>([]);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [messagesError, setMessagesError] = useState<string>("");
    const [isMessagesLoading, setMessagesLoading] = useState<boolean>(true);
    const [updatedConversations, setUpdatedConversations] = useState<IConversation[]>([]);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            axios
                .get(`${serverURL}/messages/${interlocutorId}`, {
                    withCredentials: true,
                })
                .then((res: { data: IMessage[] }) => {
                    setMessages(res.data);
                    setMessagesLoading(false);
                })
                .catch(() => {
                    setMessagesError("An unexpected error occured while loading messages.");
                    setLoading(false);
                    setMessagesLoading(false);
                });
        }
    }, [isOpen]);

    useEffect(() => {
        axios
            .get(`${serverURL}/conversations/${isUserPage ? interlocutorId : ""}`, {
                withCredentials: true,
            })
            .then((res: { data: IConversation[] }) => {
                console.log(res.data);
                setUpdatedConversations(res.data);
                setLoading(false);
            })
            .catch(() => {
                setMessagesError("An unexpected error occured while loading messages.");
                setLoading(false);
            });
    }, [messages]);

    return (
        <Modal isOpen={isOpen} ariaHideApp={false}>
            <ErrorModal errors={errors} closeModal={() => setErrors([])} />

            <div>
                {isMessagesLoading ? (
                    <ClipLoader />
                ) : messagesError ? (
                    messagesError
                ) : (
                    messages.map((message, key) => (
                        <Message
                            key={key}
                            userId={userId}
                            message={message}
                            setMessages={setMessages}
                            isLoading={isLoading}
                            setLoading={setLoading}
                            setErrors={setErrors}
                        />
                    ))
                )}
            </div>
            <SendMessage
                recipientId={interlocutorId}
                isDisabled={isLoading || isMessagesLoading}
                setMessages={setMessages}
                setErrors={setErrors}
                setLoading={setLoading}
            />
            <button onClick={() => closeModal(updatedConversations)} disabled={isLoading || isMessagesLoading}>
                Close Modal
            </button>
        </Modal>
    );
};

export default MessageModal;
