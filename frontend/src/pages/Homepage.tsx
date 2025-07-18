import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import SendCheet from "../components/SendCheet";
import ErrorModal from "../components/ErrorModal";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Box from "@mui/material/Box/Box";
import Cheet from "../components/Cheet";
import { Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import useFetchCheets from "../hooks/useFetchCheets";
import CheetModal from "../components/CheetModal";
import { ICheet } from "../interfaces/interfaces";
import { useAuth } from "../contexts/AuthContext";
import { useError } from "../contexts/ErrorContext";
import ScrollGrid from "../styles/ScrollGrid";

const Homepage: React.FC = () => {
	const { userId, isComponentLoading } = useAuth();
	const { errors, setErrors, clearErrors } = useError();
	const [selectedCheet, setSelectedCheet] = useState<ICheet | null>();

	const { cheets, isCheetsLoading, cheetsError, setCheetsError, setCheets, setPage, hasNextPage } = useFetchCheets();

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

	return (
		<Box>
			<ErrorModal errors={errors} closeModal={clearErrors} />

			<Typography variant="h4">Welcome to Chitter</Typography>
			{cheetsError ? (
				<Typography variant="subtitle1">{cheetsError}</Typography>
			) : (
				<ScrollGrid ref={listRef}>
					{cheets.map((cheet, index) => (
						<Cheet
							ref={cheets.length === index + 1 ? lastCheetRef : null}
							key={cheet.uuid}
							cheet={cheet}
							userId={userId}
							setCheets={setCheets}
							setErrors={setErrors}
							isDisabled={isComponentLoading || isCheetsLoading}
							isModalView={false}
							numberOfCheets={cheets.length}
							setSelectedCheet={setSelectedCheet}
						/>
					))}
					{isCheetsLoading && (
						<FlexBox>
							<CircularProgress thickness={5} />
						</FlexBox>
					)}
				</ScrollGrid>
			)}

			{userId && !cheetsError && (
				<SendCheet
					isDisabled={isComponentLoading || isCheetsLoading}
					setCheets={setCheets}
					setCheetsError={setCheetsError}
					setErrors={setErrors}
					triggerScroll={toggleScrollTrigger}
				/>
			)}

			{selectedCheet && (
				<CheetModal
					cheet={selectedCheet}
					cheets={cheets}
					isOpen={!!selectedCheet}
					setCheets={setCheets}
					isDisabled={isComponentLoading || isCheetsLoading}
					numberOfCheets={cheets.length}
					setSelectedCheet={setSelectedCheet}
				/>
			)}
		</Box>
	);
};

export default Homepage;
