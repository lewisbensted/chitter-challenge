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
import { Box, Grid2, ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import IconBox from "../styles/IconBox";
import FlexBox from "../styles/FlexBox";

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
    setReloadWhenClosed: (arg: boolean) => void;
    unread: number;
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
    setReloadWhenClosed,
    unread,
}) => {
    const [errors, setErrors] = useState<string[]>([]);
    const [messages, setMessages] = useState<IMessage[]>();
    const [messagesError, setMessagesError] = useState<string>();
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
                    if (unread > 0) {
                        toggleReloadTrigger(!reloadTrigger);
                    }
                })
                .catch(() => {
                    setMessagesError("An unexpected error occured while loading messages.");
                    setMessagesLoading(false);
                    setComponentLoading(false);
                });
        }
    }, [isOpen]);

    return (
        <ThemeProvider theme={theme}>
            <Dialog open={isOpen}>
                <ErrorModal errors={errors} closeModal={() => setErrors([])} />
                <Grid2 container marginInline={2} marginTop={1} minWidth={550}>
                    <Grid2 size={11}></Grid2>
                    <Grid2 size={1}>
                        <IconBox>
                            <IconButton onClick={closeModal} disabled={isComponentLoading} color="primary">
                                <Close />
                            </IconButton>
                        </IconBox>
                    </Grid2>
                    <Grid2 marginInline={3} size={12}>
                        {isMessagesLoading ? (
                            <FlexBox>
                                <CircularProgress thickness={5} />
                            </FlexBox>
                        ) : messagesError ? (
                            <FlexBox>{messagesError}</FlexBox>
                        ) : (
                            <Grid2 marginBlock={2}>
                                {messages!.map((message) => (
                                    <Message
                                        key={message.uuid}
                                        userId={userId}
                                        message={message}
                                        setMessages={setMessages}
                                        isComponentLoading={isComponentLoading}
                                        setComponentLoading={setComponentLoading}
                                        setErrors={setErrors}
                                        setReloadWhenClosed={setReloadWhenClosed}
                                    />
                                ))}
                            </Grid2>
                        )}
                        <SendMessage
                            recipientId={interlocutorId}
                            isDisabled={isComponentLoading}
                            setMessages={setMessages}
                            setErrors={setErrors}
                            setComponentLoading={setComponentLoading}
                            setReloadWhenClosed={setReloadWhenClosed}
                        />
                    </Grid2>
                </Grid2>
            </Dialog>
        </ThemeProvider>
    );
};

export default MessageModal;
