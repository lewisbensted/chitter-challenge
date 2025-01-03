import { Fragment, useState } from "react";
import { IMessage } from "../utils/interfaces";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import { Box, CircularProgress, Grid2, IconButton, TextField, ThemeProvider, Typography } from "@mui/material";
import { Delete, Done, Edit } from "@mui/icons-material";
import theme from "../styles/theme";
import IconBox from "../styles/IconBox";
import { format } from "date-fns";

interface Props {
    userId?: string;
    message: IMessage;
    setErrors: (arg: string[]) => void;
    setMessages: (arg: IMessage[]) => void;
    isComponentLoading: boolean;
    setComponentLoading: (arg: boolean) => void;
    setReloadWhenClosed: (arg: boolean) => void;
}

const Message: React.FC<Props> = ({
    userId,
    message,
    setErrors,
    setMessages,
    isComponentLoading,
    setComponentLoading,
    setReloadWhenClosed,
}) => {
    const { register, handleSubmit } = useForm<{ text: string }>();
    const [isMessageLoading, setMessageLoading] = useState<boolean>(false);
    const [isEditing, setEditing] = useState<boolean>(false);

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setMessageLoading(true);
        setComponentLoading(true);
        await axios
            .put(`${serverURL}/messages/${message.recipient.uuid}/message/${message.uuid}`, data, {
                withCredentials: true,
            })
            .then((res: { data: IMessage[] }) => {
                setMessages(res.data);
            })
            .catch((error: unknown) => {
                handleErrors(error, "editing the message", setErrors);
            });
        setEditing(false);
        setMessageLoading(false);
        setComponentLoading(false);
    };
    return (
        <ThemeProvider theme={theme}>
            <Grid2 container justifyContent={message.sender.uuid === userId ? "" : "flex-end"}>
                <Grid2 container size={5} justifyContent={message.sender.uuid === userId ? "" : "flex-end"}>
                    <Grid2 size={12}>
                        {isEditing ? (
                            <Box component="form" onSubmit={handleSubmit(onSubmit)} id="edit-message">
                                <TextField
                                    component="form"
                                    onSubmit={handleSubmit(onSubmit)}
                                    id="edit-message"
                                    {...register("text")}
                                    type="text"
                                    defaultValue={message.text}
                                    variant="standard"
                                />
                            </Box>
                        ) : (
                            <Typography
                                justifyContent={message.sender.uuid === userId ? "" : "flex-end"}
                                fontWeight={!message.isRead && message.recipient.uuid == userId ? "bold" : ""}
                            >
                                {message.text}
                            </Typography>
                        )}
                    </Grid2>
                    <Typography variant="body2">{format(message.createdAt, "HH:mm dd/MM/yy")}</Typography>
                </Grid2>
                {message.sender.uuid === userId ? (
                    <Fragment>
                        <Grid2 size={1}>
                            <IconBox>
                                {userId === message.sender.uuid ? (
                                    isMessageLoading ? (
                                        <Box paddingTop={1.3}>
                                            <CircularProgress size="1.5rem" thickness={5} />
                                        </Box>
                                    ) : isEditing ? (
                                        <IconButton
                                            type="submit"
                                            disabled={isComponentLoading}
                                            form="edit-message"
                                            key="edit-message"
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
                            </IconBox>
                        </Grid2>
                        <Grid2 size={1}>
                            <IconBox>
                                {userId === message.sender.uuid ? (
                                    isMessageLoading ? (
                                        <Box paddingTop={1.3}>
                                            <CircularProgress size="1.5rem" thickness={5} />
                                        </Box>
                                    ) : (
                                        <IconButton
                                            color="primary"
                                            disabled={isComponentLoading}
                                            onClick={async () => {
                                                setMessageLoading(true);
                                                setComponentLoading(true);
                                                await axios
                                                    .delete(
                                                        `${serverURL}/messages/${message.recipient.uuid}/message/${message.uuid}`,
                                                        {
                                                            withCredentials: true,
                                                        }
                                                    )
                                                    .then((res: { data: IMessage[] }) => {
                                                        setMessages(res.data);
                                                        setReloadWhenClosed(true);
                                                    })
                                                    .catch((error: unknown) => {
                                                        handleErrors(error, "deleting the message", setErrors);
                                                    });
                                                setMessageLoading(false);
                                                setComponentLoading(false);
                                            }}
                                        >
                                            <Delete />
                                        </IconButton>
                                    )
                                ) : null}
                            </IconBox>
                        </Grid2>
                    </Fragment>
                ) : null}
            </Grid2>
        </ThemeProvider>
    );
};

export default Message;
