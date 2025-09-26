import axios from "axios";
import { serverURL } from "../config/config";
import { SPINNER_DURATION } from "../config/layout";

const logout = async (
	setUserId: React.Dispatch<React.SetStateAction<string | null | undefined>>,
	handleErrors: (errors: unknown, action: string) => void,
	setLoggingOut: React.Dispatch<React.SetStateAction<boolean>>,
	setLoadingTimer: React.Dispatch<React.SetStateAction<boolean>>
) => {
	try {
		setLoggingOut(true);
		setLoadingTimer(true);

		await axios.delete(`${serverURL}/api/logout`, { withCredentials: true });
		setUserId(null);
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 403) {
			setUserId(null);
		} else {
			handleErrors(error, "log out");
			setLoadingTimer(false);
		}
	} finally {
		setTimeout(()=>{ setLoggingOut(false); }, SPINNER_DURATION);
	}
};

export default logout;
