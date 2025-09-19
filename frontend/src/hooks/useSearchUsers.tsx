import { useCallback, useState } from "react";
import type { IUser, UserEnhanced } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import toast from "react-hot-toast";
import { useError } from "../contexts/ErrorContext";

interface UseSearchUsersReturn {
	users: { user: IUser; isFollowing: boolean | null }[];
	isSearchLoading: boolean;
	searchUsers: (searchString: string) => Promise<void>;
	setUsers : React.Dispatch<React.SetStateAction<UserEnhanced[]>>;
}

const useSearchUsers = (): UseSearchUsersReturn => {
	const [isSearchLoading, setSearchLoading] = useState<boolean>(false);
	const [users, setUsers] = useState<{ user: IUser; isFollowing: boolean | null }[]>([]);
	const { handleErrors } = useError();

	const searchUsers = useCallback(async (searchString: string) => {
		setSearchLoading(true);
		try {
			const res = await axios.get<{ user: IUser; isFollowing: boolean | null }[]>(
				`${serverURL}/api/users?search=${searchString}`,
				{ withCredentials: true }
			);
			const userMap = new Map<string, { user: IUser; isFollowing: boolean | null }>(
				res.data.map((item) => [item.user.uuid, { user: item.user, isFollowing: item.isFollowing ?? null }])
			);
			setUsers(Array.from(userMap.values()));
		} catch (error) {
			toast("failed to search for users");
		} finally {
			setSearchLoading(false);
		}
	}, []);

	return { users, isSearchLoading, searchUsers, setUsers };
};

export default useSearchUsers;
