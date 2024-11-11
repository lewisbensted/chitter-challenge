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
			<button onClick={closeModal}>OK</button>
		</ReactModal>
	);
};

export default SuccessModal;
