import axios from "axios";
import { serverURL } from "../config/config";
import { handleErrors } from "./handleErrors";

const logout = async (
	setPageLoading: (arg: boolean) => void,
	setUserId: (arg: string | null) => void,
	setErrors: (arg: string[]) => void,
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
