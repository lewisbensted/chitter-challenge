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

            <button onClick={closeModal}>OK</button>
        </ReactModal>
    );
};

export default ErrorModal;
