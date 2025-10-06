import { useCallback, useEffect, useState } from "react";
import type { IUserEnhanced } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import { useNavigate } from "react-router";
import { useIsMounted } from "../utils/isMounted";
import { logErrors } from "../utils/processErrors";

interface UseFetchUserReturn {
	userEnhanced: IUserEnhanced | undefined;
	isUserLoading: boolean;
	fetchUser: () => Promise<void>;
	setUserEnhanced: React.Dispatch<React.SetStateAction<IUserEnhanced | undefined>>;
}

const useFetchUser = (userId?: string): UseFetchUserReturn => {
	const [userEnhanced, setUserEnhanced] = useState<IUserEnhanced>();
	const [isUserLoading, setUserLoading] = useState(true);

	const navigate = useNavigate();

	const isMounted = useIsMounted();

	const fetchUser = useCallback(async () => {
		if (!userId) return;
		try {
			const res = await axios.get<IUserEnhanced>(`${serverURL}/api/users/${userId}`, {
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
	}, [userId, navigate]);

	useEffect(() => {
		void fetchUser();
	}, [fetchUser]);

	return { userEnhanced, isUserLoading, fetchUser, setUserEnhanced };
};

export default useFetchUser;
