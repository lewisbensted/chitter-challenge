import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { ICheet, IReply } from "../utils/interfaces";
import axios from "axios";
import ErrorModal from "./ErrorModal";
import Reply from "./Reply";
import SubmitReply from "./SubmitReply";
import { serverURL } from "../utils/serverURL";
import Cheet from "./Cheet";
import { CircularProgress, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

interface Props {
    userId?: number;
    cheet: ICheet;
    isOpen: boolean;
    closeModal: () => void;
    setCheets: (arg: ICheet[]) => void;
    isComponentLoading: boolean;
    setComponentLoading: (arg: boolean) => void;
}

const CheetModal: React.FC<Props> = ({
    userId,
    cheet,
    isOpen,
    closeModal,
    setCheets,
    setComponentLoading,
    isComponentLoading,
}) => {
    const [errors, setErrors] = useState<string[]>([]);
    const [replies, setReplies] = useState<IReply[]>([]);
    const [repliesError, setRepliesError] = useState<string>("");
    const [isRepliesLoading, setRepliesLoading] = useState<boolean>(true);

    useEffect(() => {
        if (isOpen) {
            setComponentLoading(true);
            axios
                .get(`${serverURL}/cheets/${cheet.id}/replies`, {
                    withCredentials: true,
                })
                .then((res: { data: IReply[] }) => {
                    setReplies(res.data);
                    setRepliesLoading(false);
                    setComponentLoading(false);
                })
                .catch(() => {
                    setRepliesError("An unexpected error occured while loading replies.");
                    setRepliesLoading(false);
                    setComponentLoading(false);
                });
        }
    }, [isOpen]);

    return (
        <ReactModal isOpen={isOpen} ariaHideApp={false}>
            <ErrorModal errors={errors} closeModal={() => setErrors([])} />
            <Cheet
                cheet={cheet}
                userId={userId}
                setCheets={setCheets}
                setErrors={setErrors}
                setComponentLoading={setComponentLoading}
                isComponentLoading={isComponentLoading}
                isModalView={true}
                closeModal={closeModal}
            />
            <div>
                {isRepliesLoading ? (
                    <CircularProgress />
                ) : repliesError ? (
                    repliesError
                ) : (
                    replies.map((reply, key) => (
                        <Reply
                            isComponentLoading={isComponentLoading}
                            userId={userId}
                            cheetId={cheet.id}
                            reply={reply}
                            key={key}
                            setReplies={setReplies}
                            setErrors={setErrors}
                            setComponentLoading={setComponentLoading}
                        />
                    ))
                )}
            </div>
            <SubmitReply
                cheetId={cheet.id}
                isDisabled={isComponentLoading}
                setReplies={setReplies}
                setErrors={setErrors}
                setComponentLoading={setComponentLoading}
            />
            <div>
                <IconButton onClick={closeModal} disabled={isComponentLoading}>
                    <Close/>
                </IconButton>
            </div>
        </ReactModal>
    );
};

export default CheetModal;
