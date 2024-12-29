import React from "react";
import Dialog from "@mui/material/Dialog/Dialog";
import { Button, Typography, ThemeProvider } from "@mui/material";
import StyledBox from "../styles/MarginBox";
import theme from "../styles/theme";

interface Props {
    isOpen: boolean;
    message: string;
    closeModal: () => void;
}

const SuccessModal: React.FC<Props> = ({ isOpen, message, closeModal }) => {
    return (
        <ThemeProvider theme={theme}>
            <Dialog open={isOpen}>
                <Typography variant="h5">Success!</Typography>
                <Typography variant="subtitle1">{message}</Typography>
                <StyledBox>
                    <Button onClick={closeModal} variant="contained">
                        <Typography variant="button">Ok</Typography>
                    </Button>
                </StyledBox>
            </Dialog>
        </ThemeProvider>
    );
};

export default SuccessModal;
