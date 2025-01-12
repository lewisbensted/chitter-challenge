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
        MuiTextField: { styleOverrides: { root: { width: "100%" } } },
        MuiGrid2: {styleOverrides: { root: {  } }}
    },
});

export default theme;
