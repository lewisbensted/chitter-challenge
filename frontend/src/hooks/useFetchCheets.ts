import { useCallback, useRef, useState } from "react";
import { ICheet } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import { handleErrors, logErrors } from "../utils/handleErrors";
import { useIsMounted } from "../utils/isMounted";

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

	const isMounted = useIsMounted();

	const fetchCheets = useCallback(
		async (setErrors: React.Dispatch<React.SetStateAction<string[]>>, take: number, userId?: string) => {
			try {
				setCheetsLoading(true);

				const cursorParam = cursorRef.current ? `cursor=${cursorRef.current}` : "";
				const res = await axios.get<ICheet[]>(
					`${serverURL}${userId ? `/users/${userId}` : ""}/cheets?${cursorParam}&take=${take}`,
					{
						withCredentials: true,
					}
				);

				const newCheets = res.data;

				if (!hasLoadedOnceRef.current) {
					hasLoadedOnceRef.current = true;
				}

				if (isMounted()) {
					setHasNextPage(newCheets.length >= take);

					if (newCheets.length) {
						setCheets((prevCheets) => [...prevCheets, ...newCheets]);

						cursorRef.current = newCheets[newCheets.length - 1].uuid;
					}
					setCheetsError("");
				}
			} catch (error) {
				if (!hasLoadedOnceRef.current) {
					logErrors(error);
					if (isMounted()) setCheetsError("An unexpected error occured while loading cheets.");
				} else {
					handleErrors(error, "loading cheets", setErrors);
					if (isMounted()) setHasNextPage(false);
				}
			} finally {
				if (isMounted()) setCheetsLoading(false);
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
