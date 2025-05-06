import { useState } from "react";
import { serverURL } from "../config/config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface UseValidateUserReturn {
	userId?: string;
	isUserValidated: boolean;
	isValidateLoading: boolean;
	setUserId: (arg?: string) => void;
	setValidateLoading: (arg: boolean) => void;
	validateUser: (handleError: (error: unknown) => void, requiresAuthorisation?: boolean, requiresUnauthorisation?:boolean) => Promise<void>;
}

const useValidateUser = (): UseValidateUserReturn => {
	const [userId, setUserId] = useState<string>();
	const [isUserValidated, setUserValidated] = useState<boolean>(false);
	const [isValidateLoading, setValidateLoading] = useState(true);

	const navigate = useNavigate();

	const validateUser = async (
		handleError: (error: unknown) => void,
		requiresAuthorisation = false,
        requiresUnauthorisation = false
	): Promise<void> => {
		try {
			const res = await axios.get<string>(`${serverURL}/validate`, { withCredentials: true });
            if (requiresUnauthorisation) {
                navigate("/");
            } else {
                setUserId(res.data);
			setUserValidated(true);
            }
			setUserId(res.data);
			setUserValidated(true);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 401) {
				if (requiresAuthorisation) {
					navigate("/");
				} else {
					setUserId(undefined);
					setUserValidated(true);
				}
			} else {
				handleError(error);
			}
		} finally {
			setValidateLoading(false);
		}
	};

	return { userId, isUserValidated, isValidateLoading, setUserId, setValidateLoading, validateUser };
};

export default useValidateUser;
