import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import logout from "../utils/logout";
import MenuIcon from '@mui/icons-material/Menu';
import {
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    
} from "@mui/material";
import { AppRegistration, Chat, Home, Login, Logout, MenuOpen } from "@mui/icons-material";

interface Props {
    isComponentLoading: boolean;
    userId?: number;
    setPageLoading: (arg: boolean) => void;
    setUserId: (arg?: number) => void;
    isPageLoading: boolean;
    children: JSX.Element;
}

const drawerWidth = 240;

const Layout: React.FC<Props> = ({
    children,
    isComponentLoading,
    setPageLoading,
    userId,
    setUserId,
    isPageLoading,
}) => {
    const [isDrawerOpen, setDrawerOpen] = useState(true);

    return (
        <Box sx={{ display: "flex" }}>
             <IconButton onClick={() => setDrawerOpen(true)}>
                    <MenuIcon/>
                </IconButton>
            <Drawer
                open={isDrawerOpen}
                variant="persistent"
                sx={{ width: drawerWidth }}
            >
                <IconButton onClick={() => setDrawerOpen(false)}>
                    <MenuOpen/>
                </IconButton>
                <Divider />
                <List>
                    {isPageLoading ? null : userId ? (
                        <Fragment>
                            <Link to="/conversations">
                                <ListItem>
                                    <ListItemButton style={{ pointerEvents: isComponentLoading ? "none" : undefined }}>
                                        <ListItemIcon>
                                            <IconButton>
                                                <Chat />
                                            </IconButton>
                                        </ListItemIcon>
                                        <ListItemText primary="Messages" />
                                    </ListItemButton>
                                </ListItem>
                            </Link>
                            <Link to="/">
                                <ListItem>
                                    <ListItemButton
                                        style={{ pointerEvents: isComponentLoading ? "none" : undefined }}
                                        onClick={() => {
                                            logout(setPageLoading, setUserId);
                                        }}
                                    >
                                        <ListItemIcon>
                                            <IconButton>
                                                <Logout />
                                            </IconButton>
                                        </ListItemIcon>
                                        <ListItemText primary="Logout" />
                                    </ListItemButton>
                                </ListItem>
                            </Link>
                        </Fragment>
                    ) : (
                        <Fragment>
                            <Link to="/login">
                                <ListItem>
                                    <ListItemButton style={{ pointerEvents: isComponentLoading ? "none" : undefined }}>
                                        <ListItemIcon>
                                            <IconButton>
                                                <Login />
                                            </IconButton>
                                        </ListItemIcon>
                                        <ListItemText primary="Log in" />
                                    </ListItemButton>
                                </ListItem>
                            </Link>
                            <Link to="/register">
                                <ListItem>
                                    <ListItemButton style={{ pointerEvents: isComponentLoading ? "none" : undefined }}>
                                        <ListItemIcon>
                                            <IconButton>
                                                <AppRegistration />
                                            </IconButton>
                                        </ListItemIcon>
                                        <ListItemText primary="Register" />
                                    </ListItemButton>
                                </ListItem>
                            </Link>
                        </Fragment>
                    )}
                    <Divider />
                    <Link to="/">
                        <ListItem>
                            <ListItemButton style={{ pointerEvents: isComponentLoading ? "none" : undefined }}>
                                <ListItemIcon>
                                    <IconButton>
                                        <Home />
                                    </IconButton>
                                </ListItemIcon>
                                <ListItemText primary="Home" />
                            </ListItemButton>
                        </ListItem>
                    </Link>
                </List>
            </Drawer>
            {children}
        </Box>
    );
};

export default Layout;
