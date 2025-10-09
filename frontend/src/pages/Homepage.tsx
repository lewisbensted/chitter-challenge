import React, { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import SendCheet from "../components/SendCheet";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Box from "@mui/material/Box/Box";
import Cheet from "../components/Cheet";
import { Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import useFetchCheets from "../hooks/useFetchCheets";
import CheetModal from "../components/CheetModal";
import type { ICheet } from "../interfaces/interfaces";
import { useAuth } from "../contexts/AuthContext";
import { useError } from "../contexts/ErrorContext";
import ScrollGrid from "../styles/ScrollGrid";

const Homepage: React.FC = () => {
	const { userId } = useAuth();
	const { setErrors } = useError();
	const [selectedCheet, setSelectedCheet] = useState<ICheet | null>();

	const { cheets, isCheetsLoading, cheetsError, setCheetsError, setCheets, setPage, hasNextPage, page } =
		useFetchCheets();

	const [scrollTrigger, toggleScrollTrigger] = useState<boolean>(false);

	const listRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		requestAnimationFrame(() => {
			if (listRef.current) {
				listRef.current.scrollTo({ top: 0, behavior: "smooth" });
			}
		});
	}, [scrollTrigger]);

	const observer = useRef<IntersectionObserver>();
	const lastCheetRef = useCallback(
		(cheet: HTMLElement | null) => {
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((cheets) => {
				if (isCheetsLoading) return;
				if (cheets[0].isIntersecting && hasNextPage) {
					setPage((page) => page + 1);
				}
			});
			if (cheet) observer.current.observe(cheet);
		},
		[isCheetsLoading, hasNextPage, setPage]
	);

	const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
	useEffect(() => {
		if (!isCheetsLoading) setHasFetchedOnce(true);
	}, [isCheetsLoading]);

	return (
		<Box>
			<Typography variant="h4">Welcome to Chitter</Typography>

			<ScrollGrid ref={listRef}>
				{hasFetchedOnce && (
					<Fragment>
						{((page === 0 && !isCheetsLoading) || page > 0) &&
							cheets.length > 0 &&
							cheets.map((cheet, index) => (
								<Cheet
									ref={cheets.length === index + 1 ? lastCheetRef : null}
									key={cheet.uuid}
									cheet={cheet}
									userId={userId}
									setCheets={setCheets}
									setErrors={setErrors}
									isModalView={false}
									numberOfCheets={cheets.length}
									setSelectedCheet={setSelectedCheet}
								/>
							))}
						{page === 0 && !isCheetsLoading && !cheets.length && (
							<Typography variant="subtitle1">{cheetsError || "No cheets to display."}</Typography>
						)}
					</Fragment>
				)}

				{isCheetsLoading && (
					<FlexBox>
						<CircularProgress thickness={5} />
					</FlexBox>
				)}
			</ScrollGrid>

			{userId && !cheetsError && (
				<SendCheet
					setCheets={setCheets}
					setCheetsError={setCheetsError}
					setErrors={setErrors}
					triggerScroll={toggleScrollTrigger}
				/>
			)}

			{selectedCheet && (
				<CheetModal
					cheet={selectedCheet}
					isOpen={!!selectedCheet}
					setCheets={setCheets}
					numberOfCheets={cheets.length}
					setSelectedCheet={setSelectedCheet}
				/>
			)}
		</Box>
	);
};

export default Homepage;
