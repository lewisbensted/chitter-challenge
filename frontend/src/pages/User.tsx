import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ICheet, IConversation, IUser } from "../utils/interfaces";
import Layout from "./Layout";
import { ClipLoader } from "react-spinners";
import ErrorModal from "../components/ErrorModal";
import Cheet from "../components/Cheet";
import SubmitCheet from "../components/SubmitCheet";
import { serverURL } from "../utils/serverURL";
import Conversation from "../components/Conversation";

const User: React.FC = () => {
    const [userId, setUserId] = useState<number>();
    const [isPageLoading, setPageLoading] = useState<boolean>(true);
    const [isCheetsLoading, setCheetsLoading] = useState<boolean>(false);
    const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
    const [conversation, setConversation] = useState<IConversation[]>([]);
    const [cheets, setCheets] = useState<ICheet[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [cheetsError, setCheetsError] = useState<string>("");

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get(`${serverURL}/validate`, { withCredentials: true })
            .then(async (res: { data: IUser }) => {
                setUserId(res.data.id);
            })
            .catch((error: unknown) => {
                if (axios.isAxiosError(error) && error.response?.status == 401) {
                    navigate("/");
                } else if (axios.isAxiosError(error) && error.code == "ERR_NETWORK") {
                    setErrors(["Network Error: Servers unreachable."]);
                } else {
                    setErrors(["An unexpected error occured while authenticating the user."]);
                }
            });
    }, []);

    useEffect(() => {
        if (userId) {
            axios
                .get(`${serverURL}/conversations/${id}`, { withCredentials: true })
                .then(async (res: { data: IConversation[] }) => {
                    setCheetsLoading(true);
                    setConversation(res.data);
                    setPageLoading(false);
                    await axios
                        .get(`${serverURL}/users/${id}/cheets`, { withCredentials: true })
                        .then((res: { data: ICheet[] }) => {
                            setCheets(res.data);
                        })
                        .catch(() => {
                            setCheetsError("An unexpected error occured while loading cheets.");
                        });
                    setCheetsLoading(false);
                })
                .catch((error: unknown) => {
                    if (axios.isAxiosError(error) && error.response?.status == 404) {
                        navigate("/");
                    } else {
                        setErrors(["An unexpected error occured while loading the page."]);
                    }
                    setPageLoading(false);
                });
        } else {
            setPageLoading(false);
        }
    }, [userId]);

    return (
        <Layout
            userId={userId}
            setUserId={setUserId}
            isPageLoading={isPageLoading}
            isComponentLoading={isComponentLoading || isCheetsLoading}
            setLoading={setPageLoading}
        >
            <div>
                <ErrorModal errors={errors} closeModal={() => setErrors([])} />
                {userId ? (
                    isPageLoading ? (
                        <ClipLoader />
                    ) : (
                        <div>
                            {conversation[0] ? (
                                <div>
                                    {conversation[0].interlocutorUsername}
                                    {userId == Number(id) ? null : (
                                        <Conversation
                                            userId={userId}
                                            conversation={conversation[0]}
                                            isLoading={isComponentLoading}
                                            setLoading={setComponentLoading}
                                            setConversations={setConversation}
                                            isUserPage={true}
                                        />
                                    )}
                                </div>
                            ) : (
                                "Error loading user."
                            )}

                            <div>
                                {isCheetsLoading ? (
                                    <ClipLoader />
                                ) : cheetsError ? (
                                    cheetsError
                                ) : (
                                    cheets.map((cheet, key) => (
                                        <Cheet
                                            cheet={cheet}
                                            userId={userId}
                                            setCheets={setCheets}
                                            setErrors={setErrors}
                                            key={key}
                                            setLoading={setComponentLoading}
                                            isLoading={isComponentLoading}
                                            isModalView={false}
                                        />
                                    ))
                                )}
                                {userId === Number(id) ? (
                                    <SubmitCheet
                                        setCheetsError={setCheetsError}
                                        isDisabled={isComponentLoading || isCheetsLoading}
                                        setCheets={setCheets}
                                        setErrors={setErrors}
                                        setLoading={setComponentLoading}
                                    />
                                ) : null}
                            </div>
                        </div>
                    )
                ) : null}
            </div>
        </Layout>
    );
};

export default User;
