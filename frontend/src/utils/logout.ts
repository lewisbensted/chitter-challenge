import axios from "axios";
import { serverURL } from "../config/config";
import { handleErrors, logErrors } from "./handleErrors";

const logout = async (
	setPageLoading: React.Dispatch<React.SetStateAction<boolean>>,
	setUserId: React.Dispatch<React.SetStateAction<string | null | undefined>>,
	setErrors: React.Dispatch<React.SetStateAction<string[]>>,
	redirect: () => void
) => {
	try {
		setPageLoading(true);
		await axios.delete(`${serverURL}/logout`, { withCredentials: true });
		setUserId(null);
		redirect();
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 403) {
			setUserId(null);
			redirect();
		} else {
			handleErrors(error, "logging out", setErrors);
		}
	} finally {
		setPageLoading(false);
	}
};

export default logout;
