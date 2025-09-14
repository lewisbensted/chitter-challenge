import React, { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import type { ICheet, IUser } from "../interfaces/interfaces";
import SendCheet from "../components/SendCheet";
import { serverURL } from "../config/config";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { Box, IconButton, Typography } from "@mui/material";
import ConversationIcon from "../components/ConversationIcon";
import Cheet from "../components/Cheet";
import FlexBox from "../styles/FlexBox";
import useFetchCheets from "../hooks/useFetchCheets";
import useFetchConversations from "../hooks/useFetchConversations";
import CheetModal from "../components/CheetModal";
import { useAuth } from "../contexts/AuthContext";
import { useError } from "../contexts/ErrorContext";
import ScrollGrid from "../styles/ScrollGrid";
import FollowIcon from "../components/FollowIcon";

const User: React.FC = () => {
	const [user, setUser] = useState<IUser>();
	const [isFollowing, setFollowing] = useState<boolean>();
	const [isUserLoading, setUserLoading] = useState(true);
	const [selectedCheet, setSelectedCheet] = useState<ICheet | null>();

	const { id } = useParams();

	const navigate = useNavigate();

	const { cheets, isCheetsLoading, cheetsError, hasNextPage, setCheetsError, setCheets, setPage } =
		useFetchCheets(id);

	const { conversations, isConversationsLoading, setConversations, toggleConversationsTrigger } =
		useFetchConversations(id);

	const { userId } = useAuth();

	const { setErrors, handleErrors } = useError();

	useEffect(() => {
		if (!id) return;
		const fetchUser = async () => {
			try {
				const res = await axios.get<{ user: IUser; isFollowing?: boolean }>(`${serverURL}/api/users/${id}`, {
					withCredentials: true,
				});
				setUser(res.data.user);
				if (userId) setFollowing(res.data.isFollowing);
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
					{user && (
						<Typography variant="h4" display="flex">
							{user.username}
							{userId && userId !== id && conversations[0] && (
								<ConversationIcon
									conversation={conversations[0]}
									setConversations={() => {
										setConversations(conversations);
									}}
									toggleConversationsTrigger={toggleConversationsTrigger}
								/>
							)}
							{userId && userId !== id && isFollowing!==undefined && (
								<FollowIcon user={user} isFollowing={isFollowing} setFollowing={setFollowing} />
							)}
						</Typography>
					)}

					{cheetsError ? (
						<Typography variant="subtitle1">{cheetsError}</Typography>
					) : (
						<ScrollGrid ref={listRef}>
							{cheets.map((cheet, index) => (
								<Cheet
									ref={cheets.length === index + 1 ? lastCheetRef : undefined}
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
