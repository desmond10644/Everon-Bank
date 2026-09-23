import { useEffect, useState } from "react";
import { getAdminOverview, loginAdmin } from "../services/adminApi";
import { AdminAuthContext } from "./useAdminAuth";

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("mybank_admin") && localStorage.getItem("mybank_admin_token")));

  useEffect(() => {
    const storedAdmin = localStorage.getItem("mybank_admin");

    const storedToken = localStorage.getItem("mybank_admin_token");

    if (storedAdmin && storedToken) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        getAdminOverview()
          .then(() => setAdmin(parsedAdmin))
          .catch(() => {
            localStorage.removeItem("mybank_admin");
            localStorage.removeItem("mybank_admin_token");
          })
          .finally(() => setLoading(false));
        return;
      } catch {
        localStorage.removeItem("mybank_admin");
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginAdmin({ email, password });
      const adminData = {
        id: response.user.id,
        name: `${response.user.firstName || ""} ${response.user.lastName || ""}`.trim(),
        email: response.user.email,
        role: response.user.role,
      };

      localStorage.setItem("mybank_admin", JSON.stringify(adminData));
      localStorage.setItem("mybank_admin_token", response.token);
      setAdmin(adminData);

      return { success: true, admin: adminData };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message || "Admin login failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("mybank_admin");
    localStorage.removeItem("mybank_admin_token");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        isAuthenticated: !!admin,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
