import React from "react";
import { ReactNode } from "react";
import IconButton from "@mui/material/IconButton/IconButton";
import ListItem from "@mui/material/ListItem/ListItem";
import ListItemButton from "@mui/material/ListItemButton/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon/ListItemIcon";
import ListItemText from "@mui/material/ListItemText/ListItemText";
import theme from "../styles/theme";
import { Link, ThemeProvider } from "@mui/material";

interface Props {
	link?: string;
	icon: ReactNode;
	text?: string;
	isComponentLoading: boolean;
	isDrawerOpen: boolean;
	onClick?: () => void;
}

const DrawerElement: React.FC<Props> = ({ link, icon, isComponentLoading, isDrawerOpen, onClick, text }) => (
	<ThemeProvider theme={theme}>
		<ListItem>
			<ListItemButton
				onClick={onClick}
				href={link ? link : ""}
				style={{ pointerEvents: isComponentLoading ? "none" : undefined }}
				sx={{ justifyContent: isDrawerOpen ? (text ? "left" : "center") : "center" }}
			>
				<ListItemIcon sx={{ justifyContent: "center" }}>
					<IconButton color="primary">{icon}</IconButton>
				</ListItemIcon>
				{isDrawerOpen ? (
					<Link>
						<ListItemText primary={text} />
					</Link>
				) : null}
			</ListItemButton>
		</ListItem>
	</ThemeProvider>
);

export default DrawerElement;
