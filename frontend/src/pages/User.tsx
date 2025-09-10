import React, { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import type { ICheet, IUser } from "../interfaces/interfaces";
import SendCheet from "../components/SendCheet";
import { serverURL } from "../config/config";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { Box, Typography } from "@mui/material";
import ConversationIcon from "../components/ConversationIcon";
import Cheet from "../components/Cheet";
import FlexBox from "../styles/FlexBox";
import useFetchCheets from "../hooks/useFetchCheets";
import useFetchConversations from "../hooks/useFetchConversations";
import CheetModal from "../components/CheetModal";
import { useAuth } from "../contexts/AuthContext";
import { useError } from "../contexts/ErrorContext";
import ScrollGrid from "../styles/ScrollGrid";

const User: React.FC = () => {
	const [username, setUsername] = useState<string>();
	const [isUserLoading, setUserLoading] = useState(true);
	const [selectedCheet, setSelectedCheet] = useState<ICheet | null>();

	const { id } = useParams();

	const navigate = useNavigate();

	const { cheets, isCheetsLoading, cheetsError, hasNextPage, setCheetsError, setCheets, setPage } =
		useFetchCheets(id);

	const { conversations, isConversationsLoading, setConversations, toggleConversationsTrigger } =
		useFetchConversations(id);

	const { userId, isComponentLoading } = useAuth();

	const { setErrors, handleErrors } = useError();

	useEffect(() => {
		if (!id) return;
		const fetchUser = async () => {
			try {
				const res = await axios.get<IUser>(`${serverURL}/api/user/${id}`, { withCredentials: true });
				setUsername(res.data.username);
			} catch (error) {
				if (axios.isAxiosError(error) && error.response?.status === 404) {
					void navigate("/");
				} else {
					handleErrors(error, "fetching page information");
				}
			} finally {
				setUserLoading(false);
			}
		};
		void fetchUser();
	}, [id, navigate, handleErrors]);


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
			
			{isUserLoading || isConversationsLoading ? (
				<FlexBox>
					<CircularProgress thickness={5} />
				</FlexBox>
			) : (
				<Fragment>
					<Typography variant="h4" display="flex">
						{username}
						{userId && userId !== id && conversations[0] && (
							<ConversationIcon
								
								conversation={conversations[0]}
								isDisabled={isComponentLoading || isConversationsLoading}
								
								setConversations={() => {
									setConversations(conversations);
								}}
								
								toggleConversationsTrigger={toggleConversationsTrigger}
							/>
						)}
					</Typography>

					{cheetsError ? (
						<Typography variant="subtitle1">{cheetsError}</Typography>
					) : (
						<ScrollGrid ref={listRef} >
							{cheets.map((cheet, index) => (
								<Cheet
									ref={cheets.length === index + 1 ? lastCheetRef : undefined}
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
					{userId === id && !cheetsError && (
						<SendCheet
							setCheetsError={setCheetsError}
							isDisabled={isComponentLoading || isCheetsLoading}
							setCheets={setCheets}
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
				</Fragment>
			)}
		</Box>
	);
};

export default User;
