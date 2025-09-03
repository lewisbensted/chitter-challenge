import { format } from "date-fns";

export const formatDate = (date: Date, showFull = false) => {
	const currentDate = new Date();
	return format(
		date,
		showFull? "HH:mm d MMM yy":currentDate.getFullYear() === date.getFullYear()
			? currentDate.getMonth() === date.getMonth() && currentDate.getDate() === date.getDate()
				? "HH:mm"
				: "d MMM"
			: "d MMM yy"
	);
};
