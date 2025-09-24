import React from "react";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import User from "./pages/UserPage";
import Conversations from "./pages/Conversations";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorProvider } from "./contexts/ErrorContext";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import { LayoutProvider } from "./contexts/LayoutContext";
import SearchUser from "./pages/SearchUser";

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<Layout />}>
			<Route index element={<Homepage />} />
			<Route path="login" element={<Login />} />
			<Route path="register" element={<Register />} />
			<Route path="users/:id" element={<User />} />
			<Route path="conversations" element={<Conversations />} />
			<Route path="search" element={<SearchUser />} />
			<Route path="*" element={<Homepage />} />
		</Route>
	),
	{
		future: {
			relativeSplatPath: true,
			startTransition: true,
		},
	}
);

const App = () => (
	<ErrorProvider>
		<AuthProvider>
			<LayoutProvider>
				<Toaster position="top-right" />
				<RouterProvider router={router} />
			</LayoutProvider>
		</AuthProvider>
	</ErrorProvider>
);

export default App;
