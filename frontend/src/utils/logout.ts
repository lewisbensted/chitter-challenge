import axios from "axios";
import { serverURL } from "./serverURL";

const logout = async (
    setLoading: (arg: boolean) => void,
    setUserId: (arg?: number) => void,
    setError: (arg: string) => void
) => {
    setLoading(true);
    await axios
        .delete(`${serverURL}/logout`, { withCredentials: true })
        .then(() => {
            setUserId(undefined);
        })
        .catch(() => {
            setError("An unexpected error occurred while logging out");
        });
    setLoading(false);
};

export default logout;
