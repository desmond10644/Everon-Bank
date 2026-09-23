import React, { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminNavbar from "./components/AdminNavbar/AdminNavbar";
import AdminSidebar from "./components/AdminSidebar/AdminSidebar";
import AdminFooter from "./components/AdminFooter/AdminFooter";

import AdminLogin from "./pages/AdminLogin/AdminLogin";
import Dashboard from "./pages/Dashboard/Dashboard";
import Users from "./pages/Users/Users";
import Accounts from "./pages/Accounts/Accounts";
import Transactions from "./pages/Transactions/Transactions";
import Transfers from "./pages/Transfers/Transfers";
import Cards from "./pages/Cards/Cards";
import Loans from "./pages/Loans/Loans";
import Investments from "./pages/Investments/Investment";
import Notifications from "./pages/Notification/Notification";
import NotFound from "./pages/Notfound/Notfound";
import Reports from "./pages/Reports/Reports";
import AdminUsers from "./pages/AdminUsers/AdminUsers";
import Settings from "./pages/Settings/Settings";
// import NotFound from "./pages/NotFound/NotFound";

import { useAdminAuth } from "./Context/useAdminAuth";

const ProtectedAdminLayout = () => {
  const { isAuthenticated, loading } = useAdminAuth();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-app">
      <AdminNavbar
        onMenuClick={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route
            path="/transactions"
            element={<Transactions />}
          />
          <Route
            path="/transfers"
            element={<Transfers />}
          />
          <Route path="/cards" element={<Cards />} />
          <Route path="/loans" element={<Loans />} />
          <Route
            path="/investments"
            element={<Investments />}
          />
          <Route
            path="/notifications"
            element={<Notifications />}
          />
          <Route
            path="/reports"
            element={<Reports />}
          />
          <Route
            path="/admin-users"
            element={<AdminUsers />}
          />
          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </main>

      <AdminFooter />
    </div>
  );
};

const AdminApp = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={<AdminLogin />}
      />

      <Route
        path="/*"
        element={<ProtectedAdminLayout />}
      />
    </Routes>
  );
};

export default AdminApp;