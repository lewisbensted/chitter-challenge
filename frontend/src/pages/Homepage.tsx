import React, { Fragment, useEffect, useRef, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { ICheet } from "../utils/interfaces";
import SubmitCheet from "../components/SendCheet";
import ErrorModal from "../components/ErrorModal";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Box from "@mui/material/Box/Box";
import Cheet from "../components/Cheet";
import { Button, Grid2, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";

const Homepage: React.FC = () => {
	const [userId, setUserId] = useState<string>();
	const [isPageLoading, setPageLoading] = useState<boolean>(true);
	const [isCheetsLoading, setCheetsLoading] = useState<boolean>(false);
	const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
	const [cheets, setCheets] = useState<ICheet[]>([]);
	const [errors, setErrors] = useState<string[]>([]);
	const [cheetsError, setCheetsError] = useState<string>();
	const [isUnreadMessages, setUnreadMessages] = useState<boolean>();
	const [scrollUp, setScrollUp] = useState<boolean>(false);
	const [scrollDown, setScrollDown] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);

	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		axios
			.get(`${serverURL}/validate`, { withCredentials: true })
			.then((res: { data: string }) => {
				setUserId(res.data);
			})
			.catch((error: unknown) => {
				if (axios.isAxiosError(error) && error.response?.status === 401) {
					setUserId(undefined);
				} else {
					handleErrors(error, "authenticating the user", setErrors);
				}
				setPageLoading(false);
			});
	}, []);

	useEffect(() => {
		if (userId) {
			void (async () => {
				await axios
					.get(`${serverURL}/messages/unread`, { withCredentials: true })
					.then((res: { data: boolean }) => {
						setUnreadMessages(res.data);
					})
					.catch((error: unknown) => {
						handleErrors(error, "loading user information", setErrors);
					});
				setPageLoading(false);
			})();
		}
	}, [userId]);

	useEffect(() => {
		void (async () => {
			setCheetsLoading(true);
			await axios
				.get(`${serverURL}/cheets?page=${page}&take=5`, { withCredentials: true })
				.then((res: { data: ICheet[] }) => {
					setCheets([...cheets, ...res.data]);
					setScrollDown(true)
				})
				.catch(() => {
					setCheetsError("An unexpected error occured while loading cheets.");
				});
			setCheetsLoading(false)
		})();
	}, [page]);

	useEffect(() => {
		if (scrollUp) {
			ref.current?.firstElementChild?.scrollIntoView();
			setScrollUp(false);
		} else if (scrollDown) {
			ref.current?.lastElementChild?.scrollIntoView();
			setScrollDown(false);
		}
	}, [cheets, scrollUp, scrollDown]);

	return (
		<Layout
			userId={userId}
			setUserId={setUserId}
			isPageLoading={isPageLoading}
			isComponentLoading={isComponentLoading || isCheetsLoading}
			setPageLoading={setPageLoading}
			isUnreadMessages={isUnreadMessages}
		>
			<Box>
				<ErrorModal
					errors={errors}
					closeModal={() => {
						setErrors([]);
					}}
				/>
				<Typography variant="h4">Welcome to Chitter</Typography>

				{isPageLoading ? (
					<FlexBox>
						<CircularProgress thickness={5} />
					</FlexBox>
				) : (
					<Fragment>
						{cheetsError ? (
							<Typography variant="subtitle1">{cheetsError}</Typography>
						) : (
							<Grid2 ref={ref} sx={{ overflowY: "auto", maxHeight: 500, scrollbarGutter: "stable" }}>
								{cheets?.map((cheet) => (
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
									/>
								))}
								{isCheetsLoading ? (
									<FlexBox>
										<CircularProgress thickness={5} />
									</FlexBox>
								) : null}
							</Grid2>
						)}

						<Button
							onClick={() => {
								setPage(page + 1);
							}}
						>
							LOAD MORE
						</Button>
						{userId ? (
							<SubmitCheet
								isDisabled={isComponentLoading || isCheetsLoading}
								setCheets={setCheets}
								setCheetsError={setCheetsError}
								setErrors={setErrors}
								setComponentLoading={setComponentLoading}
								setScroll={setScrollUp}
								numberOfCheets={cheets.length}
							/>
						) : null}
					</Fragment>
				)}
			</Box>
		</Layout>
	);
};

export default Homepage;
