import React, { useState } from "react";
import { ICheet } from "../utils/interfaces";
import axios from "axios";
import { format } from "date-fns";
import CheetModal from "./CheetModal";
import { Link, useParams } from "react-router-dom";
import { serverURL } from "../utils/serverURL";
import { ClipLoader } from "react-spinners";
import EditCheet from "./EditCheet";
import { handleErrors } from "../utils/handleErrors";

interface Props {
    userId?: number;
    cheet: ICheet;
    setErrors: (arg: string[]) => void;
    setCheets: (arg: ICheet[]) => void;
    isComponentLoading: boolean;
    setComponentLoading: (arg: boolean) => void;
    isModalView: boolean;
}

const Cheet: React.FC<Props> = ({ userId, cheet, setErrors, setCheets, setComponentLoading, isComponentLoading, isModalView }) => {
    const { id } = useParams();
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [isCheetLoading, setCheetLoading] = useState<boolean>(false);

    return (
        <div>
            <CheetModal
                cheet={cheet}
                userId={userId}
                isOpen={isModalOpen}
                closeModal={() => {
                    setModalOpen(false);
                }}
                setCheets={setCheets}
                isComponentLoading={isComponentLoading}
                setComponentLoading={setComponentLoading}
            />
            <Link to={`/users/${cheet.userId}`}>{cheet.username}</Link> &nbsp;
            <EditCheet
                cheet={cheet}
                isDisabled={isComponentLoading}
                setComponentLoading={setComponentLoading}
                setCheets={setCheets}
                setErrors={setErrors}
                userId={userId}
            />
            &nbsp;
            <span>{format(cheet.createdAt, "HH:mm dd/MM/yy")}</span> &nbsp;
            {new Date(cheet.updatedAt) > new Date(cheet.createdAt) ? (
                <span>{`Edited at ${(format(cheet.updatedAt, "HH:mm dd/MM/yy"))}`} &nbsp;</span>
            ) : null}
            {isModalView ? null : <button onClick={() => setModalOpen(true)} disabled={isComponentLoading}>MORE</button>} &nbsp;
            {userId === cheet.userId ? (
                isCheetLoading ? (
                    <ClipLoader />
                ) : (
                    <button
                        disabled={isComponentLoading}
                        onClick={async () => {
                            setCheetLoading(true);
                            setComponentLoading(true);
                            await axios
                                .delete(`${serverURL + (id ? `/users/${id}/` : "/")}cheets/${cheet.id}`, {
                                    withCredentials: true,
                                })
                                .then((res: { data: ICheet[] }) => {
                                    setCheets(res.data);
                                })
                                .catch((error: unknown) => {
                                    handleErrors(error, 'editing the message', setErrors)
                                });
                            setCheetLoading(false);
                            setComponentLoading(false);
                        }}
                    >
                        DELETE
                    </button>
                )
            ) : null}
        </div>
    );
};

export default Cheet;
