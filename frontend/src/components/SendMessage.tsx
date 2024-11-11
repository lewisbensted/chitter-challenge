import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { IMessage } from "../utils/interfaces";
import axios from "axios";
import { serverURL } from "../utils/serverURL";
import { ClipLoader } from "react-spinners";

interface Props {
    recipientId: number;
    isDisabled: boolean;
    setMessages: (arg: IMessage[]) => void;
    setErrors: (arg: string[]) => void;
    setLoading: (arg: boolean) => void;
}

const SendMessage: React.FC<Props> = ({ recipientId, isDisabled, setMessages, setErrors, setLoading }) => {
    const { register, handleSubmit, reset } = useForm<{ text: string }>();
    const [isSubmitLoading, setSubmitLoading] = useState<boolean>();

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setSubmitLoading(true);
        setLoading(true);
        reset();
        await axios
            .post(`${serverURL}/messages/${recipientId}`, data, {
                withCredentials: true,
            })
            .then((res: { data: IMessage[] }) => {
                setMessages(res.data);
            })
            .catch((error: unknown) => {
                axios.isAxiosError(error) && [400, 401].includes(error.response?.status!)
                    ? setErrors(error.response?.data)
                    : setErrors(["An unexpected error occured while sending message."]);
            });
        setSubmitLoading(false);
        setLoading(false);
    };
    
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                Send a Message: &nbsp;
                <input {...register("text")} type="text" /> &nbsp;
                {isSubmitLoading ? <ClipLoader /> : <input disabled={isDisabled} type="submit" />}
            </form>
        </div>
    );
};

export default SendMessage;
