import axios from "axios";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import ErrorModal from "../components/ErrorModal";
import { ClipLoader } from "react-spinners";
import SuccessModal from "../components/SuccessModal";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../utils/serverURL";

interface RegisterFormFields {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    email: string;
}

const Register: React.FC = () => {
    const { register, handleSubmit, reset } = useForm<RegisterFormFields>();
    const navigate = useNavigate();

    const [isLoading, setLoading] = useState<boolean>(true);
    const [isFormLoading, setFormLoading] = useState<boolean>(false);
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [errors, setErrors] = useState<string[]>([]);
    const [success, setSuccess] = useState<boolean>(false);

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
                setLoading(false);
            });
    }, []);

    const onSubmit: SubmitHandler<RegisterFormFields> = async (data) => {
        setFormLoading(true);
        reset();
        await axios
            .post(`${serverURL}/register`, data)
            .then(() => {
                setSuccess(true);
            })
            .catch((error: unknown) => {
                axios.isAxiosError(error) && error.response?.status == 400
                    ? setErrors(error.response.data)
                    : setErrors(["An unexpected error occured while registering the user."]);
            });
        setFormLoading(false);
    };

    return (
        <Layout isLoading={isLoading || isFormLoading} setLoading={setLoading} userId={userId} setUserId={setUserId}>
            <div>
                <ErrorModal errors={errors} closeModal={() => setErrors([])} />
                <SuccessModal
                    success={success}
                    closeModal={() => {
                        setSuccess(false);
                    }}
                />
                <h1>Registration Page</h1>
                {isLoading ? (
                    <ClipLoader />
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        First Name:
                        <input {...register("firstName")} type="text" />
                        Last Name:
                        <input {...register("lastName")} type="text" />
                        Username:
                        <input {...register("username")} type="text" />
                        Password:
                        <input {...register("password")} type="text" />
                        E-mail:
                        <input {...register("email")} type="text" />
                        {isFormLoading ? <ClipLoader /> : <input type="submit" disabled={userId != undefined} />}
                    </form>
                )}
            </div>
        </Layout>
    );
};

export default Register;
