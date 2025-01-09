import React, { useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { IReply } from "../utils/interfaces";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Reply from "@mui/icons-material/Reply";
import { Box, Grid2, TextField, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";
import FlexBox from "../styles/FlexBox";

interface Props {
    cheetId: string;
    isDisabled: boolean;
    setReplies: (arg: IReply[]) => void;
    setErrors: (arg: string[]) => void;
    setComponentLoading: (arg: boolean) => void;
}

const SendReply: React.FC<Props> = ({ cheetId, isDisabled, setReplies, setErrors, setComponentLoading }) => {
    const { register, handleSubmit, reset } = useForm<{ text: string }>();
    const [isSubmitLoading, setSubmitLoading] = useState<boolean>(false);

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setSubmitLoading(true);
        setComponentLoading(true);
        reset();
        await axios
            .post(`${serverURL}/cheets/${cheetId}/replies`, data, {
                withCredentials: true,
            })
            .then((res: { data: IReply[] }) => {
                setReplies(res.data);
            })
            .catch((error: unknown) => {
                handleErrors(error, "sending the reply", setErrors);
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
                            <Typography variant="subtitle1">Send a Reply:</Typography>
                        </Grid2>
                        <Grid2 size={12}>
                            <TextField {...register("text")} type="text" variant="standard" />
                        </Grid2>
                    </Grid2>
                    <Grid2 size={2}>
                        {isSubmitLoading ? (
                            <Box paddingTop={1.5} paddingLeft={1.5}>
                                <CircularProgress size="2rem" thickness={5} />
                            </Box>
                        ) : (
                            <IconButton type="submit" disabled={isDisabled} color="primary">
                                <Reply />
                            </IconButton>
                        )}
                    </Grid2>
                </Grid2>
            </FlexBox>
        </ThemeProvider>
    );
};

export default SendReply;
