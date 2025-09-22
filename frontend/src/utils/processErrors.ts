import axios from "axios";
import { extractData } from "./extractErrorData";

export const logErrors = (error: unknown) => {
	if (axios.isAxiosError(error)) {
		const { errors, code } = extractData(error.response?.data);
		console.error("Axios error:", {
			message: error.message,
			status: error.response?.status,
			statusText: error.response?.statusText,
			code: error.code,
			errors: errors,
			customCode: code,
		});
	} else {
		console.error("Unknown error occurred:", {
			message: (error as Error).message,
		});
	}
};

export const processErrors = (error: unknown, action: string) => {
	if (axios.isAxiosError(error)) {
		const { errors, code } = extractData(error.response?.data);
		if (
			error.response?.status &&
			[400, 401, 403, 409, 429].includes(error.response.status) &&
			!(code && ["ROUTE_NOT_FOUND", "OWNERSHIP_VIOLATION"].includes(code))
		) {
			return errors.length > 0 ? errors : [`An unexpected error has occured - failed to ${action}`];
		} else if (axios.isAxiosError(error) && error.code === "ERR_NETWORK") {
			return ["Network Error: Servers unreachable."];
		}
	}
	return [`An unexpected error has occured - failed to ${action}`];
};
