import { createTheme } from "@mui/material";
import { blue } from "@mui/material/colors";

const theme = createTheme({
	palette: { primary: blue },
	components: {
		MuiTypography: {
			styleOverrides: { root: { wordBreak: "break-word", display: "flex" } },
			variants: [
				{
					props: { variant: "h4" },
					style: { marginTop: 30, marginBottom: 20, justifyContent: "center", marginInline: 30 },
				},
				{
					props: { variant: "h5" },
					style: { marginBottom: 15, justifyContent: "center", marginInline: 30 },
				},
				{
					props: { variant: "subtitle1" },
					style: { marginBlock: 10, justifyContent: "center", marginInline: 30, textAlign: "center" },
				},
			],
		},
		MuiTextField: { styleOverrides: { root: { width: "100%", margin: 12, fontSize: "1.2rem" } } },
		MuiInputBase: {
			styleOverrides: {
				input: {
					fontSize: "1.2rem",
				},
			},
		},
		MuiIconButton: {
			defaultProps: {
				color: "primary",
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				root: {
					fontSize: "1.2rem",
				},
			},
		},
		MuiCssBaseline: {
			styleOverrides: (theme) => ({
				"*::-webkit-scrollbar": {
					width: "5px",
				},
				"*::-webkit-scrollbar-thumb": {
					backgroundColor: theme.palette.primary.main,
					borderRadius: "8px",
				},
				"*::-webkit-scrollbar-track": {
					backgroundColor: "#f0f0f0",
				},
				body: {
					scrollbarWidth: "thin",
					scrollbarGutter: "stable",
					scrollbarColor: `${theme.palette.primary.main} #f0f0f0`,
				},
			}),
		},
	},
});

export default theme;
