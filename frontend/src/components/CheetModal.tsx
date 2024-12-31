import React, { useEffect, useState } from "react";
import { ICheet, IReply } from "../utils/interfaces";
import axios from "axios";
import ErrorModal from "./ErrorModal";
import { serverURL } from "../utils/serverURL";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Close from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog/Dialog";
import { Box, Divider, Grid2, ThemeProvider } from "@mui/material";
import Reply from "./Reply";
import theme from "../styles/theme";
import Cheet from "./Cheet";
import SendReply from "./SendReply";

interface Props {
    userId?: string;
    cheet: ICheet;
    isOpen: boolean;
    closeModal: () => void;
    setCheets: (arg: ICheet[]) => void;
    isComponentLoading: boolean;
    setComponentLoading: (arg: boolean) => void;
}

const CheetModal: React.FC<Props> = ({
    userId,
    cheet,
    isOpen,
    closeModal,
    setCheets,
    setComponentLoading,
    isComponentLoading,
}) => {
    const [errors, setErrors] = useState<string[]>([]);
    const [replies, setReplies] = useState<IReply[]>();
    const [repliesError, setRepliesError] = useState<string>();
    const [isRepliesLoading, setRepliesLoading] = useState<boolean>(true);

    useEffect(() => {
        if (isOpen) {
            setComponentLoading(true);
            axios
                .get(`${serverURL}/cheets/${cheet.uuid}/replies`, {
                    withCredentials: true,
                })
                .then((res: { data: IReply[] }) => {
                    setReplies(res.data);
                    setRepliesLoading(false);
                    setComponentLoading(false);
                })
                .catch(() => {
                    setRepliesError("An unexpected error occured while loading replies.");
                    setRepliesLoading(false);
                    setComponentLoading(false);
                });
        }
    }, [isOpen]);

    return (
        <ThemeProvider theme={theme}>
            <Dialog open={isOpen}>
                <ErrorModal errors={errors} closeModal={() => setErrors([])} />
                <Grid2 container marginInline={2} marginTop={1}>
                    <Grid2 size={11}></Grid2>
                    <Grid2 size={1} display="flex" justifyContent="center">
                        <Box margin={1.2}>
                            <IconButton onClick={closeModal} disabled={isComponentLoading} color="primary">
                                <Close />
                            </IconButton>
                        </Box>
                    </Grid2>
                </Grid2>
                <Box marginInline={5}>
                    <Cheet
                        cheet={cheet}
                        userId={userId}
                        setCheets={setCheets}
                        setErrors={setErrors}
                        setComponentLoading={setComponentLoading}
                        isComponentLoading={isComponentLoading}
                        isModalView={true}
                        closeModal={closeModal}
                    />
                    <Divider />

                    {isRepliesLoading ? (
                        <CircularProgress />
                    ) : repliesError ? (
                        repliesError
                    ) : (
                        <Box marginTop={1}>
                            {replies!.map((reply) => (
                                <Reply
                                    key={reply.uuid}
                                    isComponentLoading={isComponentLoading}
                                    userId={userId}
                                    cheetId={cheet.uuid}
                                    reply={reply}
                                    setReplies={setReplies}
                                    setErrors={setErrors}
                                    setComponentLoading={setComponentLoading}
                                />
                            ))}
                        </Box>
                    )}
                    {userId ? (
                        <SendReply
                            cheetId={cheet.uuid}
                            isDisabled={isComponentLoading}
                            setReplies={setReplies}
                            setErrors={setErrors}
                            setComponentLoading={setComponentLoading}
                        />
                    ) : null}
                </Box>
            </Dialog>
        </ThemeProvider>
    );
};

export default CheetModal;
