import { IMessage } from "../utils/interfaces";
import { useState } from "react";
import axios from "axios";
import { serverURL } from "../utils/serverURL";
import { format } from "date-fns";
import EditMessage from "./EditMessage";
import { handleErrors } from "../utils/handleErrors";
import { CircularProgress, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";

interface Props {
    userId?: number;
    message: IMessage;
    setErrors: (arg: string[]) => void;
    setMessages: (arg: IMessage[]) => void;
    isComponentLoading: boolean;
    setComponentLoading: (arg: boolean) => void;
}

const Message: React.FC<Props> = ({ userId, message, setErrors, setMessages, isComponentLoading, setComponentLoading }) => {
    const [isMessageLoading, setMessageLoading] = useState<boolean>(false);

    return (
        <div style={{ display: "flex", justifyContent: message.senderId === userId ? "left" : "right" }}>
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
            <span>{!message.isRead && message.recipientId == userId ? 'New!' : null}</span>
            {userId === message.senderId ? (
                isMessageLoading ? (
                    <CircularProgress />
                ) : (
                    <IconButton
                        disabled={isComponentLoading}
                        onClick={async () => {
                            setMessageLoading(true);
                            setComponentLoading(true);
                            await axios
                                .delete(`${serverURL}/messages/${message.recipientId}/message/${message.id}`, {
                                    withCredentials: true,
                                })
                                .then((res: { data: IMessage[] }) => {
                                    setMessages(res.data);
                                })
                                .catch((error: unknown) => {
                                    handleErrors(error, 'deleting the message', setErrors)
                                });
                            setMessageLoading(false);
                            setComponentLoading(false);
                        }}
                    >
                        <Delete/>
                    </IconButton>
                )
            ) : null}
        </div>
    );
};

export default Message;
