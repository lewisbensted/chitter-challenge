import { Link } from "react-router-dom";
import { IMessage } from "../utils/interfaces";
import { ClipLoader } from "react-spinners";
import { useState } from "react";
import axios from "axios";
import { serverURL } from "../utils/serverURL";
import { format } from "date-fns";
import EditMessage from "./EditMessage";

interface Props {
    userId?: number;
    message: IMessage;
    setErrors: (arg: string[]) => void;
    setMessages: (arg: IMessage[]) => void;
    isLoading: boolean;
    setLoading: (arg: boolean) => void;
}

const Message: React.FC<Props> = ({ userId, message, setErrors, setMessages, isLoading, setLoading }) => {
    const [isMessageLoading, setMessageLoading] = useState<boolean>(false);

    return (
        <div style={{ display: "flex", justifyContent: message.senderId === userId ? "left" : "right" }}>
            <EditMessage
                message={message}
                isDisabled={isLoading}
                setLoading={setLoading}
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
                    <ClipLoader />
                ) : (
                    <button
                        disabled={isLoading}
                        onClick={async () => {
                            setMessageLoading(true);
                            setLoading(true);
                            await axios
                                .delete(`${serverURL}/messages/${message.recipientId}/message/${message.id}`, {
                                    withCredentials: true,
                                })
                                .then((res: { data: IMessage[] }) => {
                                    setMessages(res.data);
                                })
                                .catch((error: unknown) => {
                                    axios.isAxiosError(error) && [401, 403].includes(error.response?.status!)
                                        ? setErrors(error.response?.data)
                                        : setErrors(["An unexpected error occured while deleting message."]);
                                });
                            setMessageLoading(false);
                            setLoading(false);
                        }}
                    >
                        DELETE
                    </button>
                )
            ) : null}
        </div>
    );
};

export default Message;
