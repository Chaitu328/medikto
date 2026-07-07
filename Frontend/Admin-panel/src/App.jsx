import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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
    return (
      <Navigate
        to="/login"
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
        <Route
          path="/login"
          element={<Login />}
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