import axios from "axios";

export const logErrors = (error: unknown) => {
	if (axios.isAxiosError(error)) {
		console.error("Axios error:", {
			message: error.message,
			status: error.response?.status,
			statusText: error.response?.statusText,
			code: error.code,
			errors: error.response?.data as string[] | undefined ?? null,
		});
	} else {
		console.error("Unknown error occurred:", {
			message: (error as Error).message,
		});
	}
};

export const handleErrors = (
	error: unknown,
	action: string,
	setErrors: React.Dispatch<React.SetStateAction<string[]>>
) => {
	logErrors(error);
	if (
		axios.isAxiosError(error) &&
		error.response?.status &&
		[400, 401, 403, 404].includes(error.response.status) &&
		typeof error.response.data === "object"
	) {
		setErrors(error.response.data as string[]);
	} else if (axios.isAxiosError(error) && error.code === "ERR_NETWORK") {
		setErrors(["Network Error: Servers unreachable."]);
	} else {
		setErrors([`An unexpected error occured while ${action}.`]);
	}
};
