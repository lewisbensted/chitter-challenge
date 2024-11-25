import React from "react";
import Dialog from "@mui/material/Dialog/Dialog";
import { Box, Button, Typography } from "@mui/material";

interface Props {
    errors: string[];
    closeModal: () => void;
}

const ErrorModal: React.FC<Props> = ({ errors, closeModal }) => {
    return (
        <Dialog open={errors.length ? true : false}>
            <Typography variant="h5" sx={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                Something went wrong!
            </Typography>
            {errors.map((error, key) => (
                <Typography
                    variant="body1"
                    key={key}
                    sx={{ display: "flex", justifyContent: "center", textAlign: "center", padding: "10px" }}
                >
                    {error}
                </Typography>
            ))}
            <Box sx={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                <Button onClick={closeModal} variant="contained" sx={{ maxWidth: "30px" }}>
                    Ok
                </Button>
            </Box>
        </Dialog>
    );
};

export default ErrorModal;
