import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { ICheet, IUser } from "../utils/interfaces";
import { ClipLoader } from "react-spinners";
import SubmitCheet from "../components/SubmitCheet";
import Cheet from "../components/Cheet";
import ErrorModal from "../components/ErrorModal";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";

const Homepage: React.FC = () => {
    const [userId, setUserId] = useState<number>();
    const [isPageLoading, setPageLoading] = useState<boolean>(true);
    const [isCheetsLoading, setCheetsLoading] = useState<boolean>(false);
    const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
    const [cheets, setCheets] = useState<ICheet[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [cheetsError, setCheetsError] = useState<string>("");

    useEffect(() => {
        axios
            .get(`${serverURL}/validate`, { withCredentials: true })
            .then(async (res: { data: IUser }) => {
                setCheetsLoading(true);
                setUserId(res.data.id);
                await axios
                    .get(`${serverURL}/cheets`, { withCredentials: true })
                    .then((res: { data: ICheet[] }) => {
                        setCheets(res.data);
                    })
                    .catch(() => {
                        setCheetsError("An unexpected error occured while loading cheets.");
                    });
                setCheetsLoading(false);
                setPageLoading(false);
            })
            .catch((error: unknown) => {
                if (axios.isAxiosError(error) && error.response?.status == 401) {
                    setUserId(undefined);
                } else {
                    handleErrors(error, 'authenticating the user', setErrors)
                }
                setPageLoading(false);
            });
    }, []);

    return (
        <Layout
            userId={userId}
            setUserId={setUserId}
            isPageLoading={isPageLoading}
            isComponentLoading={isComponentLoading || isCheetsLoading}
            setPageLoading={setPageLoading}
        >
            <div>
                <ErrorModal errors={errors} closeModal={() => setErrors([])} />
                <h1>Welcome to Chitter</h1>

                {isPageLoading ? (
                    <ClipLoader />
                ) : userId ? (
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
                    </div>
                ) : null}
            </div>
        </Layout>
    );
};

export default Homepage;
