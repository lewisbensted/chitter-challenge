import React, { Fragment, useState } from "react";
import logout from "../utils/logout";
import MenuIcon from "@mui/icons-material/Menu";
import DrawerElement from "../components/DrawerElement";
import IconButton from "@mui/material/IconButton/IconButton";
import Divider from "@mui/material/Divider/Divider";
import List from "@mui/material/List/List";
import Drawer from "@mui/material/Drawer/Drawer";
import Box from "@mui/material/Box/Box";
import Logout from "@mui/icons-material/Logout";
import MenuOpen from "@mui/icons-material/MenuOpen";
import Chat from "@mui/icons-material/Chat";
import AppRegistration from "@mui/icons-material/AppRegistration";
import Home from "@mui/icons-material/Home";
import Login from "@mui/icons-material/Login";

interface Props {
    isComponentLoading: boolean;
    userId?: number;
    setPageLoading: (arg: boolean) => void;
    setUserId: (arg?: number) => void;
    isPageLoading: boolean;
    children: JSX.Element;
}

const drawerWidth = 200;

const Layout: React.FC<Props> = ({
    children,
    isComponentLoading,
    setPageLoading,
    userId,
    setUserId,
    isPageLoading,
}) => {
    const [isDrawerOpen, setDrawerOpen] = useState(false);

    return (
        <Box sx={{ display: "flex" }}>
            <Drawer
                open={isDrawerOpen}
                variant="permanent"
                sx={{ width: isDrawerOpen ? drawerWidth : drawerWidth / 2 }}
                PaperProps={{ sx: { width: isDrawerOpen ? drawerWidth : drawerWidth / 2 } }}
            >
                <IconButton onClick={isDrawerOpen ? () => setDrawerOpen(false) : () => setDrawerOpen(true)}>
                    {isDrawerOpen ? <MenuOpen /> : <MenuIcon />}
                </IconButton>
                <Divider />
                <List>
                    {isPageLoading ? null : userId ? (
                        <Fragment>
                            <DrawerElement
                                link="/conversations"
                                text="Messages"
                                icon={<Chat />}
                                isComponentLoading={isComponentLoading}
                                isDrawerOpen={isDrawerOpen}
                            />
                            <DrawerElement
                                link="/"
                                text="Logout"
                                icon={<Logout />}
                                isComponentLoading={isComponentLoading}
                                isDrawerOpen={isDrawerOpen}
                                onClick={() => {
                                    logout(setPageLoading, setUserId);
                                }}
                            />
                        </Fragment>
                    ) : (
                        <Fragment>
                            <DrawerElement
                                link="/login"
                                text="Log in"
                                icon={<Login />}
                                isComponentLoading={isComponentLoading}
                                isDrawerOpen={isDrawerOpen}
                            />
                            <DrawerElement
                                link="/register"
                                text="Registration"
                                icon={<AppRegistration />}
                                isComponentLoading={isComponentLoading}
                                isDrawerOpen={isDrawerOpen}
                            />
                        </Fragment>
                    )}
                    <Divider />
                    <DrawerElement
                        link="/"
                        text="Home"
                        icon={<Home />}
                        isComponentLoading={isComponentLoading}
                        isDrawerOpen={isDrawerOpen}
                    />
                </List>
            </Drawer>
            {children}
        </Box>
    );
};

export default Layout;
