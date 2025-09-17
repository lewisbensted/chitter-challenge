import React, { Fragment, useState } from "react";
import type { IUser } from "../interfaces/interfaces";
import { Box, CircularProgress, IconButton } from "@mui/material";
import { PersonAddAlt1, PersonRemove } from "@mui/icons-material";
import { serverURL } from "../config/config";
import axios from "axios";
import toast from "react-hot-toast";
import { logErrors } from "../utils/processErrors";

interface Props {
	user: IUser;
	isFollowing: boolean | null;
	setFollowing: (isFollowingInput: boolean) => void;
}

const FollowIcon: React.FC<Props> = ({ user, isFollowing, setFollowing }) => {
	const [isLoading, setLoading] = useState<boolean>(false);

	return (
		<Fragment>
			{isLoading ? (
				<Box paddingTop={1.3} paddingLeft={1}>
					<CircularProgress size="1.3rem" thickness={6} />
				</Box>
			) : isFollowing ? (
				<IconButton
					onClick={async () => {
						try {
							setLoading(true);
							await axios.delete(`${serverURL}/api/follow/${user.uuid}`, {
								withCredentials: true,
							});
							setFollowing(false);
						} catch (error) {
							logErrors(error);
							toast("Failed to unfollow");
						} finally {
							setLoading(false);
						}
					}}
				>
					<PersonRemove />
				</IconButton>
			) : (
				<IconButton
					onClick={async () => {
						try {
							setLoading(true);
							await axios.post(`${serverURL}/api/follow/${user.uuid}`,{}, {
								withCredentials: true,
							});
							setFollowing(true);
						} catch (error) {
							logErrors(error);
							toast("Failed to follow");
						} finally {
							setLoading(false);
						}
					}}
				>
					<PersonAddAlt1 />
				</IconButton>
			)}
		</Fragment>
	);
};

export default FollowIcon;
