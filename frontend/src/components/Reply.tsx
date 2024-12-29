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
import { Box, Grid2 } from "@mui/material";

interface Props {
    userId?: string;
    cheetId: string;
    reply: IReply;
    setErrors: (arg: string[]) => void;
    setReplies: (arg: IReply[]) => void;
    isComponentLoading: boolean;
    setComponentLoading: (arg: boolean) => void;
}

const Reply: React.FC<Props> = ({
    userId,
    cheetId,
    reply,
    setReplies,
    setErrors,
    isComponentLoading,
    setComponentLoading,
}) => {
    const [isReplyLoading, setReplyLoading] = useState<boolean>(false);

    return (
        <Box>
            <Grid2 container>
                <Grid2 size={10}>
                    <EditReply
                        cheetId={cheetId}
                        reply={reply}
                        isComponentLoading={isComponentLoading}
                        setComponentLoading={setComponentLoading}
                        setReplies={setReplies}
                        setErrors={setErrors}
                        userId={userId}
                    />
                </Grid2>

                {/* {new Date(reply.updatedAt) > new Date(reply.createdAt) ? (
                <span>{`Edited at ${format(reply.updatedAt, "HH:mm dd/MM/yy")}`} &nbsp;</span>
            ) : null} */}
                {/* <Box margin={1.2}>
                    {userId === reply.user.uuid ? (
                        isReplyLoading ? (
                            <CircularProgress color="primary" size="1.7rem" thickness={5} />
                        ) : (
                            <IconButton
                                color="primary"
                                disabled={isComponentLoading}
                                onClick={async () => {
                                    setReplyLoading(true);
                                    setComponentLoading(true);
                                    await axios
                                        .delete(`${serverURL}/cheets/${reply.cheet.uuid}/replies/${reply.uuid}`, {
                                            withCredentials: true,
                                        })
                                        .then((res: { data: IReply[] }) => {
                                            setReplies(res.data);
                                        })
                                        .catch((error: unknown) => {
                                            handleErrors(error, "deleting the reply", setErrors);
                                        });
                                    setReplyLoading(false);
                                    setComponentLoading(false);
                                }}
                            >
                                <Delete />
                            </IconButton>
                        )
                    ) : null}
                </Box> */}
            </Grid2>
        </Box>
    );
};

export default Reply;
