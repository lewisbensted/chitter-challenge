import axios from "axios";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import ErrorModal from "../components/ErrorModal";
import Layout from "./Layout";
import { serverURL } from "../utils/serverURL";

interface LoginFormFields {
    username: string;
    password: string;
}

const Login: React.FC = () => {
    const { register, handleSubmit, reset } = useForm<LoginFormFields>();
    const navigate = useNavigate();

    const [isPageLoading, setPageLoading] = useState<boolean>(true);
    const [isFormLoading, setFormLoading] = useState<boolean>(false);
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        axios
            .get(`${serverURL}/validate`, { withCredentials: true })
            .then(() => {
                navigate("/");
            })
            .catch((error: unknown) => {
                if (axios.isAxiosError(error) && error.response?.status == 401) {
                    setUserId(undefined);
                } else if (axios.isAxiosError(error) && error.code == "ERR_NETWORK") {
                    setErrors(["Network Error: Servers unreachable."]);
                } else {
                    setErrors(["An unexpected error occured while authenticating the user."]);
                }
                setPageLoading(false);
            });
    }, []);

    const onSubmit: SubmitHandler<LoginFormFields> = (data) => {
        setFormLoading(true);
        reset();
        axios
            .post(`${serverURL}/login`, data, { withCredentials: true })
            .then(() => {
                navigate("/");
            })
            .catch((error: unknown) => {
                axios.isAxiosError(error) && [400, 401, 403, 404].includes(error.response?.status!)
                    ? setErrors(error.response?.data)
                    : setErrors(["An unexpected error occured while logging in."]);
                setFormLoading(false);
            });
    };

    return (
        <Layout
            isPageLoading={isPageLoading}
            isComponentLoading={isFormLoading}
            setLoading={setPageLoading}
            userId={userId}
            setUserId={setUserId}
        >
            <div>
                <ErrorModal errors={errors} closeModal={() => setErrors([])} />
                <h1>Login Page</h1>
                {isPageLoading ? (
                    <ClipLoader />
                ) : (
                    <div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            Username:
                            <input {...register("username")} type="text" />
                            {"\n"}
                            Password:
                            <input {...register("password")} type="text" />
                            {isFormLoading ? <ClipLoader /> : <input type="submit" disabled={userId != undefined} />}
                        </form>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Login;
