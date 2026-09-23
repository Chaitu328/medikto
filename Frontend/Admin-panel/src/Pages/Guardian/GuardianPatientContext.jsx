import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../../Api/axios";

const GuardianPatientContext = createContext(null);

export function GuardianPatientProvider({ children }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientIdState] = useState(() => {
    return sessionStorage.getItem("guardian_selected_patient_id") || "";
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/profile/caretakers/patients");
      const list = Array.isArray(res.data) ? res.data : [];
      setPatients(list);

      if (list.length > 0) {
        // Check if previously selected ID is in the accessible list
        const savedId = sessionStorage.getItem("guardian_selected_patient_id");
        const matched = list.find((p) => p._id === savedId);

        if (matched) {
          setSelectedPatientIdState(matched._id);
          setSelectedPatient(matched);
        } else {
          // Default to first patient
          setSelectedPatientIdState(list[0]._id);
          setSelectedPatient(list[0]);
          sessionStorage.setItem("guardian_selected_patient_id", list[0]._id);
        }
      } else {
        // Fallback check from user profile in localStorage
        try {
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          if (Array.isArray(storedUser.guardianFor) && storedUser.guardianFor.length > 0) {
            const first = storedUser.guardianFor[0];
            const pId = typeof first === "object" ? first._id : first;
            const pObj = typeof first === "object" ? first : { _id: pId, firstName: "Linked Patient" };
            setPatients([pObj]);
            setSelectedPatientIdState(pId);
            setSelectedPatient(pObj);
            sessionStorage.setItem("guardian_selected_patient_id", pId);
          } else {
            setSelectedPatient(null);
            setSelectedPatientIdState("");
          }
        } catch {
          setSelectedPatient(null);
          setSelectedPatientIdState("");
        }
      }
    } catch (err) {
      console.error("[GuardianPatientContext] Error loading patients:", err);
      setError("Failed to load linked patient information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const setSelectedPatientId = useCallback((id) => {
    setSelectedPatientIdState(id);
    if (id) {
      sessionStorage.setItem("guardian_selected_patient_id", id);
      const found = patients.find((p) => p._id === id);
      if (found) {
        setSelectedPatient(found);
      }
    } else {
      sessionStorage.removeItem("guardian_selected_patient_id");
      setSelectedPatient(null);
    }
  }, [patients]);

  // Keep selectedPatient in sync if patients list updates
  useEffect(() => {
    if (selectedPatientId && patients.length > 0) {
      const found = patients.find((p) => p._id === selectedPatientId);
      if (found) {
        setSelectedPatient(found);
      }
    }
  }, [selectedPatientId, patients]);

  const value = {
    patients,
    selectedPatientId,
    selectedPatient,
    setSelectedPatientId,
    loading,
    error,
    refreshPatients: fetchPatients,
  };

  return (
    <GuardianPatientContext.Provider value={value}>
      {children}
    </GuardianPatientContext.Provider>
  );
}

export function useGuardianPatient() {
  const context = useContext(GuardianPatientContext);
  if (!context) {
    throw new Error("useGuardianPatient must be used within a GuardianPatientProvider");
  }
  return context;
}

export default GuardianPatientContext;
