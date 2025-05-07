import React, { Fragment, useState } from "react";
import logout from "../utils/logout";
import MenuIcon from "@mui/icons-material/Menu";
import DrawerElement from "../components/DrawerElement";
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
import MarkUnreadChatAlt from "@mui/icons-material/MarkUnreadChatAlt";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import ErrorModal from "../components/ErrorModal";

interface Props {
	isComponentLoading: boolean;
	userId?: string | null;
	setPageLoading: (arg: boolean) => void;
	setUserId: (arg: string | null) => void;
	isValidationLoding: boolean;
	children: React.JSX.Element;
	isUnreadMessages?: boolean;
}

const drawerWidth = 200;

const Layout: React.FC<Props> = ({
	children,
	isComponentLoading,
	setPageLoading,
	userId,
	setUserId,
	isValidationLoding,
	isUnreadMessages,
}) => {
	const [isDrawerOpen, setDrawerOpen] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);
	const navigate = useNavigate();

	return (
		<ThemeProvider theme={theme}>
			<ErrorModal
				errors={errors}
				closeModal={() => {
					setErrors([]);
				}}
			/>
			<Box display="flex" justifyContent="center">
				<Drawer
					open={isDrawerOpen}
					variant="permanent"
					sx={{ width: isDrawerOpen ? drawerWidth : drawerWidth / 2 }}
					PaperProps={{ sx: { width: isDrawerOpen ? drawerWidth : drawerWidth / 2 } }}
				>
					<List>
						<DrawerElement
							isComponentLoading={false}
							onClick={
								isDrawerOpen
									? () => {
										setDrawerOpen(false);
									}
									: () => {
										setDrawerOpen(true);
									}
							}
							icon={isDrawerOpen ? <MenuOpen /> : <MenuIcon />}
							isDrawerOpen={isDrawerOpen}
						></DrawerElement>
						<Divider />
						{isValidationLoding ? null : userId ? (
							<Fragment>
								<DrawerElement
									link="/conversations"
									text="Messages"
									icon={isUnreadMessages ? <MarkUnreadChatAlt /> : <Chat />}
									isComponentLoading={isComponentLoading}
									isDrawerOpen={isDrawerOpen}
								/>
								<DrawerElement
									text="Log out"
									icon={<Logout />}
									isComponentLoading={isComponentLoading}
									isDrawerOpen={isDrawerOpen}
									onClick={
										(async () => {
											await logout(setPageLoading, setUserId, setErrors, () => {
												navigate("/login");
											});
										})
									}
								/>
							</Fragment>
						) : (
							<Fragment>
								<DrawerElement
									link="/register"
									text="Register"
									icon={<AppRegistration />}
									isComponentLoading={isComponentLoading}
									isDrawerOpen={isDrawerOpen}
								/>
								<DrawerElement
									link="/login"
									text="Log in"
									icon={<Login />}
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
		</ThemeProvider>
	);
};

export default Layout;
