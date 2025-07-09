import React, { Fragment, useEffect, useState } from "react";
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
import { Outlet, useNavigate } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import ErrorModal from "../components/ErrorModal";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 200;

const Layout: React.FC = () => {
	const [isDrawerOpen, setDrawerOpen] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);
	const {
		userId,
		setUserId,
		validateUser,
		isValidateLoading,
		isComponentLoading,
		isUnreadLoading,
		isUnreadMessages,
		setComponentLoading,
		fetchUnread,
	} = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		validateUser();
	}, [validateUser]);

	useEffect(() => {
		fetchUnread();
	}, [userId, fetchUnread]);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
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
					slotProps={{ paper: { sx: { width: isDrawerOpen ? drawerWidth : drawerWidth / 2 } } }}
				>
					<List>
						<DrawerElement
							isDisabled={false}
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
						{!(isValidateLoading || isUnreadLoading) &&
							(userId ? (
								<Fragment>
									<DrawerElement
										link="/conversations"
										text="Messages"
										icon={isUnreadMessages ? <MarkUnreadChatAlt /> : <Chat />}
										isDisabled={isComponentLoading}
										isDrawerOpen={isDrawerOpen}
									/>
									<DrawerElement
										text="Log out"
										icon={<Logout />}
										isDisabled={isComponentLoading}
										isDrawerOpen={isDrawerOpen}
										onClick={async () => {
											await logout(setComponentLoading, setUserId, setErrors, () => {
												navigate("/login");
											});
										}}
									/>
								</Fragment>
							) : (
								<Fragment>
									<DrawerElement
										link="/register"
										text="Register"
										icon={<AppRegistration />}
										isDisabled={isComponentLoading}
										isDrawerOpen={isDrawerOpen}
									/>
									<DrawerElement
										link="/login"
										text="Log in"
										icon={<Login />}
										isDisabled={isComponentLoading}
										isDrawerOpen={isDrawerOpen}
									/>
								</Fragment>
							))}
						<Divider />
						<DrawerElement
							link="/"
							text="Home"
							icon={<Home />}
							isDisabled={isComponentLoading}
							isDrawerOpen={isDrawerOpen}
						/>
					</List>
				</Drawer>
				<Outlet />
			</Box>
		</ThemeProvider>
	);
};

export default Layout;
