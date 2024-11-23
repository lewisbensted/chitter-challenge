import React, { useState } from "react";
import { ICheet } from "../utils/interfaces";
import axios from "axios";
import { format } from "date-fns";
import CheetModal from "./CheetModal";
import { Link, useParams } from "react-router-dom";
import { serverURL } from "../utils/serverURL";
import EditCheet from "./EditCheet";
import { handleErrors } from "../utils/handleErrors";
import IconButton from "@mui/material/IconButton/IconButton";
import OpenInNew from "@mui/icons-material/OpenInNew";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Delete from "@mui/icons-material/Delete";

interface Props {
    userId?: string;
    cheet: ICheet;
    setErrors: (arg: string[]) => void;
    setCheets: (arg: ICheet[]) => void;
    isComponentLoading: boolean;
    setComponentLoading: (arg: boolean) => void;
    isModalView: boolean;
    closeModal?: () => void;
}

const Cheet: React.FC<Props> = ({
    userId,
    cheet,
    setErrors,
    setCheets,
    setComponentLoading,
    isComponentLoading,
    isModalView,
}) => {
    const { id } = useParams();
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [isCheetLoading, setCheetLoading] = useState<boolean>(false);

    return (
        <div>
            {isModalView ? null : (
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
            )}
            <Link to={`/users/${cheet.user.uuid}`}>{cheet.user.username}</Link> &nbsp;
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
                <span>{`Edited at ${format(cheet.updatedAt, "HH:mm dd/MM/yy")}`} &nbsp;</span>
            ) : null}
            {isModalView ? null : (
                <IconButton onClick={() => setModalOpen(true)} disabled={isComponentLoading}>
                    <OpenInNew />
                </IconButton>
            )}
            &nbsp;
            {userId === cheet.user.uuid && !isModalView ? (
                isCheetLoading ? (
                    <CircularProgress />
                ) : (
                    <IconButton
                        onClick={async () => {
                            setCheetLoading(true);
                            setComponentLoading(true);
                            await axios
                                .delete(`${serverURL + (id ? `/users/${id}/` : "/")}cheets/${cheet.uuid}`, {
                                    withCredentials: true,
                                })
                                .then((res: { data: ICheet[] }) => {
                                    setCheets(res.data);
                                    setModalOpen(false)
                                })
                                .catch((error: unknown) => {
                                    handleErrors(error, "deleting the cheet", setErrors);
                                });
                            setCheetLoading(false);
                            setComponentLoading(false);
                        }}
                        disabled={isComponentLoading}
                    >
                        <Delete />
                    </IconButton>
                )
            ) : null}
        </div>
    );
};

export default Cheet;
