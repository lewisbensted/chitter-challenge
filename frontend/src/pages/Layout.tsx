import React, { useState } from "react";
import { Link } from "react-router-dom";
import logout from "../utils/logout";
import ErrorModal from "../components/ErrorModal";

interface Props {
    children: JSX.Element;
    isComponentLoading: boolean;
    userId?: number;
    setPageLoading: (arg: boolean) => void;
    setUserId: (arg?: number) => void;
    isPageLoading: boolean;
}

const Layout: React.FC<Props> = ({ children, isComponentLoading, setPageLoading, userId, setUserId, isPageLoading }) => {
    const [error, setError] = useState<string>();

    return (
        <div>
            <ErrorModal errors={error ? [error] : []} closeModal={() => setError(undefined)} />
            {children}
            {isPageLoading ? null : userId ? (
                <div>
                    <Link to="/conversations" style={{ pointerEvents: isComponentLoading ? "none" : undefined }}>
                        MESSAGES
                    </Link>
                    &nbsp;
                    <Link
                        to={"/"}
                        style={{ pointerEvents: isComponentLoading ? "none" : undefined }}
                        onClick={() => {
                            logout(setPageLoading, setUserId);
                        }}
                    >
                        LOGOUT
                    </Link>
                </div>
            ) : (
                <div>
                    <Link to="/login" style={{ pointerEvents: isComponentLoading ? "none" : undefined }}>
                        LOGIN
                    </Link>
                    &nbsp;
                    <Link to="/register" style={{ pointerEvents: isComponentLoading ? "none" : undefined }}>
                        REGISTER
                    </Link>
                </div>
            )}
            <div>
                {"\n"}
                <Link to="/" style={{ pointerEvents: isComponentLoading ? "none" : undefined }}>
                    HOME
                </Link>
            </div>
        </div>
    );
};

export default Layout;
