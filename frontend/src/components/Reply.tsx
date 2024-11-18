import React, { useState } from "react";
import { IReply } from "../utils/interfaces";
import { format } from "date-fns";
import axios from "axios";
import { Link } from "react-router-dom";
import EditReply from "./EditReply";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Delete from "@mui/icons-material/Delete";

interface Props {
    userId?: number;
    cheetId: number;
    reply: IReply;
    setErrors: (arg: string[]) => void;
    setReplies: (arg: IReply[]) => void;
    isComponentLoading: boolean;
    setComponentLoading: (arg: boolean) => void;
}

const Reply: React.FC<Props> = ({ userId, cheetId, reply, setReplies, setErrors, isComponentLoading, setComponentLoading }) => {
    const [isReplyLoading, setReplyLoading] = useState<boolean>(false);

    return (
        <div>
            <Link to={`/users/${reply.userId}`}>{reply.username}</Link> &nbsp;
            <EditReply
                cheetId={cheetId}
                reply={reply}
                isDisabled={isComponentLoading}
                setComponentLoading={setComponentLoading}
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
                    <CircularProgress />
                ) : (
                    <IconButton
                        disabled={isComponentLoading}
                        onClick={async () => {
                            setReplyLoading(true);
                            setComponentLoading(true);
                            await axios
                                .delete(`${serverURL}/cheets/${reply.cheetId}/replies/${reply.id}`, {
                                    withCredentials: true,
                                })
                                .then((res: { data: IReply[] }) => {
                                    setReplies(res.data);
                                })
                                .catch((error: unknown) => {
                                    handleErrors(error, 'deleting the reply', setErrors)
                                });
                            setReplyLoading(false);
                            setComponentLoading(false);
                        }}
                    >
                        <Delete />
                    </IconButton>
                )
            ) : null}
        </div>
    );
};

export default Reply;
