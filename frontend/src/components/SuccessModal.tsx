import React from "react";
import Dialog from "@mui/material/Dialog/Dialog";
import { Button, Typography, ThemeProvider } from "@mui/material";
import StyledBox from "./StyledBox";
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
                <Typography variant="body1">{message}</Typography>
                <StyledBox>
                    <Button onClick={closeModal} variant="contained">
                        Ok
                    </Button>
                </StyledBox>
            </Dialog>
        </ThemeProvider>
    );
};

export default SuccessModal;
