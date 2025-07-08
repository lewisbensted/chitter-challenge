import { useCallback, useRef, useState } from "react";
import { ICheet } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import { handleErrors, logErrors } from "../utils/handleErrors";

interface UseFetchCheetsReturn {
	cheets: ICheet[];
	isCheetsLoading: boolean;
	cheetsError: string;
	setCheetsError: React.Dispatch<React.SetStateAction<string>>;
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
	fetchCheets: (
		setErrors: React.Dispatch<React.SetStateAction<string[]>>,
		take: number,
		userId?: string
	) => Promise<void>;
	hasNextPage: boolean;
}

const useFetchCheets = (): UseFetchCheetsReturn => {
	const [isCheetsLoading, setCheetsLoading] = useState<boolean>(true);
	const [cheets, setCheets] = useState<ICheet[]>([]);
	const [cheetsError, setCheetsError] = useState<string>("");
	const [hasNextPage, setHasNextPage] = useState(false);
	const cursorRef = useRef<string>();
	const hasLoadedOnceRef = useRef<boolean>(false);

	const fetchCheets = useCallback(
		async (setErrors: React.Dispatch<React.SetStateAction<string[]>>, take: number, userId?: string) => {
			try {
				setCheetsLoading(true);

				const params = new URLSearchParams();
				if (cursorRef.current) params.append("cursor", cursorRef.current);
				params.append("take", take.toString());

				const res = await axios.get<ICheet[]>(
					`${serverURL}${userId ? `/users/${userId}` : ""}/cheets?${params}`,
					{
						withCredentials: true,
					}
				);

				const newCheets = res.data;

				if (!hasLoadedOnceRef.current) {
					hasLoadedOnceRef.current = true;
				}

				setHasNextPage(newCheets.length >= take);

				if (newCheets.length) {
					setCheets((cheets) => {
						const updatedCheets = [...cheets, ...newCheets];
						return updatedCheets;
					});

					cursorRef.current = newCheets[newCheets.length - 1].uuid;
				}
				setCheetsError("");
			} catch (error) {
				if (!hasLoadedOnceRef.current) {
					logErrors(error);
					setCheetsError("An unexpected error occured while loading cheets.");
				} else {
					handleErrors(error, "loading cheets", setErrors);
					setHasNextPage(false);
				}
			} finally {
				setCheetsLoading(false);
			}
		},
		[]
	);

	return {
		cheets,
		isCheetsLoading,
		cheetsError,
		setCheets,
		setCheetsError,
		fetchCheets,
		hasNextPage,
	};
};

export default useFetchCheets;
