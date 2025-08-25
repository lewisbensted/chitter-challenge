export const serverURL =
	process.env.NODE_ENV === "production" ? "" : `http://localhost:${process.env.REACT_APP_SERVER_PORT ?? ""}`;
