import { useCallback, useState } from "react";
import { serverURL } from "../config/config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface UseValidateUserReturn {
	userId: string | null | undefined;
	isValidateLoading: boolean;
	setUserId: React.Dispatch<React.SetStateAction<string | null | undefined>>;
	setValidateLoading: React.Dispatch<React.SetStateAction<boolean>>;
	validateUser: (
		handleError: (error: unknown) => void,
		extraParams?: { requiresAuthorisation?: boolean; isLoggedIn?: boolean }
	) => Promise<void>;
}

const useValidateUser = (): UseValidateUserReturn => {
	const [userId, setUserId] = useState<string | null>();
	const [isValidateLoading, setValidateLoading] = useState(true);

	const navigate = useNavigate();

	const validateUser = useCallback(
		async (
			handleError: (error: unknown) => void,
			extraParams?: { requiresAuthorisation?: boolean; isLoggedIn?: boolean }
		) => {
			const { requiresAuthorisation = false, isLoggedIn = false } = extraParams ?? {};
			try {
				setValidateLoading(true);
				const res = await axios.get<string>(`${serverURL}/validate`, { withCredentials: true });
				if (isLoggedIn) {
					navigate("/");
				}
				setUserId(res.data);
			} catch (error) {
				if (axios.isAxiosError(error) && error.response?.status === 401) {
					if (requiresAuthorisation) {
						navigate("/");
					}
					setUserId(null);
				} else {
					handleError(error);
				}
			} finally {
				setValidateLoading(false);
			}
		},
		[]
	);

	return { userId, isValidateLoading, setUserId, setValidateLoading, validateUser };
};

export default useValidateUser;
