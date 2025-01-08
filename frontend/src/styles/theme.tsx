import { createTheme } from "@mui/material";
import { blue } from "@mui/material/colors";

const theme = createTheme({
    palette: { primary: blue },
    components: {
        MuiButton: { styleOverrides: { root: { maxWidth: 50 } } },
        MuiTypography: {
            variants: [
                {
                    props: { variant: "h5" },
                    style: { marginBlock: 30, justifyContent: "center", display: "flex", marginInline: 30 },
                },
                {
                    props: { variant: "h6" },
                    style: { justifyContent: "center", display: "flex", marginInline: 30 },
                },
                {
                    props: { variant: "subtitle1" },
                    style: { marginBlock: 10, justifyContent: "center", display: "flex", marginInline: 30, textAlign: "center" },
                },
                { props: { variant: "body1" }, style: { justifyContent: "left", display: "flex" } },
            ],
        },
        MuiTextField: { styleOverrides: { root: { width: '100%' } } },
    },
});

export default theme;
