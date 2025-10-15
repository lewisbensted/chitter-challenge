import React, { useEffect } from "react";
import { createContext, type ReactNode, useCallback, useContext, useState } from "react";
import { serverURL } from "../config/config";
import axios from "axios";
import { logErrors } from "../utils/processErrors";
import { useAuth } from "./AuthContext";
import { SPINNER_DURATION } from "../config/layout";
import { throwApiError } from "../utils/apiResponseError";

interface LayoutContextType {
	isUnreadMessages: boolean;
	isUnreadLoading: boolean;
	reloadUnreadTrigger: boolean;
	fetchUnread: () => Promise<void>;
	setUnreadLoading: React.Dispatch<React.SetStateAction<boolean>>;
	toggleUnreadTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	isLoadingTimer: boolean;
	setLoadingTimer: React.Dispatch<React.SetStateAction<boolean>>;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
	const [isUnreadMessages, setUnreadMessages] = useState<boolean>(false);
	const [isUnreadLoading, setUnreadLoading] = useState<boolean>(false);
	const [reloadUnreadTrigger, toggleUnreadTrigger] = useState<boolean>(false);

	const { userId } = useAuth();

	const fetchUnread = useCallback(async () => {
		if (userId === undefined) {
			return;
		} else if (userId === null) {
			setUnreadLoading(false);
			return;
		}
		try {
			setUnreadLoading(true);
			const res = await axios.get<boolean>(`${serverURL}/api/conversations/unread`, { withCredentials: true });
			const unread = res.data;
			if (typeof unread !== "boolean") throwApiError("boolean", unread);
			setUnreadMessages(unread);
		} catch (error) {
			logErrors(error);
		} finally {
			setUnreadLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		void fetchUnread();
	}, [userId, reloadUnreadTrigger, fetchUnread]);

	const [isLoadingTimer, setLoadingTimer] = useState<boolean>(true);
	useEffect(() => {
		setTimeout(() => {
			setLoadingTimer(false);
		}, SPINNER_DURATION);
	}, [userId]);

	return (
		<LayoutContext.Provider
			value={{
				isUnreadLoading,
				isUnreadMessages,
				isLoadingTimer,
				fetchUnread,
				setUnreadLoading,
				toggleUnreadTrigger,
				reloadUnreadTrigger,
				setLoadingTimer,
			}}
		>
			{children}
		</LayoutContext.Provider>
	);
};

export const useLayout = () => {
	const context = useContext(LayoutContext);
	if (!context) {
		throw new Error("useLayout must be used within an LayoutProvider.");
	}
	return context;
};
