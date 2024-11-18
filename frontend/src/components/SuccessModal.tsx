import Close from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton/IconButton";
import React from "react";
import ReactModal from "react-modal";

interface Props {
	success : boolean
	closeModal: () => void;
}

const SuccessModal: React.FC<Props> = ({ success, closeModal }) => {
	return (
		<ReactModal
			isOpen={success}
			ariaHideApp={false}>
			<h2>Success</h2>
			<p>Account created.</p>
			<IconButton onClick={closeModal} >
                <Close />
            </IconButton>
		</ReactModal>
	);
};

export default SuccessModal;
