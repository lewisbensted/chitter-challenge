import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { IConversation } from "../utils/interfaces";
import ErrorModal from "../components/ErrorModal";
import { serverURL } from "../utils/serverURL";
import Conversation from "../components/Conversation";
import { useNavigate } from "react-router-dom";
import { handleErrors } from "../utils/handleErrors";
import { Box, CircularProgress, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";

const Conversations: React.FC = () => {
    const [userId, setUserId] = useState<string>();
    const [isPageLoading, setPageLoading] = useState<boolean>(true);
    const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
    const [conversations, setConversations] = useState<IConversation[]>();
    const [errors, setErrors] = useState<string[]>([]);
    const [conversationsError, setConversationsError] = useState<string>();
    const [reloadTrigger, toggleReloadTrigger] = useState<boolean>(false);
    const [isUnreadMessages, setUnreadMessages] = useState<boolean>();
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get(`${serverURL}/validate`, { withCredentials: true })
            .then(async (res: { data: string }) => {
                setUserId(res.data);
            })
            .catch((error: unknown) => {
                if (axios.isAxiosError(error) && error.response?.status == 401) {
                    navigate("/");
                } else {
                    handleErrors(error, "authenticating the user", setErrors);
                }
                setPageLoading(false);
            });
    }, []);

    useEffect(() => {
        if (userId) {
            (async () => {
                setComponentLoading(true);
                await axios
                    .get(`${serverURL}/conversations`, { withCredentials: true })
                    .then((res: { data: IConversation[] }) => {
                        setConversations(res.data);
                    })
                    .catch(() => {
                        setConversationsError("An unexpected error occured while loading conversations.");
                    });
            })();
        }
    }, [userId, reloadTrigger]);

    useEffect(() => {
        if (userId) {
            (async () => {
                await axios
                    .get(`${serverURL}/messages/unread`, { withCredentials: true })
                    .then((res: { data: boolean }) => {
                        setUnreadMessages(res.data);
                    });
                setComponentLoading(false);
                setPageLoading(false);
            })();
        }
    }, [conversations]);

    return (
        <Layout
            isPageLoading={isPageLoading}
            isComponentLoading={isComponentLoading}
            setPageLoading={setPageLoading}
            userId={userId}
            setUserId={setUserId}
            isUnreadMessages={isUnreadMessages}
        >
            <Box>
                <ErrorModal errors={errors} closeModal={() => setErrors([])} />
                <Typography variant="h4">Messages</Typography>
                {isPageLoading ? (
                    <FlexBox>
                        <CircularProgress thickness={5} />
                    </FlexBox>
                ) : userId ? (
                    conversationsError ? (
                        conversationsError
                    ) : (
                        conversations!.map((conversation) => (
                            <Conversation
                                key={conversation.interlocutorId}
                                userId={userId}
                                conversation={conversation}
                                isComponentLoading={isComponentLoading}
                                setComponentLoading={setComponentLoading}
                                setConversations={setConversations}
                                reloadTrigger={reloadTrigger}
                                toggleReloadTrigger={toggleReloadTrigger}
                            />
                        ))
                    )
                ) : (
                    "Error loading conversations."
                )}
            </Box>
        </Layout>
    );
};

export default Conversations;
