import React, { useState } from "react";
import { IReply } from "../utils/interfaces";
import { format } from "date-fns";
import axios from "axios";
import { Link } from "react-router-dom";
import EditReply from "./EditReply";
import { serverURL } from "../utils/serverURL";
import { ClipLoader } from "react-spinners";

interface Props {
    userId?: number;
    cheetId: number;
    reply: IReply;
    setErrors: (arg: string[]) => void;
    setReplies: (arg: IReply[]) => void;
    isLoading: boolean;
    setLoading: (arg: boolean) => void;
}

const Reply: React.FC<Props> = ({ userId, cheetId, reply, setReplies, setErrors, isLoading, setLoading }) => {
    const [isReplyLoading, setReplyLoading] = useState<boolean>(false);

    return (
        <div>
            <Link to={`/users/${reply.userId}`}>{reply.username}</Link> &nbsp;
            <EditReply
                cheetId={cheetId}
                reply={reply}
                isDisabled={isLoading}
                setLoading={setLoading}
                setReplies={setReplies}
                setErrors={setErrors}
                userId={userId}
            />
            <span>{format(reply.createdAt, "HH:mm dd/MM/yy")}&nbsp;</span>
            {new Date(reply.updatedAt) > new Date(reply.createdAt) ? (
                <span>{`Edited at ${format(reply.updatedAt, "HH:mm dd/MM/yy")}`} &nbsp;</span>
            ) : null}
            {userId === reply.userId ? (
                isReplyLoading ? (
                    <ClipLoader />
                ) : (
                    <button
                        disabled={isLoading}
                        onClick={async () => {
                            setReplyLoading(true);
                            setLoading(true);
                            await axios
                                .delete(`${serverURL}/cheets/${reply.cheetId}/replies/${reply.id}`, {
                                    withCredentials: true,
                                })
                                .then((res: { data: IReply[] }) => {
                                    setReplies(res.data);
                                })
                                .catch((error: unknown) => {
                                    axios.isAxiosError(error) && [401, 403].includes(error.response?.status!)
                                        ? setErrors(error.response?.data)
                                        : setErrors(["An unexpected error occured while deleting reply."]);
                                });
                            setReplyLoading(false);
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

export default Reply;
