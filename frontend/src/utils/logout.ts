import axios from "axios";
import { serverURL } from "./serverURL";

const logout = async (
    setPageLoading: (arg: boolean) => void,
    setUserId: (arg?: string) => void,
) => {
    setPageLoading(true);
    await axios
        .delete(`${serverURL}/logout`, { withCredentials: true })
        .then(() => {
            setUserId(undefined);
        })
        .catch(() => {
            setUserId(undefined);
        });
    setPageLoading(false);
};

export default logout;
