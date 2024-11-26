import { IMessage } from "../utils/interfaces";
import { useState } from "react";
import axios from "axios";
import { serverURL } from "../utils/serverURL";
import { format } from "date-fns";
import EditMessage from "./EditMessage";
import { handleErrors } from "../utils/handleErrors";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Delete from "@mui/icons-material/Delete";

interface Props {
    userId?: string;
    message: IMessage;
    setErrors: (arg: string[]) => void;
    setMessages: (arg: IMessage[]) => void;
    isComponentLoading: boolean;
    setComponentLoading: (arg: boolean) => void;
    setReloadWhenClosed: (arg: boolean) => void;
}

const Message: React.FC<Props> = ({
    userId,
    message,
    setErrors,
    setMessages,
    isComponentLoading,
    setComponentLoading,
    setReloadWhenClosed,
}) => {
    const [isMessageLoading, setMessageLoading] = useState<boolean>(false);

    return (
        <div style={{ display: "flex", justifyContent: message.sender.uuid === userId ? "left" : "right" }}>
            <EditMessage
                message={message}
                isDisabled={isComponentLoading}
                setComponentLoading={setComponentLoading}
                setMessages={setMessages}
                setErrors={setErrors}
                userId={userId}
            />
            &nbsp;
            <span>{format(message.createdAt, "HH:mm dd/MM/yy")}&nbsp;</span>
            {new Date(message.updatedAt) > new Date(message.createdAt) ? (
                <span>{`Edited at ${format(message.updatedAt, "HH:mm dd/MM/yy")}`} &nbsp;</span>
            ) : null}
            <span>{!message.isRead && message.recipient.uuid == userId ? "New!" : null}</span>
            {userId === message.sender.uuid ? (
                isMessageLoading ? (
                    <CircularProgress />
                ) : (
                    <IconButton
                        disabled={isComponentLoading}
                        onClick={async () => {
                            setMessageLoading(true);
                            setComponentLoading(true);
                            await axios
                                .delete(`${serverURL}/messages/${message.recipient.uuid}/message/${message.uuid}`, {
                                    withCredentials: true,
                                })
                                .then((res: { data: IMessage[] }) => {
                                    setMessages(res.data);
                                    setReloadWhenClosed(true);
                                })
                                .catch((error: unknown) => {
                                    handleErrors(error, "deleting the message", setErrors);
                                });
                            setMessageLoading(false);
                            setComponentLoading(false);
                        }}
                    >
                        <Delete />
                    </IconButton>
                )
            ) : null}
        </div>
    );
};

export default Message;
