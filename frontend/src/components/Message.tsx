import { useState } from "react";
import { IMessage } from "../utils/interfaces";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import {
    Box,
    Card,
    CardActions,
    CardContent,
    CircularProgress,
    Grid2,
    IconButton,
    TextField,
    ThemeProvider,
    Typography,
} from "@mui/material";
import { Delete, Done, Edit } from "@mui/icons-material";
import theme from "../styles/theme";
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
    const [isEditLoading, setEditLoading] = useState<boolean>(false);
    const [isDeleteLoading, setDeleteLoading] = useState<boolean>(false);
    const [isEditing, setEditing] = useState<boolean>(false);

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setEditLoading(true);
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
        setEditLoading(false);
        setComponentLoading(false);
    };
    return (
        <ThemeProvider theme={theme}>
            <Card>
                <Grid2 container justifyContent={message.sender.uuid === userId ? "" : "flex-end"}>
                    <Grid2 size={5}>
                        <CardContent>
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
                            <Typography
                                variant="body2"
                                justifyContent={message.sender.uuid === userId ? "" : "flex-end"}
                            >
                                {format(message.createdAt, "HH:mm dd/MM/yy")}
                            </Typography>
                        </CardContent>
                    </Grid2>
                    <Grid2 size={2} container>
                        {message.sender.uuid === userId ? (
                            <CardActions>
                                <Grid2 container size={12} columns={2}>
                                    <Grid2 size={1}>
                                        {isEditLoading ? (
                                            <Box paddingTop={1} paddingLeft={1}>
                                                <CircularProgress size="1.4rem" thickness={5} />
                                            </Box>
                                        ) : message.isRead ? null : isEditing ? (
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
                                        )}
                                    </Grid2>
                                    <Grid2 size={1}>
                                        {isDeleteLoading ? (
                                            <Box paddingTop={1} paddingLeft={1}>
                                                <CircularProgress size="1.4rem" thickness={5} />
                                            </Box>
                                        ) : message.isRead ? null : (
                                            <IconButton
                                                color="primary"
                                                disabled={isComponentLoading}
                                                onClick={async () => {
                                                    setDeleteLoading(true);
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
                                                    setDeleteLoading(false);
                                                    setComponentLoading(false);
                                                }}
                                            >
                                                <Delete />
                                            </IconButton>
                                        )}
                                    </Grid2>
                                </Grid2>
                            </CardActions>
                        ) : null}
                    </Grid2>
                </Grid2>
            </Card>
        </ThemeProvider>
    );
};

export default Message;
