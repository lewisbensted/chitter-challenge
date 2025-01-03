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
import IconBox from "../styles/IconBox";

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
            <Grid2 container>
                <Grid2 container size={isModalView ? 10 : 9}>
                    <Grid2 size={6}>
                        <Link href={`/users/${cheet.user.uuid}`}>{cheet.user.username}</Link>
                    </Grid2>
                    <Grid2 size={6}>
                        <Typography display="flex" justifyContent="flex-end" variant="body2">
                            {format(cheet.createdAt, "HH:mm dd/MM/yy")}
                        </Typography>
                    </Grid2>

                    <Grid2>
                        {isEditing ? (
                            <Box component="form" onSubmit={handleSubmit(onSubmit)} id="edit-cheet">
                                <TextField
                                    {...register("text")}
                                    type="text"
                                    defaultValue={cheet.text}
                                    variant="standard"
                                    sx={{ width: "200%" }}
                                />
                            </Box>
                        ) : (
                            <Typography fontWeight={isModalView ? "bold" : ""}>{cheet.text}</Typography>
                        )}
                    </Grid2>
                </Grid2>
                {isModalView ? null : (
                    <Grid2 size={1}>
                        <IconBox>
                            <IconButton
                                color="primary"
                                onClick={() => setModalOpen(true)}
                                disabled={isComponentLoading}
                            >
                                <OpenInNew />
                            </IconButton>
                        </IconBox>
                    </Grid2>
                )}
                <Grid2 size={1}>
                    <IconBox>
                        {userId === cheet.user.uuid ? (
                            isCheetLoading ? (
                                <Box paddingTop={1.3}>
                                    <CircularProgress size="1.5rem" thickness={5} />
                                </Box>
                            ) : isEditing ? (
                                <IconButton
                                    type="submit"
                                    disabled={isComponentLoading}
                                    form="edit-cheet"
                                    key="edit-cheet"
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
                        {userId === cheet.user.uuid && !isModalView ? (
                            isCheetLoading ? (
                                <Box paddingTop={1.3}>
                                    <CircularProgress size="1.5rem" thickness={5} />
                                </Box>
                            ) : (
                                <IconButton
                                    color="primary"
                                    disabled={isComponentLoading}
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
                                >
                                    <Delete />
                                </IconButton>
                            )
                        ) : null}
                    </IconBox>
                </Grid2>
            </Grid2>
        </ThemeProvider>
    );
};

export default Cheet;
