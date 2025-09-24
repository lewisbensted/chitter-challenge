import { useCallback, useEffect, useRef, useState } from "react";
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
	displayEmpty: boolean;
}

const useSearchUsers = (): UseSearchUsersReturn => {
	const [isSearchLoading, setSearchLoading] = useState<boolean>(false);
	const [users, setUsers] = useState<UserEnhanced[]>([]);
	const [displayEmpty, setDisplayEmpty] = useState(false);

	const { handleErrors } = useError();

	const isMounted = useIsMounted();
	const displayEmptyRef = useRef(displayEmpty);

	useEffect(() => {
		displayEmptyRef.current = displayEmpty;
	}, [displayEmpty]);

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
				if (isMounted.current) {
					setUsers(Array.from(userMap.values()));
					if (!displayEmptyRef.current) setDisplayEmpty(true);
				}
			} catch (error) {
				if (isMounted.current) {
					setUsers([]);
					if (displayEmptyRef.current) setDisplayEmpty(false);
					handleErrors(error, "search users", false);
				}
			} finally {
				if (isMounted.current) setSearchLoading(false);
			}
		},
		[handleErrors, isMounted]
	);

	return { users, isSearchLoading, searchUsers, setUsers, displayEmpty };
};

export default useSearchUsers;
