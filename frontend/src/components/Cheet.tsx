import React, { useState } from "react";
import { ICheet } from "../utils/interfaces";
import axios from "axios";
import { format } from "date-fns";
import CheetModal from "./CheetModal";
import { Link, useParams } from "react-router-dom";
import { serverURL } from "../utils/serverURL";
import { ClipLoader } from "react-spinners";
import EditCheet from "./EditCheet";

interface Props {
    userId?: number;
    cheet: ICheet;
    setErrors: (arg: string[]) => void;
    setCheets: (arg: ICheet[]) => void;
    isLoading: boolean;
    setLoading: (arg: boolean) => void;
    isModalView: boolean;
}

const Cheet: React.FC<Props> = ({ userId, cheet, setErrors, setCheets, setLoading, isLoading, isModalView }) => {
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
                isLoading={isLoading}
                setLoading={setLoading}
            />
            <Link to={`/users/${cheet.userId}`}>{cheet.username}</Link> &nbsp;
            <EditCheet
                cheet={cheet}
                isDisabled={isLoading}
                setLoading={setLoading}
                setCheets={setCheets}
                setErrors={setErrors}
                userId={userId}
            />
            &nbsp;
            <span>{format(cheet.createdAt, "HH:mm dd/MM/yy")}</span> &nbsp;
            {new Date(cheet.updatedAt) > new Date(cheet.createdAt) ? (
                <span>{`Edited at ${(format(cheet.updatedAt, "HH:mm dd/MM/yy"))}`} &nbsp;</span>
            ) : null}
            {isModalView ? null : <button onClick={() => setModalOpen(true)}>MORE</button>} &nbsp;
            {userId === cheet.userId ? (
                isCheetLoading ? (
                    <ClipLoader />
                ) : (
                    <button
                        disabled={isLoading}
                        onClick={async () => {
                            setCheetLoading(true);
                            setLoading(true);
                            await axios
                                .delete(`${serverURL + (id ? `/users/${id}/` : "/")}cheets/${cheet.id}`, {
                                    withCredentials: true,
                                })
                                .then((res: { data: ICheet[] }) => {
                                    setCheets(res.data);
                                })
                                .catch((error: unknown) => {
                                    axios.isAxiosError(error) && [401, 403].includes(error.response?.status!)
                                        ? setErrors(error.response?.data)
                                        : setErrors(["An unexpected error occured while deleting cheet."]);
                                });
                            setCheetLoading(false);
                            setLoading(false);
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
