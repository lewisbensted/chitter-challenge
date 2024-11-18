import React from "react";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton/IconButton";
import ListItem from "@mui/material/ListItem/ListItem";
import ListItemButton from "@mui/material/ListItemButton/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon/ListItemIcon";
import ListItemText from "@mui/material/ListItemText/ListItemText";


interface Props {
    link: string;
    icon: ReactNode;
    text: string;
    isComponentLoading: boolean;
    isDrawerOpen: boolean;
    onClick?: () => void;
}

const DrawerElement: React.FC<Props> = ({ link, icon, isComponentLoading, isDrawerOpen, onClick, text }) => {
    return (
        <ListItem>
            <Link to={link}>
                <ListItemButton onClick={onClick} style={{ pointerEvents: isComponentLoading ? "none" : undefined }}>
                    <ListItemIcon>
                        <IconButton>{icon}</IconButton>
                    </ListItemIcon>
                    {isDrawerOpen ? <ListItemText primary={text} /> : null}
                </ListItemButton>
            </Link>
        </ListItem>
    );
};

export default DrawerElement