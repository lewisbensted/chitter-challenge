import React from "react";
import { ReactNode } from "react";
import IconButton from "@mui/material/IconButton/IconButton";
import ListItem from "@mui/material/ListItem/ListItem";
import ListItemButton from "@mui/material/ListItemButton/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon/ListItemIcon";
import ListItemText from "@mui/material/ListItemText/ListItemText";
import theme from "../styles/theme";
import { ThemeProvider } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

interface Props {
	link?: string;
	icon: ReactNode;
	text?: string;
	isDisabled?: boolean;
	isDrawerOpen: boolean;
	onClick?: () => void;
}

const DrawerElement: React.FC<Props> = ({ link, icon, isDisabled, isDrawerOpen, onClick, text }) => (
	<ThemeProvider theme={theme}>
		<ListItem>
			<ListItemButton
				onClick={onClick}
				{...(link ? { component: RouterLink, to: link } : { component: "div" })}
				sx={{
					justifyContent: isDrawerOpen ? (text ? "left" : "center") : "center",
					pointerEvents: isDisabled ? "none" : undefined,
				}}
			>
				<ListItemIcon sx={{ justifyContent: "center" }}>
					<IconButton>{icon}</IconButton>
				</ListItemIcon>
				{isDrawerOpen && <ListItemText primary={text} />}
			</ListItemButton>
		</ListItem>
	</ThemeProvider>
);

export default DrawerElement;
