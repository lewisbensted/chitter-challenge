import React from "react";
import Close from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog/Dialog";
import IconButton from "@mui/material/IconButton/IconButton";


interface Props {
    success: boolean;
    closeModal: () => void;
}

const SuccessModal: React.FC<Props> = ({ success, closeModal }) => {
    return (
        <Dialog open={success}>
            <h2>Success</h2>
            <p>Account created.</p>
            <IconButton onClick={closeModal}>
                <Close />
            </IconButton>
        </Dialog>
    );
};

export default SuccessModal;
