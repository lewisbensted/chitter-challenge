import React, { useState } from "react";
import { Link } from "react-router-dom";
import logout from "../utils/logout";
import ErrorModal from "../components/ErrorModal";

interface Props {
    children: JSX.Element;
    isLoading: boolean;
    userId?: number;
    setLoading: (arg: boolean) => void;
    setUserId: (arg?: number) => void;
}

const Layout: React.FC<Props> = ({ children, isLoading, setLoading, userId, setUserId }) => {
    const [error, setError] = useState<string>();

    return (
        <div>
            <ErrorModal errors={error ? [error] : []} closeModal={() => setError(undefined)} />
            {children}
            {isLoading ? null : userId ? (
                <div>
                    <Link to="/conversations" style={{ pointerEvents: isLoading ? "none" : undefined }}>
                        MESSAGES
                    </Link>
					&nbsp;
                    <Link
                        to={"/"}
                        style={{ pointerEvents: isLoading ? "none" : undefined }}
                        onClick={() => {
                            logout(setLoading, setUserId, setError);
                        }}
                    >
                        LOGOUT
                    </Link>
                </div>
            ) : (
                <div>
                    <Link to="/login" style={{ pointerEvents: isLoading ? "none" : undefined }}>
                        LOGIN
                    </Link>
                    &nbsp;
                    <Link to="/register" style={{ pointerEvents: isLoading ? "none" : undefined }}>
                        REGISTER
                    </Link>
                </div>
            )}
            <div>
                {"\n"}
                <Link to="/" style={{ pointerEvents: isLoading ? "none" : undefined }}>
                    HOME
                </Link>
            </div>
        </div>
    );
};

export default Layout;
