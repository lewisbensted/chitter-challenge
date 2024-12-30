import React, { useState } from "react";
import { ICheet } from "../utils/interfaces";
import { format } from "date-fns";
import { useParams } from "react-router-dom";

import theme from "../styles/theme";
import { Box, CircularProgress, Grid2, IconButton, Link, TextField, ThemeProvider, Typography } from "@mui/material";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import { Delete, Done, Edit, OpenInNew } from "@mui/icons-material";
import CheetModal from "./CheetModal";

interface Props {
    userId?: string;
    cheet: ICheet;
    setErrors: (arg: string[]) => void;
    setCheets: (arg: ICheet[]) => void;
    isComponentLoading: boolean;
    setComponentLoading: (arg: boolean) => void;
    isModalView: boolean;
    closeModal?: () => void;
}

const Cheet: React.FC<Props> = ({
    userId,
    cheet,
    setErrors,
    setCheets,
    setComponentLoading,
    isComponentLoading,
    isModalView,
}) => {
    const { id } = useParams();
    const { register, handleSubmit } = useForm<{ text: string }>();
    const [isEditing, setEditing] = useState<boolean>(false);
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [isCheetLoading, setCheetLoading] = useState<boolean>(false);

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setCheetLoading(true);
        setComponentLoading(true);
        await axios
            .put(`${serverURL + (id ? `/users/${id}/` : "/")}cheets/${cheet.uuid}`, data, {
                withCredentials: true,
            })
            .then((res: { data: ICheet[] }) => {
                setCheets(res.data);
            })
            .catch((error: unknown) => {
                handleErrors(error, "editing the cheet", setErrors);
            });
        setEditing(false);
        setCheetLoading(false);
        setComponentLoading(false);
    };

    return (
        <ThemeProvider theme={theme}>
            {isModalView ? null : (
                <CheetModal
                    cheet={cheet}
                    userId={userId}
                    isOpen={isModalOpen}
                    closeModal={() => {
                        setModalOpen(false);
                    }}
                    setCheets={setCheets}
                    isComponentLoading={isComponentLoading}
                    setComponentLoading={setComponentLoading}
                />
            )}
            <Grid2 container columnSpacing={1}>
                <Grid2 container size={isModalView ? 10 : 9}>
                    <Grid2 size={6}>
                        <Link href={`/users/${cheet.user.uuid}`}>{cheet.user.username}</Link>
                    </Grid2>
                    <Grid2 size={6}>
                        <Box display="flex" justifyContent="flex-end">
                            <Typography variant="body2">{format(cheet.createdAt, "HH:mm dd/MM/yy")}</Typography>
                        </Box>
                    </Grid2>

                    <Grid2>
                        {isEditing ? (
                            <Box component="form" onSubmit={handleSubmit(onSubmit)} id="edit-reply">
                                <TextField
                                    {...register("text")}
                                    type="text"
                                    defaultValue={cheet.text}
                                    variant="standard"
                                />
                            </Box>
                        ) : (
                            <Typography>{cheet.text}</Typography>
                        )}
                    </Grid2>
                </Grid2>
                {isModalView ? null : (
                    <Grid2 size={1}>
                        <Box margin={1.2}>
                            <IconButton onClick={() => setModalOpen(true)} disabled={isComponentLoading}>
                                <OpenInNew />
                            </IconButton>
                        </Box>
                    </Grid2>
                )}
                <Grid2 size={1}>
                    <Box margin={1.2}>
                        {userId === cheet.user.uuid ? (
                            isCheetLoading ? (
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
                <Grid2 size={1}>
                    <Box margin={1.2}>
                        {userId === cheet.user.uuid && !isModalView ? (
                            isCheetLoading ? (
                                <CircularProgress />
                            ) : (
                                <IconButton
                                    onClick={async () => {
                                        setCheetLoading(true);
                                        setComponentLoading(true);
                                        await axios
                                            .delete(`${serverURL + (id ? `/users/${id}/` : "/")}cheets/${cheet.uuid}`, {
                                                withCredentials: true,
                                            })
                                            .then((res: { data: ICheet[] }) => {
                                                setCheets(res.data);
                                                setModalOpen(false);
                                            })
                                            .catch((error: unknown) => {
                                                handleErrors(error, "deleting the cheet", setErrors);
                                            });
                                        setCheetLoading(false);
                                        setComponentLoading(false);
                                    }}
                                    disabled={isComponentLoading}
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

export default Cheet;
