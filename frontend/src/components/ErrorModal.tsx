import React, { Fragment } from "react";
import Dialog from "@mui/material/Dialog/Dialog";
import { Button, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";
import FlexBox from "../styles/FlexBox";

interface Props {
	errors: string[];
	closeModal: () => void;
}

const ErrorModal: React.FC<Props> = ({ errors, closeModal }) => (
	<ThemeProvider theme={theme}>
		<Dialog open={errors.length ? true : false}>
			{errors.length && (
				<Fragment>
					<Typography variant="h4">Something went wrong!</Typography>
					{errors.map((error, key) => (
						<Typography variant="subtitle1" key={key}>
							{error}
						</Typography>
					))}
					<FlexBox>
						<Button onClick={closeModal} variant="contained">
							<Typography variant="button">Ok</Typography>
						</Button>
					</FlexBox>
				</Fragment>
			)}
		</Dialog>
	</ThemeProvider>
);

export default ErrorModal;
