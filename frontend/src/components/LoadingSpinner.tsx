import React, { type ReactNode, useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { SPINNER_DELAY, SPINNER_DURATION } from "../config/layout";

interface Props {
	isLoading: boolean;
	isLarge?: boolean;
	children: ReactNode;
	onFinished: () => void;
}

const LoadingSpinner: React.FC<Props> = ({ isLoading, children, onFinished, isLarge = true }) => {
	const [showSpinner, setShowSpinner] = useState(false);
	useEffect(() => {
		let showTimer: ReturnType<typeof setTimeout> | undefined;
		let hideTimer: ReturnType<typeof setTimeout> | undefined;

		if (isLoading) {
			showTimer = setTimeout(() => {
				setShowSpinner(true);
			}, SPINNER_DELAY);
		} else if (showSpinner) {
			hideTimer = setTimeout(() => {
				setShowSpinner(false);
				onFinished();
			}, SPINNER_DURATION);
		} else {
			onFinished();
		}
		return () => {
			clearTimeout(showTimer);
			clearTimeout(hideTimer);
		};
	}, [isLoading]);

	return showSpinner ? (
		<Box paddingTop={isLarge ? 3 : 1.3} paddingLeft={isLarge ? 0 : 1}>
			<CircularProgress size={`${isLarge ? 2.1 : 1.3}rem`} thickness={6} />
		</Box>
	) : (
		<>{children}</>
	);
};
export default LoadingSpinner;
