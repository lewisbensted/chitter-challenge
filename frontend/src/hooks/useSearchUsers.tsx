import { useCallback, useRef, useState } from "react";
import type { IUserEnhanced } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import { useIsMounted } from "../utils/isMounted";
import { useError } from "../contexts/ErrorContext";
import { SPINNER_DURATION } from "../config/layout";
import { throwApiError } from "../utils/apiResponseError";

interface UseSearchUsersReturn {
	users: IUserEnhanced[];
	newUsers: IUserEnhanced[];
	isSearchLoading: boolean;
	searchUsers: (searchString: string, reset?: boolean) => Promise<void>;
	setUsers: React.Dispatch<React.SetStateAction<IUserEnhanced[]>>;
	hasNextPage: boolean;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	page: number;
	searchError: boolean;
}

const useSearchUsers = (): UseSearchUsersReturn => {
	const [isSearchLoading, setSearchLoading] = useState<boolean>(false);
	const [users, setUsers] = useState<IUserEnhanced[]>([]);
	const [newUsers, setNewUsers] = useState<IUserEnhanced[]>([]);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [page, setPage] = useState<number>(0);
	const cursorRef = useRef<string>();

	const [searchError, setSearchError] = useState(false);

	const { handleErrors } = useError();

	const isMounted = useIsMounted();

	const searchUsers = useCallback(
		async (searchString: string, reset = false) => {
			setSearchLoading(true);

			if (reset) {
				cursorRef.current = undefined;
				setUsers([]);
				setNewUsers([]);
			}

			const take = page === 0 ? 5 : 5;
			const params = new URLSearchParams();
			if (cursorRef.current) params.append("cursor", cursorRef.current);
			params.append("take", take.toString());
			params.append("search", searchString);

			try {
				const res = await axios.get<{ users: IUserEnhanced[]; hasNext: boolean }>(
					`${serverURL}/api/users?${params}`,
					{
						withCredentials: true,
					}
				);
				const { users, hasNext } = res.data;
				if (!Array.isArray(users) || typeof hasNext !== "boolean")
					throwApiError({ users: "array", hasNext: "boolean" }, res.data);

				if (isMounted.current) {
					setHasNextPage(hasNext);

					if (users.length) {
						const newUserMap = new Map<string, IUserEnhanced>(
							users.map((item) => [
								item.user.uuid,
								{ user: item.user, isFollowing: item.isFollowing, conversation: null },
							])
						);
						const newUsers = Array.from(newUserMap.values());
						setNewUsers(newUsers);
						setUsers((prevUsers) => (reset ? newUsers : [...prevUsers, ...newUsers]));
						cursorRef.current = newUsers[newUsers.length - 1].user.uuid;
					}
					setSearchError(false);
				}
			} catch (error) {
				setTimeout(
					() => {
						if (isMounted.current) {
							handleErrors(error, "search users", false);
							setSearchError(true);
						}
					},
					reset ? SPINNER_DURATION : 0
				);
			} finally {
				setTimeout(
					() => {
						if (isMounted.current) setSearchLoading(false);
					},
					reset ? SPINNER_DURATION : 0
				);
			}
		},
		[handleErrors, isMounted, page]
	);

	return { users, isSearchLoading, searchUsers, setUsers, hasNextPage, setPage, page, searchError, newUsers };
};

export default useSearchUsers;
