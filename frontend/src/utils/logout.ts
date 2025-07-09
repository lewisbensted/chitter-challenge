import axios from "axios";
import { serverURL } from "../config/config";
import { handleErrors } from "./handleErrors";

const logout = async (
	setLoading: React.Dispatch<React.SetStateAction<boolean>>,
	setUserId: React.Dispatch<React.SetStateAction<string | null | undefined>>,
	setErrors: React.Dispatch<React.SetStateAction<string[]>>,
	redirect: () => void
) => {
	try {
		setLoading(true);
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
		setLoading(false);
	}
};

export default logout;
