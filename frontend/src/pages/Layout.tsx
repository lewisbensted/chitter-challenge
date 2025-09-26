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
import { CircularProgress, CssBaseline, ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import ErrorModal from "../components/ErrorModal";
import { useAuth } from "../contexts/AuthContext";
import { useError } from "../contexts/ErrorContext";
import { useLayout } from "../contexts/LayoutContext";
import FlexBox from "../styles/FlexBox";
import { Search } from "@mui/icons-material";
import { DRAWER_WIDTH } from "../config/layout";

const Layout: React.FC = () => {
	const [isDrawerOpen, setDrawerOpen] = useState(false);
	const drawerWidth = isDrawerOpen ? DRAWER_WIDTH : DRAWER_WIDTH / 2;

	const { errors, clearErrors, handleErrors } = useError();
	const { userId, setUserId, isValidateLoading, isLoggingOut, setLoggingOut } = useAuth();

	const { isUnreadLoading, isUnreadMessages, isLoadingTimer, setLoadingTimer } = useLayout();
	const navigate = useNavigate();

	useEffect(() => {
		if (userId === null && isLoggingOut) {
			void navigate("/login");
		}
	}, [userId, isLoggingOut, navigate]);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Box>
				<Drawer
					open={isDrawerOpen}
					variant="permanent"
					sx={{ width: drawerWidth }}
					slotProps={{ paper: { sx: { width: drawerWidth } } }}
				>
					<List >
						<DrawerElement
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
						/>
						<Divider />
						{!(isValidateLoading || isUnreadLoading || isLoadingTimer) &&
							(userId ? (
								<Fragment>
									<DrawerElement
										link="/conversations"
										text="Messages"
										icon={isUnreadMessages ? <MarkUnreadChatAlt /> : <Chat />}
										isDrawerOpen={isDrawerOpen}
									/>
									<DrawerElement
										text="Log out"
										icon={<Logout />}
										isDrawerOpen={isDrawerOpen}
										onClick={async () => {
											await logout(setUserId, handleErrors, setLoggingOut, setLoadingTimer);
										}}
									/>
								</Fragment>
							) : (
								<Fragment>
									<DrawerElement
										link="/register"
										text="Register"
										icon={<AppRegistration />}
										isDrawerOpen={isDrawerOpen}
									/>
									<DrawerElement
										link="/login"
										text="Log in"
										icon={<Login />}
										isDrawerOpen={isDrawerOpen}
									/>
								</Fragment>
							))}
						<Divider />
						<DrawerElement link="/search" text="Search" icon={<Search />} isDrawerOpen={isDrawerOpen} />
						<DrawerElement link="/" text="Home" icon={<Home />} isDrawerOpen={isDrawerOpen} />
					</List>
				</Drawer>

				{isLoggingOut || isValidateLoading || isLoadingTimer ? (
					<FlexBox>
						<CircularProgress thickness={5} />
					</FlexBox>
				) : (
					<Box display="flex" justifyContent={"center"} alignItems="center">
						<ErrorModal errors={errors} closeModal={clearErrors} />
						<Outlet />
					</Box>
				)}
			</Box>
		</ThemeProvider>
	);
};

export default Layout;
