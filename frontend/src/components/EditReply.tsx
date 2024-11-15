import axios from "axios";
import React, { useState } from "react";
import { IReply } from "../utils/interfaces";
import { SubmitHandler, useForm } from "react-hook-form";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import { CircularProgress, IconButton } from "@mui/material";
import { Edit } from "@mui/icons-material";

interface Props {
    isDisabled: boolean;
    setComponentLoading: (arg: boolean) => void;
    setReplies: (arg: IReply[]) => void;
    setErrors: (arg: string[]) => void;
    reply: IReply;
    cheetId: number;
    userId?: number;
}

const EditReply: React.FC<Props> = ({
    reply,
    cheetId,
    isDisabled,
    setComponentLoading,
    setReplies,
    setErrors,
    userId,
}) => {
    const { register, handleSubmit } = useForm<{ text: string }>();
    const [isEditing, setEditing] = useState<boolean>(false);
    const [isReplyLoading, setReplyLoading] = useState<boolean>(false);

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setReplyLoading(true);
        setComponentLoading(true);
        await axios
            .put(`${serverURL}/cheets/${cheetId}/replies/${reply.id}`, data, {
                withCredentials: true,
            })
            .then((res: { data: IReply[] }) => {
                setReplies(res.data);
            })
            .catch((error: unknown) => {
                handleErrors(error, "editing the reply", setErrors);
            });
        setReplyLoading(false);
        setComponentLoading(false);
        setEditing(false);
    };

    return (
        <span>
            {userId === reply.userId ? (
                isEditing ? (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <input {...register("text")} type="text" defaultValue={reply.text} />
                        {isReplyLoading ? <CircularProgress /> : <input disabled={isDisabled} type="submit" />}
                    </form>
                ) : (
                    <span>
                        {reply.text} &nbsp;
                        <IconButton>
                            <Edit onClick={() => setEditing(true)} />
                        </IconButton>
                    </span>
                )
            ) : (
                <span>{reply.text}&nbsp;</span>
            )}
        </span>
    );
};

export default EditReply;
