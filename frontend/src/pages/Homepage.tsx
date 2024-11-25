import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { ICheet } from "../utils/interfaces";
import SubmitCheet from "../components/SendCheet";
import Cheet from "../components/Cheet";
import ErrorModal from "../components/ErrorModal";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Box from "@mui/material/Box/Box";

const Homepage: React.FC = () => {
    const [userId, setUserId] = useState<string>();
    const [isPageLoading, setPageLoading] = useState<boolean>(true);
    const [isCheetsLoading, setCheetsLoading] = useState<boolean>(false);
    const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
    const [cheets, setCheets] = useState<ICheet[]>();
    const [errors, setErrors] = useState<string[]>([]);
    const [cheetsError, setCheetsError] = useState<string>();
    const [isUnreadMessages, setUnreadMessages] = useState<boolean>();

    useEffect(() => {
        axios
            .get(`${serverURL}/validate`, { withCredentials: true })
            .then(async (res: { data: string }) => {
                setUserId(res.data);
            })
            .catch((error: unknown) => {
                if (axios.isAxiosError(error) && error.response?.status == 401) {
                    setUserId(undefined);
                } else {
                    handleErrors(error, "authenticating the user", setErrors);
                }
                setPageLoading(false);
            });
    }, []);

    useEffect(() => {
        if (userId) {
            (async () => {
                await axios
                    .get(`${serverURL}/conversations/unread`, { withCredentials: true })
                    .then((res: { data: boolean }) => {
                        setUnreadMessages(res.data);
                    })
                    .catch((error) => {
                        handleErrors(error, "loading user information", setErrors);
                    });
                setPageLoading(false);
            })();
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            (async () => {
                setCheetsLoading(true);
                await axios
                    .get(`${serverURL}/cheets`, { withCredentials: true })
                    .then((res: { data: ICheet[] }) => {
                        setCheets(res.data);
                    })
                    .catch(() => {
                        setCheetsError("An unexpected error occured while loading cheets.");
                    });
                setCheetsLoading(false);
            })();
        }
    }, [userId]);

    return (
        <Layout
            userId={userId}
            setUserId={setUserId}
            isPageLoading={isPageLoading}
            isComponentLoading={isComponentLoading || isCheetsLoading}
            setPageLoading={setPageLoading}
            isUnreadMessages={isUnreadMessages}
        >
            <Box>
                <ErrorModal errors={errors} closeModal={() => setErrors([])} />
                <h1>Welcome to Chitter</h1>

                {isPageLoading ? (
                    <CircularProgress />
                ) : userId ? (
                    <Box>
                        {isCheetsLoading ? (
                            <CircularProgress />
                        ) : cheetsError ? (
                            cheetsError
                        ) : (
                            cheets!.map((cheet, key) => (
                                <Cheet
                                    cheet={cheet}
                                    userId={userId}
                                    setCheets={setCheets}
                                    setErrors={setErrors}
                                    key={key}
                                    setComponentLoading={setComponentLoading}
                                    isComponentLoading={isComponentLoading}
                                    isModalView={false}
                                />
                            ))
                        )}
                        <SubmitCheet
                            isDisabled={isComponentLoading || isCheetsLoading}
                            setCheets={setCheets}
                            setCheetsError={setCheetsError}
                            setErrors={setErrors}
                            setComponentLoading={setComponentLoading}
                        />
                    </Box>
                ) : null}
            </Box>
        </Layout>
    );
};

export default Homepage;
