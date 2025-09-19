import { useCallback, useEffect, useState } from "react";
import type { UserEnhanced } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import { useError } from "../contexts/ErrorContext";
import { useNavigate } from "react-router";

interface UseFetchUserReturn {
	userEnhanced: UserEnhanced | undefined;
	isUserLoading: boolean;
	fetchUser: () => Promise<void>;
	setUserEnhanced: React.Dispatch<React.SetStateAction<UserEnhanced | undefined>>;
}

const useFetchUser = (userId?: string): UseFetchUserReturn => {
	const [userEnhanced, setUserEnhanced] = useState<UserEnhanced>();
	const [isUserLoading, setUserLoading] = useState(true);
	const { handleErrors } = useError();
	const navigate = useNavigate();


	const fetchUser = useCallback(async () => {
		if (!userId) return;
		try {
			const res = await axios.get<UserEnhanced>(`${serverURL}/api/users/${userId}`, {
				withCredentials: true,
			});
			setUserEnhanced({ ...res.data });
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				void navigate("/");
			} else {
				handleErrors(error, "fetching page information");
			}
		} finally {
			setUserLoading(false);
		}
	}, [handleErrors, navigate, userId]);

	useEffect(() => {
		if (!userId) return;
		void fetchUser();
	}, [userId, navigate, handleErrors]);

	return { userEnhanced, isUserLoading, fetchUser, setUserEnhanced };
};

export default useFetchUser;
