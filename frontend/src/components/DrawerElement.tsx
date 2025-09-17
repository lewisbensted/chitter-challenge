import React from "react";
import { type ReactNode } from "react";
import IconButton from "@mui/material/IconButton/IconButton";
import ListItem from "@mui/material/ListItem/ListItem";
import ListItemButton from "@mui/material/ListItemButton/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon/ListItemIcon";
import ListItemText from "@mui/material/ListItemText/ListItemText";
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
	
	<ListItem>
		<ListItemButton
			onClick={onClick}
			{...(link ? { component: RouterLink, to: link } : { component: "div" })}
			sx={{ display: "flex", justifyContent: "center", pointerEvents: isDisabled ? "none" : undefined }}
		>
			<ListItemIcon>
				<IconButton>{icon}</IconButton>
			</ListItemIcon>
			{isDrawerOpen && text && <ListItemText primary={text} />}
		</ListItemButton>
	</ListItem>
	
);

export default DrawerElement;
