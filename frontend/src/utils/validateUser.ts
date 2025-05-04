import axios from "axios";
import { serverURL } from "./serverURL";
import { handleErrors } from "./handleErrors";

const validateUser = async (handleValid: any, handleInvalid: () => void, setValidateLoading: any, setErrors: any) => {
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
		setValidateLoading(false);
	}
};

export default validateUser;
