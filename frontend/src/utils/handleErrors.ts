import axios from "axios";

export const handleErrors = (
	error: unknown,
	action: string,
	setErrors: React.Dispatch<React.SetStateAction<string[]>>
) => {
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
