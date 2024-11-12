import React, { useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { ICheet } from "../utils/interfaces";
import { useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";

interface Props {
    isDisabled: boolean;
    setCheets: (arg: ICheet[]) => void;
    setCheetsError: (arg: string) => void;
    setErrors: (arg: string[]) => void;
    setComponentLoading: (arg: boolean) => void;
}

const SubmitCheet: React.FC<Props> = ({ isDisabled, setCheets, setCheetsError, setErrors, setComponentLoading }) => {
    const { id } = useParams();
    const { register, handleSubmit, reset } = useForm<{ text: string }>();
    const [isSubmitLoading, setSubmitLoading] = useState<boolean>();

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setSubmitLoading(true);
        setComponentLoading(true);
        reset();
        await axios
            .post(`${serverURL + (id ? `/users/${id}/` : "/")}cheets`, data, {
                withCredentials: true,
            })
            .then((res: { data: ICheet[] }) => {
                setCheets(res.data);
                setCheetsError("");
            })
            .catch((error: unknown) => {
                handleErrors(error, 'sending cheet', setErrors)
            });
        setSubmitLoading(false);
        setComponentLoading(false);
    };
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                Send a Cheet: &nbsp;
                <input {...register("text")} type="text" /> &nbsp;
                {isSubmitLoading ? <ClipLoader /> : <input disabled={isDisabled} type="submit" />}
            </form>
        </div>
    );
};

export default SubmitCheet;
