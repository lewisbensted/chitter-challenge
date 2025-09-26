import type { IUserEnhanced } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";

export const toggleFollow = async (userToFollow: IUserEnhanced) => {
	const { user, isFollowing } = userToFollow;
	await (isFollowing
		? axios.delete(`${serverURL}/api/follow/${user.uuid}`, { withCredentials: true })
		: axios.post(`${serverURL}/api/follow/${user.uuid}`, {}, { withCredentials: true }));

	return { ...userToFollow, isFollowing: !isFollowing };
};
