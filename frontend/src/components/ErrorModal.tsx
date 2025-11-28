import React, { Fragment } from "react";
import Dialog from "@mui/material/Dialog/Dialog";
import { Button, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";

interface Props {
	errors: string[];
	closeModal: () => void;
}

const ErrorModal: React.FC<Props> = ({ errors, closeModal }) => (
	<Dialog open={errors.length ? true : false}>
		{errors.length > 0 ? (
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
		) : null}
	</Dialog>
);

export default ErrorModal;
