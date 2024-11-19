import React from "react";
import Close from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog/Dialog";
import IconButton from "@mui/material/IconButton/IconButton";

interface Props {
    errors: string[];
    closeModal: () => void;
}

const ErrorModal: React.FC<Props> = ({ errors, closeModal }) => {
    return (
        <Dialog open={errors.length ? true : false}>
            <h2>Something went wrong!</h2>
            {errors.map((e, key) => (
                <div key={key}>{e}</div>
            ))}
            <IconButton onClick={closeModal}>
                <Close />
            </IconButton>
        </Dialog>
    );
};

export default ErrorModal;
