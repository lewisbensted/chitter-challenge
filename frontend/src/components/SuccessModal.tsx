import React from "react";
import Close from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog/Dialog";
import IconButton from "@mui/material/IconButton/IconButton";
import { Box, Button, Typography } from "@mui/material";

interface Props {
    isOpen: boolean;
    message: string;
    closeModal: () => void;
}

const SuccessModal: React.FC<Props> = ({ isOpen, message, closeModal }) => {
    return (
        <Dialog open={isOpen}>
            <Typography variant="h5" sx={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                Success!
            </Typography>
            <Typography
                variant="body1"
                sx={{ display: "flex", justifyContent: "center", textAlign: "center", padding: "10px" }}
            >
                {message}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                <Button onClick={closeModal} variant="contained" sx={{ maxWidth: "30px" }}>
                    Ok
                </Button>
            </Box>
        </Dialog>
    );
};

export default SuccessModal;
