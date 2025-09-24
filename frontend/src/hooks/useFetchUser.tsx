import { useCallback, useEffect, useState } from "react";
import type { UserEnhanced } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import { useNavigate } from "react-router";
import { useIsMounted } from "../utils/isMounted";
import { logErrors } from "../utils/processErrors";

interface UseFetchUserReturn {
	userEnhanced: UserEnhanced | undefined;
	isUserLoading: boolean;
	fetchUser: () => Promise<void>;
	setUserEnhanced: React.Dispatch<React.SetStateAction<UserEnhanced | undefined>>;
}

const useFetchUser = (userId?: string): UseFetchUserReturn => {
	const [userEnhanced, setUserEnhanced] = useState<UserEnhanced>();
	const [isUserLoading, setUserLoading] = useState(true);

	const navigate = useNavigate();

	const isMounted = useIsMounted();

	const fetchUser = useCallback(async () => {
		if (!userId) return;
		try {
			const res = await axios.get<UserEnhanced>(`${serverURL}/api/users/${userId}`, {
				withCredentials: true,
			});
			if (isMounted.current) setUserEnhanced({ ...res.data });
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				void navigate("/");
			} else {
				logErrors(error);
			}
		} finally {
			if (isMounted.current) setUserLoading(false);
		}
	}, [ navigate, userId, isMounted]);

	useEffect(() => {
		if (!userId) return;
		void fetchUser();
	}, [userId, navigate, fetchUser]);

	return { userEnhanced, isUserLoading, fetchUser, setUserEnhanced };
};

export default useFetchUser;
