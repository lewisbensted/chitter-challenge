import { createTheme } from "@mui/material";
import { blue } from "@mui/material/colors";

const theme = createTheme({
    palette: { primary: blue },
    components: {    
        MuiButton: { styleOverrides: { root: { maxWidth: 50 } } },
        MuiTypography: {
            styleOverrides: { root: { justifyContent: "center", display: "flex", paddingInline: 30 } },
            variants: [
                { props: { variant: "h5" }, style: { paddingBlock: 30 } },
                { props: { variant: "body1" }, style: { paddingBlock: 10 } },
            ],
        },
        
    },
});

export default theme