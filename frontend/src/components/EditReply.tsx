import axios from "axios";
import React, { useState } from "react";
import { IReply } from "../utils/interfaces";
import { SubmitHandler, useForm } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import { serverURL } from "../utils/serverURL";

interface Props {
    isDisabled: boolean;
    setLoading: (arg: boolean) => void;
    setReplies: (arg: IReply[]) => void;
    setErrors: (arg: string[]) => void;
    reply: IReply;
    cheetId: number;
    userId?: number;
}

const EditReply: React.FC<Props> = ({ reply, cheetId, isDisabled, setLoading, setReplies, setErrors, userId }) => {
    const { register, handleSubmit } = useForm<{ text: string }>();
    const [isEditing, setEditing] = useState<boolean>(false);
    const [isReplyLoading, setReplyLoading] = useState<boolean>(false);

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setReplyLoading(true);
        setLoading(true);
        await axios
            .put(`${serverURL}/cheets/${cheetId}/replies/${reply.id}`, data, {
                withCredentials: true,
            })
            .then((res: { data: IReply[] }) => {
                setReplies(res.data);
            })
            .catch((error: unknown) => {
                axios.isAxiosError(error) && [400, 401, 403].includes(error.response?.status!)
                    ? setErrors(error.response?.data)
                    : setErrors(["An unexpected error occured while editing reply."]);
            });
        setReplyLoading(false);
        setLoading(false);
        setEditing(false);
    };

    return (
        <span>
            {userId === reply.userId ? (
                isEditing ? (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <input {...register("text")} type="text" defaultValue={reply.text} />
                        {isReplyLoading ? <ClipLoader /> : <input disabled={isDisabled} type="submit" />}
                    </form>
                ) : (
                    <span>
                        {reply.text} &nbsp;
                        <button onClick={() => setEditing(true)}>EDIT</button> &nbsp;
                    </span>
                )
            ) : (
                <span>{reply.text}&nbsp;</span>
            )}
        </span>
    );
};

export default EditReply;
