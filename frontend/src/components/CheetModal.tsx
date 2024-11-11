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
    isLoading: boolean;
    setLoading: (arg: boolean) => void;
}

const CheetModal: React.FC<Props> = ({ userId, cheet, isOpen, closeModal, setCheets, setLoading, isLoading }) => {
    const [errors, setErrors] = useState<string[]>([]);
    const [replies, setReplies] = useState<IReply[]>([]);
    const [repliesError, setRepliesError] = useState<string>("");
    const [isRepliesLoading, setRepliesLoading] = useState<boolean>(true);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            axios
                .get(`${serverURL}/cheets/${cheet.id}/replies`, {
                    withCredentials: true,
                })
                .then((res: { data: IReply[] }) => {
                    setReplies(res.data);
                    setRepliesLoading(false);
                    setLoading(false);
                })
                .catch(() => {
                    setRepliesError("An unexpected error occured while loading replies.");
                    setRepliesLoading(false);
                    setLoading(false);
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
                    setLoading={setLoading}
                    isLoading={isLoading}
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
                            isLoading={isLoading}
                            userId={userId}
                            cheetId={cheet.id}
                            reply={reply}
                            key={key}
                            setReplies={setReplies}
                            setErrors={setErrors}
                            setLoading={setLoading}
                        />
                    ))
                )}
            </div>

            <SubmitReply
                cheetId={cheet.id}
                isDisabled={isLoading}
                setReplies={setReplies}
                setErrors={setErrors}
                setLoading={setLoading}
            />
            <div>
                <button onClick={closeModal} disabled={isLoading}>
                    Close Modal
                </button>
            </div>
        </ReactModal>
    );
};

export default CheetModal;
