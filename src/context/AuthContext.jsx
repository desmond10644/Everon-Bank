import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(() => {
		try {
			const u = localStorage.getItem("user");
			return u ? JSON.parse(u) : null;
		} catch {
			return null;
		}
	});

	const [token, setToken] = useState(() => {
		try {
			return localStorage.getItem("token") || null;
		} catch {
			return null;
		}
	});

	useEffect(() => {
		if (token) localStorage.setItem("token", token);
		else localStorage.removeItem("token");
	}, [token]);

	useEffect(() => {
		if (user) localStorage.setItem("user", JSON.stringify(user));
		else localStorage.removeItem("user");
	}, [user]);

	const login = ({ user: u, token: t }) => {
		setUser(u);
		setToken(t);
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	};

	return (
		<AuthContext.Provider value={{ user, token, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
