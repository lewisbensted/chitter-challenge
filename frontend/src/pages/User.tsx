import React, { Fragment, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { IUser } from "../interfaces/interfaces";
import Layout from "./Layout";
import ErrorModal from "../components/ErrorModal";
import SubmitCheet from "../components/SendCheet";
import { serverURL } from "../config/config";
import { handleErrors } from "../utils/handleErrors";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { Box, Button, Grid2, Typography } from "@mui/material";
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

	const [scrollUp, setScrollUp] = useState<boolean>(false);
	const [scrollDown, setScrollDown] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);
	const [reloadCheetsTrigger, toggleReloadCheetsTrigger] = useState<boolean>(false);
	const [isUserLoading, setUserLoading] = useState(true);


	const divRef = useRef<HTMLDivElement>(null);

	const { id } = useParams();

	const navigate = useNavigate();

	const { userId, isValidateLoading, setUserId, setValidateLoading, validateUser } = useValidateUser();

	const {
		cheets,
		isCheetsLoading,
		cheetsLengthRef,
		errorOnModalClose,
		cheetsError,
		setCheetsError,
		setCheets,
		refreshCheets,
		loadMoreCheets,
	} = useFetchCheets();

	const {
		isUnreadMessages,
		conversations,
		isConversationsLoading,
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
		void loadMoreCheets((error) => {
			handleErrors(error, "updating cheets", setErrors);
		}, id);
	}, [id, page, loadMoreCheets]);

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

	useEffect(() => {
		if (scrollUp) {
			divRef.current?.firstElementChild?.scrollIntoView();
			setScrollUp(false);
		} else if (scrollDown) {
			divRef.current?.lastElementChild?.scrollIntoView();
			setScrollDown(false);
		}
	}, [cheets, scrollUp, scrollDown]);

	return (
		<Layout
			userId={userId}
			setUserId={setUserId}
			isValidationLoding={isValidateLoading}
			isComponentLoading={isComponentLoading}
			setPageLoading={setValidateLoading}
			isUnreadMessages={isUnreadMessages}
		>
			<Box>
				<ErrorModal
					errors={errors}
					closeModal={() => {
						setErrors([]);
						setCheetsError('An unexpected error occured while loading cheets.');
						errorOnModalClose.current = false;
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
							{!conversations || userId === id ? null : (
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
								/>
							)}
						</Typography>

						{isCheetsLoading ? (
							<FlexBox>
								<FlexBox>
									<CircularProgress thickness={5} />
								</FlexBox>
							</FlexBox>
						) : cheetsError ? (
							<Typography variant="subtitle1">{cheetsError}</Typography>
						) : (
							<Grid2 ref={divRef} sx={{ overflowY: "auto", maxHeight: 500, scrollbarGutter: "stable" }}>
								{cheets.map((cheet) => (
									<Cheet
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
							</Grid2>
						)}
						<Button
							onClick={() => {
								setPage(page + 1);
							}}
						>
							LOAD MORE
						</Button>
						{userId === id ? (
							<SubmitCheet
								setCheetsError={setCheetsError}
								isDisabled={isComponentLoading || isCheetsLoading}
								setCheets={setCheets}
								setErrors={setErrors}
								setComponentLoading={setComponentLoading}
								setScroll={setScrollUp}
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
