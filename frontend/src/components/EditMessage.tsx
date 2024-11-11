import React, { useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { IMessage } from "../utils/interfaces";
import { serverURL } from "../utils/serverURL";
import { ClipLoader } from "react-spinners";

interface Props {
    message: IMessage;
    isDisabled: boolean;
    setLoading: (arg: boolean) => void;
    setMessages: (arg: IMessage[]) => void;
    setErrors: (arg: string[]) => void;
    userId?: number;
}

const EditMessage: React.FC<Props> = ({ message, isDisabled, setLoading, setMessages, setErrors, userId }) => {
    const { register, handleSubmit } = useForm<{ text: string }>();
    const [isEditing, setEditing] = useState<boolean>(false);
    const [isMessageLoading, setMessageLoading] = useState<boolean>();

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setMessageLoading(true);
        setLoading(true);
        await axios
            .put(`${serverURL}/messages/${message.recipientId}/message/${message.id}`, data, {
                withCredentials: true,
            })
            .then((res: { data: IMessage[] }) => {
                setMessages(res.data);
            })
            .catch((error: unknown) => {
                axios.isAxiosError(error) && [400, 401, 403].includes(error.response?.status!)
                    ? setErrors(error.response?.data)
                    : setErrors(["An unexpected error occured while editing message."]);
            });
        setEditing(false);
        setMessageLoading(false);
        setLoading(false);
    };
    return (
        <div>
            {userId === message.senderId ? (
                isEditing ? (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <input {...register("text")} type="text" defaultValue={message.text} />
                        {isMessageLoading ? <ClipLoader /> : <input disabled={isDisabled} type="submit" />}
                    </form>
                ) : (
                    <span>
                        {message.text} &nbsp;
                        <button onClick={() => setEditing(true)}>EDIT</button>
                    </span>
                )
            ) : (
                <span>{message.text}&nbsp;</span>
            )}
        </div>
    );
};

export default EditMessage;
