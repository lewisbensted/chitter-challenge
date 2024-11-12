import React, { useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { IReply } from "../utils/interfaces";
import { ClipLoader } from "react-spinners";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";

interface Props {
    cheetId: number;
    isDisabled: boolean;
    setReplies: (arg: IReply[]) => void;
    setErrors: (arg: string[]) => void;
    setComponentLoading: (arg: boolean) => void;
}

const SubmitReply: React.FC<Props> = ({ cheetId, isDisabled, setReplies, setErrors, setComponentLoading }) => {
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
                handleErrors(error, 'sending the reply', setErrors)
            });
        setSubmitLoading(false);
        setComponentLoading(false);
    };
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                Send a Reply: &nbsp;
                <input {...register("text")} type="text" /> &nbsp;
                {isSubmitLoading ? <ClipLoader /> : <input disabled={isDisabled} type="submit" />}
            </form>
        </div>
    );
};

export default SubmitReply;
