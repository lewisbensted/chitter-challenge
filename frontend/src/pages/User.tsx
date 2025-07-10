import React, { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ICheet, IUser } from "../interfaces/interfaces";
import ErrorModal from "../components/ErrorModal";
import SendCheet from "../components/SendCheet";
import { serverURL } from "../config/config";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { Box, Grid2, Typography } from "@mui/material";
import ConversationIcon from "../components/ConversationIcon";
import Cheet from "../components/Cheet";
import FlexBox from "../styles/FlexBox";
import useFetchCheets from "../hooks/useFetchCheets";
import useFetchConversations from "../hooks/useFetchConversations";
import CheetModal from "../components/CheetModal";
import { useAuth } from "../contexts/AuthContext";
import { useError } from "../contexts/ErrorContext";

const User: React.FC = () => {
	const [username, setUsername] = useState<string>();
	const [page, setPage] = useState<number>(0);
	const [isUserLoading, setUserLoading] = useState(true);
	const [selectedCheet, setSelectedCheet] = useState<ICheet | null>();

	const { id } = useParams();

	const navigate = useNavigate();

	const { cheets, isCheetsLoading, cheetsError, hasNextPage, setCheetsError, setCheets, fetchCheets } =
		useFetchCheets();

	const { fetchConversations, conversations, isConversationsLoading, setConversations } = useFetchConversations();

	const { userId, isValidateLoading, isComponentLoading, setComponentLoading, fetchUnread } = useAuth();

	const { errors, setErrors, clearErrors, handleErrors } = useError();

	useEffect(() => {
		if (!id) return;
		const fetchUser = async () => {
			try {
				const res = await axios.get<IUser>(`${serverURL}/user/${id}`, { withCredentials: true });
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

	useEffect(() => {
		if (!id) return;
		void fetchCheets(page === 0 ? 10 : 5, id);
	}, [id, page, fetchCheets]);

	const isFirstLoad = useRef(true);
	const [reloadUnreadTrigger, toggleUnreadTrigger] = useState<boolean>(false);
	useEffect(() => {
		if (isFirstLoad.current) {
			isFirstLoad.current = false;
			return;
		}
		void fetchUnread();
	}, [reloadUnreadTrigger, fetchUnread]);

	const [reloadConversationsTrigger, toggleConversationTrigger] = useState<boolean>(false);
	useEffect(() => {
		if (!id) return;
		void fetchConversations(id);
	}, [id, reloadConversationsTrigger, fetchConversations]);

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
		[isCheetsLoading, hasNextPage]
	);

	return (
		<Box>
			<ErrorModal errors={errors} closeModal={clearErrors} />
			{isValidateLoading || isUserLoading || isConversationsLoading ? (
				<FlexBox>
					<CircularProgress thickness={5} />
				</FlexBox>
			) : (
				<Fragment>
					<Typography variant="h4" display="flex">
						{username}
						{userId && userId !== id && conversations[0] && (
							<ConversationIcon
								userId={userId}
								conversation={conversations[0]}
								isDisabled={isComponentLoading || isConversationsLoading}
								setComponentLoading={setComponentLoading}
								setConversations={() => {
									setConversations(conversations);
								}}
								toggleUnreadTrigger={toggleUnreadTrigger}
								toggleConversationsTrigger={toggleConversationTrigger}
							/>
						)}
					</Typography>

					{cheetsError ? (
						<Typography variant="subtitle1">{cheetsError}</Typography>
					) : (
						<Grid2 ref={listRef} sx={{ overflowY: "auto", maxHeight: 500, scrollbarGutter: "stable" }}>
							{cheets.map((cheet, index) => (
								<Cheet
									ref={cheets.length === index + 1 ? lastCheetRef : undefined}
									key={cheet.uuid}
									cheet={cheet}
									userId={userId}
									setCheets={setCheets}
									setErrors={setErrors}
									setComponentLoading={setComponentLoading}
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
						</Grid2>
					)}
					{userId === id && !cheetsError && (
						<SendCheet
							setCheetsError={setCheetsError}
							isDisabled={isComponentLoading || isCheetsLoading}
							setCheets={setCheets}
							setErrors={setErrors}
							setComponentLoading={setComponentLoading}
							triggerScroll={toggleScrollTrigger}
						/>
					)}
					{selectedCheet && (
						<CheetModal
							cheet={selectedCheet}
							cheets={cheets}
							userId={userId}
							isOpen={!!selectedCheet}
							setCheets={setCheets}
							isDisabled={isComponentLoading || isCheetsLoading}
							setComponentLoading={setComponentLoading}
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
