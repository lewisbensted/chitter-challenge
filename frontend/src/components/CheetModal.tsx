import React, { useEffect, useState } from "react";
import { ICheet, IReply } from "../utils/interfaces";
import axios from "axios";
import ErrorModal from "./ErrorModal";
import Reply from "./Reply";
import SubmitReply from "./SendReply";
import { serverURL } from "../utils/serverURL";
import Cheet from "./Cheet";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Close from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog/Dialog";

interface Props {
    userId?: string;
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
    const [replies, setReplies] = useState<IReply[]>();
    const [repliesError, setRepliesError] = useState<string>();
    const [isRepliesLoading, setRepliesLoading] = useState<boolean>(true);

    useEffect(() => {
        if (isOpen) {
            setComponentLoading(true);
            axios
                .get(`${serverURL}/cheets/${cheet.uuid}/replies`, {
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
        <Dialog open={isOpen}>
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
                    replies!.map((reply, key) => (
                        <Reply
                            isComponentLoading={isComponentLoading}
                            userId={userId}
                            cheetId={cheet.uuid}
                            reply={reply}
                            key={key}
                            setReplies={setReplies}
                            setErrors={setErrors}
                            setComponentLoading={setComponentLoading}
                        />
                    ))
                )}
            </div>
            {userId ? (
                <SubmitReply
                    cheetId={cheet.uuid}
                    isDisabled={isComponentLoading}
                    setReplies={setReplies}
                    setErrors={setErrors}
                    setComponentLoading={setComponentLoading}
                />
            ) : null}
            <div>
                <IconButton onClick={closeModal} disabled={isComponentLoading}>
                    <Close />
                </IconButton>
            </div>
        </Dialog>
    );
};

export default CheetModal;
