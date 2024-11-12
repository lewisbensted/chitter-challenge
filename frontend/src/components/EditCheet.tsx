import React, { useState } from "react";
import axios from "axios";
import { ICheet } from "../utils/interfaces";
import { SubmitHandler, useForm } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";

interface Props {
    cheet: ICheet;
    isDisabled: boolean;
    setComponentLoading: (arg: boolean) => void;
    setCheets: (arg: ICheet[]) => void;
    setErrors: (arg: string[]) => void;
    userId?: number;
}

const EditCheet: React.FC<Props> = ({ cheet, isDisabled, setComponentLoading, setCheets, setErrors, userId }) => {
    const { id } = useParams();
    const { register, handleSubmit } = useForm<{ text: string }>();
    const [isEditing, setEditing] = useState<boolean>(false);
    const [isCheetLoading, setCheetLoading] = useState<boolean>();

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setCheetLoading(true);
        setComponentLoading(true);
        await axios
            .put(`${serverURL + (id ? `/users/${id}/` : "/")}cheets/${cheet.id}`, data, {
                withCredentials: true,
            })
            .then((res: { data: ICheet[] }) => {
                setCheets(res.data);
            })
            .catch((error: unknown) => {
                handleErrors(error, "editing the cheet", setErrors);
            });
        setEditing(false);
        setCheetLoading(false);
        setComponentLoading(false);
    };
    return (
        <span>
            {userId === cheet.userId ? (
                isEditing ? (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <input {...register("text")} type="text" defaultValue={cheet.text} />
                        {isCheetLoading ? <ClipLoader /> : <input disabled={isDisabled} type="submit" />}
                    </form>
                ) : (
                    <span>
                        {cheet.text} &nbsp;
                        <button onClick={() => setEditing(true)}>EDIT</button>
                    </span>
                )
            ) : (
                <span>{cheet.text}&nbsp;</span>
            )}
        </span>
    );
};

export default EditCheet;
