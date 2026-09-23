import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
	const auth = useAuth();

	const token = auth && auth.token ? auth.token : localStorage.getItem("token");

	if (!token) {
		return <Navigate to="/login" replace />;
	}

	return children;
}
