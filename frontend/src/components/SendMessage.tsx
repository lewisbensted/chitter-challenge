import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { IMessage } from "../utils/interfaces";
import axios from "axios";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Send from "@mui/icons-material/Send";
import { Box, Grid2, TextField, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";
import FlexBox from "../styles/FlexBox";

interface Props {
    recipientId: string;
    isDisabled: boolean;
    setMessages: (arg: IMessage[]) => void;
    setErrors: (arg: string[]) => void;
    setComponentLoading: (arg: boolean) => void;
    setReloadWhenClosed: (arg: boolean) => void;
}

const SendMessage: React.FC<Props> = ({
    recipientId,
    isDisabled,
    setMessages,
    setErrors,
    setComponentLoading,
    setReloadWhenClosed,
}) => {
    const { register, handleSubmit, reset } = useForm<{ text: string }>();
    const [isSubmitLoading, setSubmitLoading] = useState<boolean>(false);

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setSubmitLoading(true);
        setComponentLoading(true);
        reset();
        await axios
            .post(`${serverURL}/messages/${recipientId}`, data, {
                withCredentials: true,
            })
            .then((res: { data: IMessage[] }) => {
                setMessages(res.data);
                setReloadWhenClosed(true);
            })
            .catch((error: unknown) => {
                handleErrors(error, "sending message", setErrors);
            });
        setSubmitLoading(false);
        setComponentLoading(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <FlexBox>
                <Grid2 container component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid2 container size={10}>
                        <Grid2 size={12}>
                            <Typography variant="subtitle1">Send a Message:</Typography>
                        </Grid2>
                        <Grid2 size={12}>
                            <TextField {...register("text")} type="text" variant="standard" />
                        </Grid2>
                    </Grid2>
                    <Grid2 size={2} container>
                        {isSubmitLoading ? (
                            <Box paddingTop={1} paddingLeft={1}>
                                <CircularProgress size="2rem" thickness={5} />
                            </Box>
                        ) : (
                            <IconButton type="submit" disabled={isDisabled} color="primary">
                                <Send />
                            </IconButton>
                        )}
                    </Grid2>
                </Grid2>
            </FlexBox>
        </ThemeProvider>
    );
};

export default SendMessage;
