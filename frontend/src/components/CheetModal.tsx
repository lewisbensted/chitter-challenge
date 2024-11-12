import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { ICheet, IReply } from "../utils/interfaces";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import ErrorModal from "./ErrorModal";
import Reply from "./Reply";
import SubmitReply from "./SubmitReply";
import EditCheet from "./EditCheet";
import { Link } from "react-router-dom";
import { serverURL } from "../utils/serverURL";
import { format } from "date-fns";
import Cheet from "./Cheet";

interface Props {
    userId?: number;
    cheet: ICheet;
    isOpen: boolean;
    closeModal: () => void;
    setCheets: (arg: ICheet[]) => void;
    isComponentLoading: boolean;
    setComponentLoading: (arg: boolean) => void;
}

const CheetModal: React.FC<Props> = ({ userId, cheet, isOpen, closeModal, setCheets, setComponentLoading, isComponentLoading }) => {
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
            <div>
                <Cheet
                    cheet={cheet}
                    userId={userId}
                    setCheets={setCheets}
                    setErrors={setErrors}
                    setComponentLoading={setComponentLoading}
                    isComponentLoading={isComponentLoading}
                    isModalView = {true}
                />
            </div>
            <div>
                {isRepliesLoading ? (
                    <ClipLoader />
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
                <button onClick={closeModal} disabled={isComponentLoading}>
                    Close Modal
                </button>
            </div>
        </ReactModal>
    );
};

export default CheetModal;
