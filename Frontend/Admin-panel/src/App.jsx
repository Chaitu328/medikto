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
import GuardianChangePassword from "./Pages/Guardian/GuardianChangePassword";

import "./App.css";

function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, "", "/");
    }
  }, [navigate]);

  return <div>Signing in...</div>;
}

// ================= ADMIN / SUPERADMIN ROUTE GUARD =================
function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").toLowerCase();

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Strictly block Guardians from accessing Admin/Superadmin areas
  if (role === "guardian") {
    return <Navigate to="/guardian" replace />;
  }

  return children;
}

// ================= GUARDIAN ROUTE GUARD =================
function GuardianProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "").toLowerCase();

  if (!token) {
    return <Navigate to="/guardian/login" replace />;
  }

  // Prevent non-guardian roles from accessing Guardian portal
  if (role !== "guardian") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC AUTH ROUTES ================= */}
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/guardian/login" element={<Login />} />
        <Route path="/superadmin/login" element={<Login />} />
        <Route path="/superadmin" element={<GoogleCallback />} />

        {/* ================= GUARDIAN PORTAL ROUTES ================= */}
        <Route
          path="/guardian/change-password"
          element={
            <GuardianProtectedRoute>
              <GuardianChangePassword />
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
          path="/guardian/history"
          element={
            <GuardianProtectedRoute>
              <GuardianLayout>
                <GuardianHistory />
              </GuardianLayout>
            </GuardianProtectedRoute>
          }
        />

        {/* ================= ADMIN / CLINICIAN PROTECTED ROUTES ================= */}
        <Route
          path="/*"
          element={
            <AdminProtectedRoute>
              <Layout>
                <Routes>
                  {/* DASHBOARD */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/admins" element={<Admins />} />
                  <Route path="/pendingrequests" element={<PendingRequests />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/medications" element={<MedicationManagement />} />
                  <Route path="/today-schedule" element={<TodaySchedule />} />
                  <Route path="/deletedselfie" element={<DeletedSelfies />} />
                  <Route path="/prescriptions" element={<PrescriptionPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/vitals" element={<VitalsPage />} />
                  <Route path="/compliance" element={<ComplianceTracker />} />
                  <Route path="/hospitals" element={<Hospitals />} />
                  <Route path="/hospital-requests" element={<HospitalRequests />} />
                  <Route path="/caretakers" element={<Caretakers />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/users" element={<UserManagement />} />
                </Routes>
              </Layout>
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;