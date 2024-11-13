import axios from "axios";

export const handleErrors = (error: unknown, action: string, setErrors: (arg: string[]) => void) => {
    if (
        axios.isAxiosError(error) &&
        [400, 401, 403, 404].includes(error.response?.status!) &&
        (error.response?.status == 404 ? typeof error.response?.data == "object" ? true : false : true)
    ) {
        setErrors(error.response?.data);
    }
    else if (axios.isAxiosError(error) && error.code == "ERR_NETWORK") {
        setErrors(["Network Error: Servers unreachable."]);
    } else {
        setErrors([`An unexpected error occured while ${action}.`]);
    }
};
