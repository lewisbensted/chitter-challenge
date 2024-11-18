import React, { useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { IMessage } from "../utils/interfaces";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Edit from "@mui/icons-material/Edit";

interface Props {
    message: IMessage;
    isDisabled: boolean;
    setComponentLoading: (arg: boolean) => void;
    setMessages: (arg: IMessage[]) => void;
    setErrors: (arg: string[]) => void;
    userId?: number;
}

const EditMessage: React.FC<Props> = ({ message, isDisabled, setComponentLoading, setMessages, setErrors, userId }) => {
    const { register, handleSubmit } = useForm<{ text: string }>();
    const [isEditing, setEditing] = useState<boolean>(false);
    const [isMessageLoading, setMessageLoading] = useState<boolean>();

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setMessageLoading(true);
        setComponentLoading(true);
        await axios
            .put(`${serverURL}/messages/${message.recipientId}/message/${message.id}`, data, {
                withCredentials: true,
            })
            .then((res: { data: IMessage[] }) => {
                setMessages(res.data);
            })
            .catch((error: unknown) => {
                handleErrors(error, "editing the message", setErrors);
            });
        setEditing(false);
        setMessageLoading(false);
        setComponentLoading(false);
    };
    return (
        <div>
            {userId === message.senderId ? (
                isEditing ? (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <input {...register("text")} type="text" defaultValue={message.text} />
                        {isMessageLoading ? <CircularProgress /> : <input disabled={isDisabled} type="submit" />}
                    </form>
                ) : (
                    <span>
                        {message.text} &nbsp;
                        <IconButton onClick={() => setEditing(true)}>
                            <Edit />
                        </IconButton>
                    </span>
                )
            ) : (
                <span>{message.text}&nbsp;</span>
            )}
        </div>
    );
};

export default EditMessage;
