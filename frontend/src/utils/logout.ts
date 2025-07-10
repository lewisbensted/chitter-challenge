import axios from "axios";
import { serverURL } from "../config/config";

const logout = async (
	setLoading: React.Dispatch<React.SetStateAction<boolean>>,
	setUserId: React.Dispatch<React.SetStateAction<string | null | undefined>>,
	handleErrors: (errors: unknown, action: string) => void,
	redirect: () => void
) => {
	try {
		setLoading(true);
		await new Promise((res) => setTimeout(res, 500));
		await axios.delete(`${serverURL}/logout`, { withCredentials: true });
		setUserId(null);
		redirect();
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 403) {
			setUserId(null);
			redirect();
		} else {
			handleErrors(error, "logging out");
		}
	} finally {
		setLoading(false);
	}
};

export default logout;
