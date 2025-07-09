import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import User from "./pages/User";
import Conversations from "./pages/Conversations";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./pages/Layout";

const App = () => (
	<AuthProvider>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout/>}>
					<Route index element={<Homepage />} />
					<Route path="login" element={<Login />} />
					<Route path="register" element={<Register />} />
					<Route path="users/:id" element={<User />} />
					<Route path="conversations" element={<Conversations />} />
					<Route path="*" element={<Homepage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	</AuthProvider>
);

export default App;
