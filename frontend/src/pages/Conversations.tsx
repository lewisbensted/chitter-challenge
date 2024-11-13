import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { IConversation, IUser } from "../utils/interfaces";
import { ClipLoader } from "react-spinners";
import ErrorModal from "../components/ErrorModal";
import { serverURL } from "../utils/serverURL";
import Conversation from "../components/Conversation";
import { useNavigate } from "react-router-dom";
import { handleErrors } from "../utils/handleErrors";

const Conversations: React.FC = () => {
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [isPageLoading, setPageLoading] = useState<boolean>(true);
    const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
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
                setPageLoading(false);
            })
            .catch((error: unknown) => {
                if (axios.isAxiosError(error) && error.response?.status == 401) {
                    navigate("/");
                } else {
                    handleErrors(error, 'authenticating the user', setErrors)
                }
                setPageLoading(false);
            });
    }, []);

    return (
        <Layout
            isPageLoading={isPageLoading}
            isComponentLoading={isComponentLoading}
            setPageLoading={setPageLoading}
            userId={userId}
            setUserId={setUserId}
        >
            <div>
                <ErrorModal errors={errors} closeModal={() => setErrors([])} />
                {isPageLoading ? (
                    <ClipLoader />
                ) : userId ? (
                    <div>
                        {conversationsError
                            ? conversationsError
                            : conversations.map((conversation, key) => (
                                  <div key={key}>
                                      <span>{conversation.interlocutorUsername}</span>
                                      <Conversation
                                          userId={userId}
                                          conversation={conversation}
                                          isComponentLoading={isComponentLoading}
                                          setComponentLoading={setComponentLoading}
                                          setConversations={setConversations}
                                      />
                                  </div>
                              ))}
                    </div>
                ) : null}
            </div>
        </Layout>
    );
};

export default Conversations;
