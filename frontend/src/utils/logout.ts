import axios from "axios";
import { serverURL } from "./serverURL";
import { handleErrors } from "./handleErrors";

const logout = async (
    setPageLoading: (arg: boolean) => void,
    setUserId: (arg?: string) => void,
    setErrors: (arg: string[]) => void,
    redirect: () => void
) => {
    setPageLoading(true);
    await axios
        .delete(`${serverURL}/logout`, { withCredentials: true })
        .then(() => {
            setUserId(undefined);
            redirect();
        })
        .catch((error) => {
            handleErrors(error, "logging out", setErrors);
        });
    setPageLoading(false);
};

export default logout;
