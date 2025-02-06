import { format } from "date-fns";

export const formatDate = (date: Date) => {
	const currentDate = new Date();
	return format(
		date,
		currentDate.getFullYear() === date.getFullYear()
			? currentDate.getMonth() === date.getMonth() && currentDate.getDate() === date.getDate()
				? "HH:mm"
				: "dd/MM"
			: "dd/MM/yy"
	);
};
