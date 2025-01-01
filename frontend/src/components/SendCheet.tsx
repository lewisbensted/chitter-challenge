import React, { useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { ICheet } from "../utils/interfaces";
import { useParams } from "react-router-dom";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Send from "@mui/icons-material/Send";
import FlexBox from "../styles/FlexBox";
import { Box, Grid2, TextField, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";
import IconBox from "../styles/IconBox";

interface Props {
    isDisabled: boolean;
    setCheets: (arg: ICheet[]) => void;
    setCheetsError: (arg: string) => void;
    setErrors: (arg: string[]) => void;
    setComponentLoading: (arg: boolean) => void;
}

const SendCheet: React.FC<Props> = ({ isDisabled, setCheets, setCheetsError, setErrors, setComponentLoading }) => {
    const { id } = useParams();
    const { register, handleSubmit, reset } = useForm<{ text: string }>();
    const [isSubmitLoading, setSubmitLoading] = useState<boolean>(false);

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setSubmitLoading(true);
        setComponentLoading(true);
        reset();
        await axios
            .post(`${serverURL + (id ? `/users/${id}/` : "/")}cheets`, data, {
                withCredentials: true,
            })
            .then((res: { data: ICheet[] }) => {
                setCheets(res.data);
                setCheetsError("");
            })
            .catch((error: unknown) => {
                handleErrors(error, "sending cheet", setErrors);
            });
        setSubmitLoading(false);
        setComponentLoading(false);
    };
    return (
        <ThemeProvider theme={theme}>
            <FlexBox>
                <Grid2 container component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid2 container>
                        <Grid2 size={12}>
                            <Typography variant="body1">Send a Cheet:</Typography>
                        </Grid2>
                        <Grid2 size={12}>
                            <TextField {...register("text")} type="text" variant="standard" fullWidth/>
                        </Grid2>
                    </Grid2>
                    <Grid2 size={1}>
                        {isSubmitLoading ? (
                            <CircularProgress />
                        ) : (
                            <IconBox>
                                <IconButton type="submit" disabled={isDisabled} color="primary">
                                    <Send />
                                </IconButton>
                            </IconBox>
                        )}
                    </Grid2>
                </Grid2>
            </FlexBox>
        </ThemeProvider>
    );
};

export default SendCheet;
