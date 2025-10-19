import React, { useCallback, useState } from "react";
import { Box, IconButton } from "@mui/material";
import { PersonAddAlt1, PersonRemove } from "@mui/icons-material";
import type { IUserEnhanced } from "../interfaces/interfaces";
import { toggleFollow } from "../utils/toggleFollow";
import { useError } from "../contexts/ErrorContext";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
	userEnhanced: IUserEnhanced;
	onSuccess: (arg: IUserEnhanced) => void;
}

const FollowIcon: React.FC<Props> = ({ userEnhanced, onSuccess }) => {
	const { handleErrors } = useError();

	const [isLoading, setLoading] = useState<boolean>(false);

	const [pendingUser, setPendingUser] = useState<IUserEnhanced | null>(null);
	const [pendingError, setPendingError] = useState<unknown>(null);

	const handleToggle = async () => {
		setLoading(true);
		try {
			const toggledUser = await toggleFollow(userEnhanced);
			setPendingUser(toggledUser);
		} catch (error) {
			setPendingError(error);
		} finally {
			setLoading(false);
		}
	};

	const applyPending = useCallback(() => {
		if (pendingUser) {
			onSuccess(pendingUser);
			setPendingUser(null);
		}
		if (pendingError) {
			handleErrors(pendingError, `${userEnhanced.isFollowing ? "unfollow" : "follow"} user`, false);
			setPendingError(null);
		}
	}, [pendingUser, pendingError, handleErrors, setPendingError, userEnhanced, onSuccess]);

	return (
		<Box>
			<LoadingSpinner isLoading={isLoading} onFinished={applyPending} isLarge={false}>
				<IconButton onClick={handleToggle}>
					{userEnhanced.isFollowing ? <PersonRemove /> : <PersonAddAlt1 />}
				</IconButton>
			</LoadingSpinner>
		</Box>
	);
};

export default FollowIcon;
