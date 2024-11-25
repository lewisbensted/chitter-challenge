import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { IMessage } from "../utils/interfaces";
import axios from "axios";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Send from "@mui/icons-material/Send";

interface Props {
    recipientId: string;
    isDisabled: boolean;
    setMessages: (arg: IMessage[]) => void;
    setErrors: (arg: string[]) => void;
    setComponentLoading: (arg: boolean) => void;
}

const SendMessage: React.FC<Props> = ({ recipientId, isDisabled, setMessages, setErrors, setComponentLoading }) => {
    const { register, handleSubmit, reset } = useForm<{ text: string }>();
    const [isSubmitLoading, setSubmitLoading] = useState<boolean>(false);

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setSubmitLoading(true);
        setComponentLoading(true);
        reset();
        await axios
            .post(`${serverURL}/messages/${recipientId}`, data, {
                withCredentials: true,
            })
            .then((res: { data: IMessage[] }) => {
                setMessages(res.data);
            })
            .catch((error: unknown) => {
                handleErrors(error, "sending message", setErrors);
            });
        setSubmitLoading(false);
        setComponentLoading(false);
    };

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                Send a Message: &nbsp;
                <input {...register("text")} type="text" /> &nbsp;
                {isSubmitLoading ? (
                    <CircularProgress />
                ) : (
                    <IconButton type="submit" disabled={isDisabled}>
                        <Send />
                    </IconButton>
                )}
            </form>
        </div>
    );
};

export default SendMessage;
