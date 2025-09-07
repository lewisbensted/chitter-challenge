export const serverURL =
	process.env.NODE_ENV === "prod" ? "" : `http://localhost:${process.env.REACT_APP_SERVER_PORT ?? ""}`;
