import { Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Accounts from "./pages/accounts";
import Transfer from "./pages/transfer";
import Transaction from "./pages/transaction";
import Cards from "./pages/cards";
import Loans from "./pages/loans";
import Investment from "./pages/investment";
import Profile from "./pages/profile";
import Settings from "./pages/setting"; // <-- setting.jsx
import Help from "./pages/help";
import NotFound from "./pages/notfound";

import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminApp from "./admin/AdminApp";
import { AdminAuthProvider } from "./admin/Context/AdminAuthContext.jsx";

function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <AdminAuthProvider>
            <AdminApp />
          </AdminAuthProvider>
        }
      />
      <Route path="/" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/accounts"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Accounts />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/transfer"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Transfer />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Transaction />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/cards"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Cards />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/loans"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Loans />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/investments"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Investment />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/help" element={<AppLayout><Help /></AppLayout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;