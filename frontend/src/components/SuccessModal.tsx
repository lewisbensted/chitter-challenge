import React from "react";
import Dialog from "@mui/material/Dialog/Dialog";
import { Button, Typography, ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import FlexBox from "../styles/FlexBox";

interface Props {
	isOpen: boolean;
	message: string;
	closeModal: () => void;
}

const SuccessModal: React.FC<Props> = ({ isOpen, message, closeModal }) => (
	<ThemeProvider theme={theme}>
		<Dialog open={isOpen}>
			<Typography variant="h4">Success!</Typography>
			<Typography variant="subtitle1">{message}</Typography>
			<FlexBox>
				<Button onClick={closeModal} variant="contained">
					<Typography variant="button">Ok</Typography>
				</Button>
			</FlexBox>
		</Dialog>
	</ThemeProvider>
);

export default SuccessModal;
