import api from "../../services/api";

export const loginAdmin = async (credentials) => {
	const response = await api.post("/auth/login", credentials);
	if (!response.data?.user || !["admin", "super_admin"].includes(response.data.user.role)) {
		throw new Error("Administrator access required");
	}
	return response.data;
};

export const getAdminOverview = async () => {
	const response = await api.get("/admin/overview");
	return response.data.data;
};

export const getAdminSettings = async () => {
	const response = await api.get("/admin/settings");
	return response.data.data;
};

export const updateAdminSettings = async (settings) => {
	const response = await api.put("/admin/settings", settings);
	return response.data;
};
