import axios from "axios";
import { serverURL } from "../config/config";

const logout = async (
	setUserId: React.Dispatch<React.SetStateAction<string | null | undefined>>,
	handleErrors: (errors: unknown, action: string) => void,
	setLoggingOut: React.Dispatch<React.SetStateAction<boolean>>,
	setLoadingTimer: React.Dispatch<React.SetStateAction<boolean>>
) => {
	try {
		setLoggingOut(true);
		setLoadingTimer(true);

		await axios.delete(`${serverURL}/logout`, { withCredentials: true });
		setUserId(null);
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 403) {
			setUserId(null);
		} else {
			handleErrors(error, "logging out");
			setLoadingTimer(false);
		}
	} finally {
		setTimeout(()=>{ setLoggingOut(false); }, 500);
	}
};

export default logout;
