import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

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

import "./App.css";
import DeletedSelfies from "./Pages/DeletedSelfies";

import Hospitals from "./Pages/Hospitals";
import HospitalRequests from "./Pages/HospitalRequests";
import Caretakers from "./Pages/Caretakers";
import Admins from "./Pages/Admins";
import PendingRequests from "./Pages/PendingRequests";
import Settings from "./Pages/Settings";
import UserManagement from "./Pages/UserManagement";


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

// ================= ADMIN PROTECTED ROUTE =================
function ProtectedRoute({
  children,
}) {
  const token =
    localStorage.getItem(
      "token"
    );

  // NO TOKEN
  if (!token) {
    // return (
    //   <Navigate
    //     to="/login"
    //     replace
    //   />
    // );

    return (
  <Navigate
    to="/admin/login"
    replace
  />
);
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= LOGIN ================= */}
        {/* <Route
          path="/login"
          element={<Login />}
        /> */}


        <Route
  path="/login"
  element={<Navigate to="/admin/login" replace />}
/>

<Route
  path="/admin/login"
  element={<Login />}
/>

<Route
  path="/guardian/login"
  element={<Login />}
/>

<Route
  path="/superadmin/login"
  element={<Login />}
/>

<Route
  path="/superadmin"
  element={<GoogleCallback />}
/>

        {/* ================= PROTECTED ROUTES ================= */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* DASHBOARD */}
                  <Route
                    path="/"
                    element={
                      <Dashboard />
                    }
                  />

                   <Route
                    path="/admins"
                    element={
                      <Admins />
                    }
                  />

                  <Route
                    path="/pendingrequests"
                    element={
                      <PendingRequests/>
                    }
                  />

                  {/* PATIENTS */}
                  <Route
                    path="/patients"
                    element={
                      <Patients />
                    }
                  />

                  {/* MEDICATIONS */}
                  <Route
                    path="/medications"
                    element={
                      <MedicationManagement />
                    }
                  />

                  {/* TODAY SCHEDULE */}
                  <Route
                    path="/today-schedule"
                    element={
                      <TodaySchedule />
                    }
                  />

                   <Route
                    path="/deletedselfie"
                    element={
                      <DeletedSelfies/>
                    }
                  />

                  {/* PRESCRIPTIONS */}
                  <Route
                    path="/prescriptions"
                    element={
                      <PrescriptionPage />
                    }
                  />

                  {/* REPORTS */}
                  <Route
                    path="/reports"
                    element={
                      <ReportsPage />
                    }
                  />

                  {/* VITALS */}
                  <Route
                    path="/vitals"
                    element={
                      <VitalsPage />
                    }
                  />

                  {/* COMPLIANCE */}
                  <Route
                    path="/compliance"
                    element={
                      <ComplianceTracker />
                    }
                  />

                  <Route
  path="/hospitals"
  element={<Hospitals />}
/>

<Route
  path="/hospital-requests"
  element={<HospitalRequests />}
/>

<Route
  path="/caretakers"
  element={<Caretakers />}
/>

<Route
  path="/settings"
  element={<Settings/>}
/>

<Route
  path="/users"
  element={<UserManagement/>}
/>
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;