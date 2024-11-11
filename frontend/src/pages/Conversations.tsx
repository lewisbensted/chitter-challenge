import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { IConversation, IUser } from "../utils/interfaces";
import { ClipLoader } from "react-spinners";
import ErrorModal from "../components/ErrorModal";
import { serverURL } from "../utils/serverURL";
import Conversation from "../components/Conversation";
import { useNavigate } from "react-router-dom";

const Conversations: React.FC = () => {
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [isConversationsLoading, setConversationsLoading] = useState<boolean>(true);
    const [conversations, setConversations] = useState<IConversation[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [conversationsError, setConversationsError] = useState<string>("");
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get(`${serverURL}/validate`, { withCredentials: true })
            .then(async (res: { data: IUser }) => {
                setUserId(res.data.id);
                await axios
                    .get(`${serverURL}/conversations`, { withCredentials: true })
                    .then((res: { data: IConversation[] }) => {
                        setConversations(res.data);
                    })
                    .catch(() => {
                        setConversationsError("An unexpected error occured while loading conversations.");
                    });
                setConversationsLoading(false);
                setLoading(false);
            })
            .catch((error: unknown) => {
                if (axios.isAxiosError(error) && error.response?.status == 401) {
                    navigate("/");
                } else if (axios.isAxiosError(error) && error.code == "ERR_NETWORK") {
                    setErrors(["Network Error: Servers unreachable."]);
                } else {
                    setErrors(["An unexpected error occured while authenticating the user."]);
                }
                setLoading(false);
            });
    }, []);

    return (
        <Layout isLoading={isLoading} setLoading={setLoading} userId={userId} setUserId={setUserId}>
            <div>
                <ErrorModal errors={errors} closeModal={() => setErrors([])} />
                <div>
                    {userId ? (
                        <div>
                            {isConversationsLoading ? (
                                <ClipLoader />
                            ) : (
                                <div>
                                    {conversationsError
                                        ? conversationsError
                                        : conversations.map((conversation, key) => (
                                              <div key={key}>
                                                  <span>{conversation.interlocutorUsername}</span>
                                                  <Conversation
                                                      userId={userId}
                                                      conversation={conversation}
                                                      isLoading={isLoading}
                                                      setLoading={setLoading}
                                                      setConversations={setConversations}
                                                  />
                                              </div>
                                          ))}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </Layout>
    );
};

export default Conversations;
