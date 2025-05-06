import axios from "axios";
import { serverURL } from "../config/config";
import { handleErrors } from "./handleErrors";

const validateUser = async (
	handleValid: (arg: string) => void,
	handleInvalid: () => void,
	setLoading: (arg: boolean) => void,
	setErrors: (arg: string[]) => void
) => {
	try {
		const res = await axios.get<string>(`${serverURL}/validate`, { withCredentials: true });
		handleValid(res.data);
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 401) {
			handleInvalid();
		} else {
			handleErrors(error, "authenticating user", setErrors);
		}
	} finally {
		setLoading(false);
	}
};

export default validateUser;
