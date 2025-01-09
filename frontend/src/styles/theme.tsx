import { createTheme } from "@mui/material";
import { blue } from "@mui/material/colors";

const theme = createTheme({
    palette: { primary: blue },
    components: {
        MuiButton: { styleOverrides: { root: { maxWidth: 50 } } },
        MuiTypography: {
            styleOverrides: {root: {wordBreak: "break-word", display: "flex"}},
            variants: [
                {
                    props: { variant: "h4" },
                    style: { marginBlock: 30, justifyContent: "center",  marginInline: 30 },
                },
                {
                    props: { variant: "h5" },
                    style: { marginBlock: 30, justifyContent: "center",  marginInline: 30 },
                },
                {
                    props: { variant: "subtitle1" },
                    style: { marginBlock: 10, justifyContent: "center", marginInline: 30, textAlign: "center" },
                },
              
            ],
        },
        MuiTextField: { styleOverrides: { root: { width: '100%' } } },
    },
});

export default theme;
