import React from "react";
import { ReactNode } from "react";
import IconButton from "@mui/material/IconButton/IconButton";
import ListItem from "@mui/material/ListItem/ListItem";
import ListItemButton from "@mui/material/ListItemButton/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon/ListItemIcon";
import ListItemText from "@mui/material/ListItemText/ListItemText";
import theme from "../styles/theme";
import { Link, ThemeProvider } from "@mui/material";
import IconBox from "../styles/IconBox";

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
        <ThemeProvider theme={theme}>
            <ListItem>
                <Link href={link} style={{ pointerEvents: isComponentLoading ? "none" : undefined }}>
                    <ListItemButton onClick={onClick}>
                        <ListItemIcon>
                            <IconBox>
                                <IconButton color="primary">{icon}</IconButton>
                            </IconBox>
                        </ListItemIcon>
                        {isDrawerOpen ? <ListItemText primary={text} /> : null}
                    </ListItemButton>
                </Link>
            </ListItem>
        </ThemeProvider>
    );
};

export default DrawerElement;
