import axios from "axios";
import React, { useState } from "react";
import { IReply } from "../utils/interfaces";
import { SubmitHandler, useForm } from "react-hook-form";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import IconButton from "@mui/material/IconButton/IconButton";
import Edit from "@mui/icons-material/Edit";
import Done from "@mui/icons-material/Done";
import { Box, CircularProgress, Grid2, Input, Link, TextField, ThemeProvider, Typography } from "@mui/material";
import { format } from "date-fns";
import theme from "../styles/theme";
import Delete from "@mui/icons-material/Delete";

interface Props {
    isComponentLoading: boolean;
    setComponentLoading: (arg: boolean) => void;
    setReplies: (arg: IReply[]) => void;
    setErrors: (arg: string[]) => void;
    reply: IReply;
    cheetId: string;
    userId?: string;
}

const Reply: React.FC<Props> = ({
    reply,
    cheetId,
    isComponentLoading,
    setComponentLoading,
    setReplies,
    setErrors,
    userId,
}) => {
    const { register, handleSubmit } = useForm<{ text: string }>();
    const [isEditing, setEditing] = useState<boolean>(false);
    const [isReplyLoading, setReplyLoading] = useState<boolean>(false);

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setReplyLoading(true);
        setComponentLoading(true);
        await axios
            .put(`${serverURL}/cheets/${cheetId}/replies/${reply.uuid}`, data, {
                withCredentials: true,
            })
            .then((res: { data: IReply[] }) => {
                setReplies(res.data);
            })
            .catch((error: unknown) => {
                handleErrors(error, "editing the reply", setErrors);
            });
        setReplyLoading(false);
        setComponentLoading(false);
        setEditing(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <Grid2 container columnSpacing={1}>
                <Grid2 container size={10}>
                    <Grid2 size={6}>
                        <Link href={`/users/${reply.user.uuid}`}>{reply.user.username}</Link>
                    </Grid2>
                    <Grid2 size={6}>
                        <Box display="flex" justifyContent="flex-end">
                            <Typography variant="body2">{format(reply.createdAt, "HH:mm dd/MM/yy")}</Typography>
                        </Box>
                    </Grid2>
                    <Grid2>
                        {isEditing ? (
                            <Box component="form" onSubmit={handleSubmit(onSubmit)} id="edit-reply">
                                <TextField
                                    {...register("text")}
                                    type="text"
                                    defaultValue={reply.text}
                                    variant="standard"
                                />
                            </Box>
                        ) : (
                            <Typography>{reply.text}</Typography>
                        )}
                    </Grid2>
                </Grid2>
                <Grid2 size ={1}>
                    <Box margin={1.2}>
                        {userId === reply.user.uuid ? (
                            isReplyLoading ? (
                                <CircularProgress color="primary" size="1.7rem" thickness={5} />
                            ) : isEditing ? (
                                <IconButton
                                    type="submit"
                                    disabled={isComponentLoading}
                                    form="edit-reply"
                                    key="edit-reply"
                                    color="primary"
                                >
                                    <Done />
                                </IconButton>
                            ) : (
                                <IconButton onClick={() => setEditing(true)} color="primary">
                                    <Edit />
                                </IconButton>
                            )
                        ) : null}
                    </Box>
                </Grid2>
                <Grid2 size = {1}>
                    <Box margin={1.2}>
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
                    </Box>
                </Grid2>
            </Grid2>
        </ThemeProvider>
    );
};

export default Reply;
