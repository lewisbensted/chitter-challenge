import React, { useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { IReply } from "../utils/interfaces";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Reply from "@mui/icons-material/Reply";

interface Props {
    cheetId: string;
    isDisabled: boolean;
    setReplies: (arg: IReply[]) => void;
    setErrors: (arg: string[]) => void;
    setComponentLoading: (arg: boolean) => void;
}

const SendReply: React.FC<Props> = ({ cheetId, isDisabled, setReplies, setErrors, setComponentLoading }) => {
    const { register, handleSubmit, reset } = useForm<{ text: string }>();
    const [isSubmitLoading, setSubmitLoading] = useState<boolean>();

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setSubmitLoading(true);
        setComponentLoading(true);
        reset();
        await axios
            .post(`${serverURL}/cheets/${cheetId}/replies`, data, {
                withCredentials: true,
            })
            .then((res: { data: IReply[] }) => {
                setReplies(res.data);
            })
            .catch((error: unknown) => {
                handleErrors(error, "sending the reply", setErrors);
            });
        setSubmitLoading(false);
        setComponentLoading(false);
    };
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                Send a Reply: &nbsp;
                <input {...register("text")} type="text" /> &nbsp;
                {isSubmitLoading ? (
                    <CircularProgress />
                ) : (
                    <IconButton type="submit" disabled={isDisabled}>
                        <Reply />
                    </IconButton>
                )}
            </form>
        </div>
    );
};

export default SendReply;
