import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { IUser } from "../interfaces/interfaces";
import Layout from "./Layout";
import ErrorModal from "../components/ErrorModal";
import SendCheet from "../components/SendCheet";
import { serverURL } from "../config/config";
import { handleErrors } from "../utils/handleErrors";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { Box, Grid2, Typography } from "@mui/material";
import ConversationIcon from "../components/ConversationIcon";
import Cheet from "../components/Cheet";
import FlexBox from "../styles/FlexBox";
import useValidateUser from "../hooks/useValidateUser";
import useFetchCheets from "../hooks/useFetchCheets";
import useFetchConversations from "../hooks/useFetchConversations";

const User: React.FC = () => {
	const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
	const [username, setUsername] = useState<string>();
	const [errors, setErrors] = useState<string[]>([]);
	const [reloadMessagesTrigger, toggleReloadMessagesTrigger] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);
	const [reloadCheetsTrigger, toggleReloadCheetsTrigger] = useState<boolean>(false);
	const [isUserLoading, setUserLoading] = useState(true);

	const { id } = useParams();

	const navigate = useNavigate();

	const { userId, isValidateLoading, setUserId, setValidateLoading, validateUser } = useValidateUser();

	const {
		cheets,
		isCheetsLoading,
		cheetsLengthRef,
		cheetsErrorOnClose,
		cheetsError,
		hasNextPage,
		setCheetsError,
		setCheets,
		refreshCheets,
		fetchCheets,
	} = useFetchCheets();

	const {
		isUnreadMessages,
		conversations,
		isConversationsLoading,
		conversationErrorOnClose,
		setConversations,
		setConversationsLoading,
		fetchData,
	} = useFetchConversations();

	useEffect(() => {
		void validateUser((error) => {
			handleErrors(error, "fetching page information", setErrors);
		});
	}, [validateUser]);

	useEffect(() => {
		if (!id) return;
		const fetchUser = async () => {
			try {
				const res = await axios.get<IUser>(`${serverURL}/user/${id}`, { withCredentials: true });
				setUsername(res.data.username);
			} catch (error) {
				if (axios.isAxiosError(error) && error.response?.status === 404) {
					navigate("/");
				} else {
					handleErrors(error, "fetching page information", setErrors);
				}
			} finally {
				setUserLoading(false);
			}
		};
		void fetchUser();
	}, [id, navigate]);

	useEffect(() => {
		if (!id) return;
		void fetchCheets((error) => {
			handleErrors(error, "updating cheets", setErrors);
		}, id);
	}, [id, page, fetchCheets]);

	const hasFetchedCheetsOnce = useRef<boolean>(false);

	useEffect(() => {
		if (!id) return;
		if (!hasFetchedCheetsOnce.current) {
			hasFetchedCheetsOnce.current = true;
			return;
		}
		void refreshCheets(
			(error) => {
				handleErrors(error, "updating cheets", setErrors);
			},
			setComponentLoading,
			id
		);
	}, [id, reloadCheetsTrigger, refreshCheets]);

	useEffect(() => {
		if (userId === undefined) {
			return;
		} else if (userId === null) {
			setConversationsLoading(false);
			return;
		}

		void fetchData(
			(error) => {
				handleErrors(error, "fetching messages", setErrors);
			},
			setComponentLoading,
			{ id: id }
		);
	}, [id, userId, reloadMessagesTrigger, navigate, setConversationsLoading, fetchData]);

	const listRef = useRef<HTMLDivElement>(null);
	const scrollToTop = () => {
		if (listRef.current) {
			listRef.current.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const observer = useRef<IntersectionObserver>();
	const lastCheetRef = useCallback(
		(cheet: HTMLElement | null) => {
			if (isCheetsLoading) return;
			if (observer.current) observer.current.disconnect();

			observer.current = new IntersectionObserver((cheets) => {
				console.log(cheet);
				if (cheets[0].isIntersecting && hasNextPage) {
					setPage((page) => page + 1);
				}
			});
			if (cheet) observer.current.observe(cheet);
		},
		[isCheetsLoading, hasNextPage]
	);

	return (
		<Layout
			userId={userId}
			setUserId={setUserId}
			isValidationLoading={isValidateLoading}
			isComponentLoading={isComponentLoading}
			setPageLoading={setValidateLoading}
			isUnreadMessages={isUnreadMessages}
		>
			<Box>
				<ErrorModal
					errors={errors}
					closeModal={() => {
						setErrors([]);
						if (cheetsErrorOnClose.current) {
							setCheetsError("An unexpected error occured while loading cheets.");
							cheetsErrorOnClose.current = false;
						}
					}}
				/>
				{isValidateLoading || isUserLoading || isConversationsLoading ? (
					<FlexBox>
						<CircularProgress thickness={5} />
					</FlexBox>
				) : (
					<Fragment>
						<Typography variant="h4" display="flex">
							{username}
							{userId === id ? null : (
								<ConversationIcon
									userId={userId}
									conversation={conversations[0]}
									isComponentLoading={isComponentLoading || isCheetsLoading}
									setComponentLoading={setComponentLoading}
									setConversations={() => {
										setConversations(conversations);
									}}
									reloadTrigger={reloadMessagesTrigger}
									toggleReloadTrigger={toggleReloadMessagesTrigger}
									conversationErrorOnClose={conversationErrorOnClose}
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
										isComponentLoading={isComponentLoading}
										isModalView={false}
										numberOfCheets={cheets.length}
										reloadTrigger={reloadCheetsTrigger}
										toggleReloadTrigger={toggleReloadCheetsTrigger}
									/>
								))}
								{isCheetsLoading ? (
									<FlexBox>
										<CircularProgress thickness={5} />
									</FlexBox>
								) : null}
							</Grid2>
						)}
						{userId === id && !cheetsError ? (
							<SendCheet
								setCheetsError={setCheetsError}
								isDisabled={isComponentLoading || isCheetsLoading}
								setCheets={setCheets}
								setErrors={setErrors}
								setComponentLoading={setComponentLoading}
								scroll={scrollToTop}
								cheetsLengthRef={cheetsLengthRef}
							/>
						) : null}
					</Fragment>
				)}
			</Box>
		</Layout>
	);
};

export default User;
