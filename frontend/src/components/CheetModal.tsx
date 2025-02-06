import React, { useEffect, useState } from "react";
import { ICheet, IReply } from "../utils/interfaces";
import axios from "axios";
import ErrorModal from "./ErrorModal";
import { serverURL } from "../utils/serverURL";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Close from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog/Dialog";
import { Box, Divider, Grid2, ThemeProvider, Typography } from "@mui/material";
import Reply from "./Reply";
import theme from "../styles/theme";
import Cheet from "./Cheet";
import SendReply from "./SendReply";
import FlexBox from "../styles/FlexBox";

interface Props {
	userId?: string;
	cheet: ICheet;
	isOpen: boolean;
	closeModal: () => void;
	setCheets: (arg: ICheet[]) => void;
	isComponentLoading: boolean;
	setComponentLoading: (arg: boolean) => void;
}

const CheetModal: React.FC<Props> = ({
	userId,
	cheet,
	isOpen,
	closeModal,
	setCheets,
	setComponentLoading,
	isComponentLoading,
}) => {
	const [errors, setErrors] = useState<string[]>([]);
	const [replies, setReplies] = useState<IReply[]>();
	const [repliesError, setRepliesError] = useState<string>();
	const [isRepliesLoading, setRepliesLoading] = useState<boolean>(true);

	useEffect(() => {
		if (isOpen) {
			setComponentLoading(true);
			axios
				.get(`${serverURL}/cheets/${cheet.uuid}/replies`, {
					withCredentials: true,
				})
				.then((res: { data: IReply[] }) => {
					setReplies(res.data);
					setRepliesLoading(false);
					setComponentLoading(false);
				})
				.catch(() => {
					setRepliesError("An unexpected error occured while loading replies.");
					setRepliesLoading(false);
					setComponentLoading(false);
				});
		}
	}, [isOpen, cheet.uuid, setComponentLoading]);

	return (
		<ThemeProvider theme={theme}>
			<Dialog open={isOpen} fullWidth maxWidth="md">
				<ErrorModal
					errors={errors}
					closeModal={() => {
						setErrors([]);
					}}
				/>
				<Grid2 container marginInline={2} marginTop={1}>
					<Grid2 size={11} />
					<Grid2 size={1} display='flex' justifyContent='flex-end'>
						<IconButton onClick={closeModal} disabled={isComponentLoading} color="primary">
							<Close />
						</IconButton>
					</Grid2>
					<Grid2 marginInline={3} size={12}>
						<Cheet
							cheet={cheet}
							userId={userId}
							setCheets={setCheets}
							setErrors={setErrors}
							setComponentLoading={setComponentLoading}
							isComponentLoading={isComponentLoading}
							isModalView={true}
							closeModal={closeModal}
						/>
						<Divider />

						{isRepliesLoading ? (
							<FlexBox>
								<CircularProgress thickness={5} />
							</FlexBox>
						) : repliesError ? (
							<Typography variant="subtitle1">{repliesError}</Typography>
						) : (
							<Box sx={{ overflowY: "auto", maxHeight: 400 }}>
								{replies?.map((reply) => (
									<Reply
										key={reply.uuid}
										isComponentLoading={isComponentLoading}
										userId={userId}
										cheetId={cheet.uuid}
										reply={reply}
										setReplies={setReplies}
										setErrors={setErrors}
										setComponentLoading={setComponentLoading}
									/>
								))}
							</Box>
						)}

						{userId ? (
							<SendReply
								cheetId={cheet.uuid}
								isDisabled={isComponentLoading}
								setReplies={setReplies}
								setErrors={setErrors}
								setComponentLoading={setComponentLoading}
							/>
						) : null}
					</Grid2>
				</Grid2>
			</Dialog>
		</ThemeProvider>
	);
};

export default CheetModal;
