import Close from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton/IconButton";
import React from "react";
import ReactModal from "react-modal";

interface Props {
    errors: string[];
    closeModal: () => void;
}

const ErrorModal: React.FC<Props> = ({ errors, closeModal }) => {
    return (
        <ReactModal isOpen={errors.length ? true : false} ariaHideApp={false}>
            <h2>Something went wrong!</h2>
            {errors.map((e, key) => (
                <div key={key}>{e}</div>
            ))}
            <IconButton onClick={closeModal} >
                <Close />
            </IconButton>
        </ReactModal>
    );
};

export default ErrorModal;
