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
    const [isLoading, setLoading] = useState<boolean>(true);
    const [userId, setUserId] = useState<number>();
    const [errors, setErrors] = useState<string[]>([]);
    const [isInfoLoading, setInfoLoading] = useState<boolean>(false);
    const [cheets, setCheets] = useState<ICheet[]>([]);
    const [isCheetsLoading, setCheetsLoading] = useState<boolean>(false);
    const [cheetsError, setCheetsError] = useState<string>("");
    const [info, setInfo] = useState<IConversation[]>([]);
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
            setInfoLoading(true);
            axios
                .get(`${serverURL}/conversations/${id}`, { withCredentials: true })
                .then(async (res: { data: IConversation[] }) => {
                    setCheetsLoading(true);
                    setInfo(res.data);
                    setInfoLoading(false);
                    await axios
                        .get(`${serverURL}/users/${id}/cheets`, { withCredentials: true })
                        .then((res: { data: ICheet[] }) => {
                            setCheets(res.data);
                        })
                        .catch(() => {
                            setCheetsError("An unexpected error occured while loading cheets.");
                        });
                    setCheetsLoading(false);
                    setLoading(false);
                })
                .catch((error: unknown) => {
                    if (axios.isAxiosError(error) && error.response?.status == 404) {
                        navigate("/");
                    }
                    setInfoLoading(false);
                    setLoading(false);
                });
        }
    }, [userId]);

    return (
        <Layout isLoading={isLoading} setLoading={setLoading} userId={userId} setUserId={setUserId}>
            <div>
                <ErrorModal errors={errors} closeModal={() => setErrors([])} />
                {isInfoLoading ? (
                    <ClipLoader />
                ) : (
                    <div>
                        {info[0] ? (
                            <div>
                                {info[0].interlocutorUsername}
                                {userId == Number(id) ? null : 
                                    <Conversation
                                        userId={userId}
                                        conversation={info[0]}
                                        isLoading={isLoading}
                                        setLoading={setLoading}
                                        setConversations={setInfo}
                                        isUserPage={true}
                                    />
                                }
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
                                        setLoading={setLoading}
                                        isLoading={isLoading}
                                        isModalView={false}
                                    />
                                ))
                            )}
                            {userId === Number(id) ? (
                                <SubmitCheet
                                    setCheetsError={setCheetsError}
                                    isDisabled={isLoading || isCheetsLoading || !info}
                                    setCheets={setCheets}
                                    setErrors={setErrors}
                                    setLoading={setLoading}
                                />
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default User;
