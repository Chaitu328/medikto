import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";

import Layout from "./Layout";

// ================= PAGES =================
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Patients from "./Pages/PatientManagement";
import MedicationManagement from "./Pages/MedicationManagement";
import TodaySchedule from "./Pages/TodaySchedule";
import PrescriptionPage from "./Pages/Prescription";
import ReportsPage from "./Pages/Reports";
import VitalsPage from "./Pages/Vitals";
import ComplianceTracker from "./Pages/ComplianceTracker";
import DeletedSelfies from "./Pages/DeletedSelfies";
import Hospitals from "./Pages/Hospitals";
import HospitalRequests from "./Pages/HospitalRequests";
import Caretakers from "./Pages/Caretakers";
import Admins from "./Pages/Admins";
import PendingRequests from "./Pages/PendingRequests";
import Settings from "./Pages/Settings";
import UserManagement from "./Pages/UserManagement";

// ================= GUARDIAN PORTAL =================
import GuardianLayout from "./Pages/Guardian/GuardianLayout";
import GuardianDashboard from "./Pages/Guardian/GuardianDashboard";
import GuardianHistory from "./Pages/Guardian/GuardianHistory";
import GuardianProfile from "./Pages/Guardian/GuardianProfile";
import GuardianMedications from "./Pages/Guardian/GuardianMedications";
import GuardianVitals from "./Pages/Guardian/GuardianVitals";
import GuardianReports from "./Pages/Guardian/GuardianReports";
import GuardianPrescriptions from "./Pages/Guardian/GuardianPrescriptions";
import GuardianCompliance from "./Pages/Guardian/GuardianCompliance";
import GuardianChangePassword from "./Pages/Guardian/GuardianChangePassword";

import "./App.css";
import ToastContainer from "./Components/Notification/ToastContainer";

const decodeJwtPayload = (jwtToken) => {
  try {
    const parts = (jwtToken || "").split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      window.history.replaceState({}, document.title, window.location.pathname);
      const payload = decodeJwtPayload(token);
      if (payload && payload.role === "superadmin") {
        localStorage.setItem("token", token);
        localStorage.setItem("role", "superadmin");
        navigate("/superadmin/dashboard", { replace: true });
      } else {
        navigate("/superadmin/login?error=unauthorized", { replace: true });
      }
    }
  }, [navigate]);

  return <div>Signing in...</div>;
}

// ================= ROLE-BASED ROUTE GUARDS =================
function SuperAdminProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/superadmin/login" replace />;
  }

  const payload = decodeJwtPayload(token);
  // Strictly enforce that the cryptographically signed JWT role is superadmin!
  if (!payload || payload.role !== "superadmin") {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    return <Navigate to="/superadmin/login?error=unauthorized" replace />;
  }

  return children;
}

function HospitalAdminProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return <Navigate to="/admin/login" replace />;
  }

  if (payload.role === "guardian") {
    return <Navigate to="/guardian" replace />;
  }

  // If a Super Admin enters /admin/*, seamlessly redirect to /superadmin/*
  if (payload.role === "superadmin") {
    return <Navigate to="/superadmin/dashboard" replace />;
  }

  if (payload.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

// ================= ROOT & FLAT URL SMART REDIRECTOR =================
function RootRedirect() {
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").toLowerCase();

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (role === "superadmin") {
    return <Navigate to="/superadmin/dashboard" replace />;
  }

  if (role === "guardian") {
    return <Navigate to="/guardian" replace />;
  }

  return <Navigate to="/admin/dashboard" replace />;
}

function LegacyRoleRedirect({ subpath }) {
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").toLowerCase();

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (role === "superadmin") {
    return <Navigate to={`/superadmin/${subpath}`} replace />;
  }

  if (role === "guardian") {
    return <Navigate to="/guardian" replace />;
  }

  return <Navigate to={`/admin/${subpath}`} replace />;
}

// ================= GUARDIAN ROUTE GUARD =================
function GuardianProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/guardian/login" replace />;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    return <Navigate to="/guardian/login" replace />;
  }

  if (payload.role === "superadmin") {
    return <Navigate to="/superadmin/dashboard" replace />;
  }

  if (payload.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (payload.role !== "guardian") {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    return <Navigate to="/guardian/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      {/* Global Notification Container */}
      <ToastContainer />

      <Routes>
        {/* ================= PUBLIC AUTH ROUTES ================= */}
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/guardian/login" element={<Login />} />
        <Route path="/superadmin/login" element={<Login />} />
        <Route path="/superadmin/callback" element={<GoogleCallback />} />

        {/* ================= GUARDIAN PORTAL ROUTES ================= */}
        <Route
          path="/guardian/change-password"
          element={
            <GuardianProtectedRoute>
              <GuardianLayout>
                <GuardianChangePassword />
              </GuardianLayout>
            </GuardianProtectedRoute>
          }
        />

        <Route
          path="/guardian"
          element={
            <GuardianProtectedRoute>
              <GuardianLayout>
                <GuardianDashboard />
              </GuardianLayout>
            </GuardianProtectedRoute>
          }
        />

        <Route
          path="/guardian/profile"
          element={
            <GuardianProtectedRoute>
              <GuardianLayout>
                <GuardianProfile />
              </GuardianLayout>
            </GuardianProtectedRoute>
          }
        />

        <Route
          path="/guardian/medications"
          element={
            <GuardianProtectedRoute>
              <GuardianLayout>
                <GuardianMedications />
              </GuardianLayout>
            </GuardianProtectedRoute>
          }
        />

        <Route
          path="/guardian/history"
          element={
            <GuardianProtectedRoute>
              <GuardianLayout>
                <GuardianHistory />
              </GuardianLayout>
            </GuardianProtectedRoute>
          }
        />

        <Route
          path="/guardian/vitals"
          element={
            <GuardianProtectedRoute>
              <GuardianLayout>
                <GuardianVitals />
              </GuardianLayout>
            </GuardianProtectedRoute>
          }
        />

        <Route
          path="/guardian/reports"
          element={
            <GuardianProtectedRoute>
              <GuardianLayout>
                <GuardianReports />
              </GuardianLayout>
            </GuardianProtectedRoute>
          }
        />

        <Route
          path="/guardian/prescriptions"
          element={
            <GuardianProtectedRoute>
              <GuardianLayout>
                <GuardianPrescriptions />
              </GuardianLayout>
            </GuardianProtectedRoute>
          }
        />

        <Route
          path="/guardian/compliance"
          element={
            <GuardianProtectedRoute>
              <GuardianLayout>
                <GuardianCompliance />
              </GuardianLayout>
            </GuardianProtectedRoute>
          }
        />

        {/* ================= SUPER ADMIN NAMESPACED ROUTES (/superadmin/*) ================= */}
        <Route
          path="/superadmin/*"
          element={
            <SuperAdminProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/hospitals" element={<Hospitals />} />
                  <Route path="/hospital-requests" element={<HospitalRequests />} />
                  <Route path="/caretakers" element={<Caretakers />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/medications" element={<MedicationManagement />} />
                  <Route path="/today-schedule" element={<TodaySchedule />} />
                  <Route path="/deletedselfie" element={<DeletedSelfies />} />
                  <Route path="/prescriptions" element={<PrescriptionPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/vitals" element={<VitalsPage />} />
                  <Route path="/compliance" element={<ComplianceTracker />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/admins" element={<Admins />} />
                  <Route path="/pendingrequests" element={<PendingRequests />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/superadmin/dashboard" replace />} />
                </Routes>
              </Layout>
            </SuperAdminProtectedRoute>
          }
        />

        {/* ================= HOSPITAL ADMIN NAMESPACED ROUTES (/admin/*) ================= */}
        <Route
          path="/admin/*"
          element={
            <HospitalAdminProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/caretakers" element={<Caretakers />} />
                  <Route path="/medications" element={<MedicationManagement />} />
                  <Route path="/today-schedule" element={<TodaySchedule />} />
                  <Route path="/deletedselfie" element={<DeletedSelfies />} />
                  <Route path="/prescriptions" element={<PrescriptionPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/vitals" element={<VitalsPage />} />
                  <Route path="/compliance" element={<ComplianceTracker />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                </Routes>
              </Layout>
            </HospitalAdminProtectedRoute>
          }
        />

        {/* ================= ROOT & LEGACY FLAT ROUTE REDIRECTS ================= */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/dashboard" element={<RootRedirect />} />

        {/* Superadmin-only legacy routes */}
        <Route path="/hospitals" element={<Navigate to="/superadmin/hospitals" replace />} />
        <Route path="/hospital-requests" element={<Navigate to="/superadmin/hospital-requests" replace />} />
        <Route path="/users" element={<Navigate to="/superadmin/users" replace />} />
        <Route path="/admins" element={<Navigate to="/superadmin/admins" replace />} />
        <Route path="/pendingrequests" element={<Navigate to="/superadmin/pendingrequests" replace />} />

        {/* Shared legacy routes dynamically redirect to the active role namespace */}
        <Route path="/caretakers" element={<LegacyRoleRedirect subpath="caretakers" />} />
        <Route path="/patients" element={<LegacyRoleRedirect subpath="patients" />} />
        <Route path="/medications" element={<LegacyRoleRedirect subpath="medications" />} />
        <Route path="/today-schedule" element={<LegacyRoleRedirect subpath="today-schedule" />} />
        <Route path="/deletedselfie" element={<LegacyRoleRedirect subpath="deletedselfie" />} />
        <Route path="/prescriptions" element={<LegacyRoleRedirect subpath="prescriptions" />} />
        <Route path="/reports" element={<LegacyRoleRedirect subpath="reports" />} />
        <Route path="/vitals" element={<LegacyRoleRedirect subpath="vitals" />} />
        <Route path="/compliance" element={<LegacyRoleRedirect subpath="compliance" />} />
        <Route path="/settings" element={<LegacyRoleRedirect subpath="settings" />} />

        {/* Catch-all */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;