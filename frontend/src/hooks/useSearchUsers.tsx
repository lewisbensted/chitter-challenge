import { useCallback, useState } from "react";
import type { IUser, UserEnhanced } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import { useIsMounted } from "../utils/isMounted";
import { useError } from "../contexts/ErrorContext";

interface UseSearchUsersReturn {
	users: { user: IUser; isFollowing: boolean | null }[];
	isSearchLoading: boolean;
	searchUsers: (searchString: string) => Promise<void>;
	setUsers: React.Dispatch<React.SetStateAction<UserEnhanced[]>>;
}

const useSearchUsers = (): UseSearchUsersReturn => {
	const [isSearchLoading, setSearchLoading] = useState<boolean>(false);
	const [users, setUsers] = useState<UserEnhanced[]>([]);

	const { handleErrors } = useError();

	const isMounted = useIsMounted();

	const searchUsers = useCallback(
		async (searchString: string) => {
			if (isMounted.current) setSearchLoading(true);
			try {
				const res = await axios.get<UserEnhanced[]>(`${serverURL}/api/users?search=${searchString}`, {
					withCredentials: true,
				});
				const userMap = new Map<string, UserEnhanced>(
					res.data.map((item) => [item.user.uuid, { user: item.user, isFollowing: item.isFollowing }])
				);
				if (isMounted.current) setUsers(Array.from(userMap.values()));
			} catch (error) {
				if (isMounted.current) handleErrors(error, "search users", false);
			} finally {
				if (isMounted.current) setSearchLoading(false);
			}
		},
		[handleErrors]
	);

	return { users, isSearchLoading, searchUsers, setUsers };
};

export default useSearchUsers;
