import { useState, useEffect, useRef, useCallback } from "react";
import {
  Pill,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  RefreshCw,
  User,
  ChevronDown,
  Sun,
  Sunset,
  Moon,
  Calendar,
  Eye,
  X,
  Sparkles,
  ShieldAlert,
  Info
} from "lucide-react";
import api from "../../Api/axios";

// Helper to format ISO or time string to readable 12-hour format
function formatTimeTo12Hour(timeStr) {
  if (!timeStr) return "";
  if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
}

// Helper to format Date/Timestamp
function formatTakenTime(timestamp) {
  if (!timestamp) return "";
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return timestamp;
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timestamp;
  }
}

// Helper to get timing icon based on time string or slot
function getTimeSlotIcon(timeStr) {
  if (!timeStr) return <Clock size={16} className="text-gray-400" />;
  const lower = timeStr.toLowerCase();
  if (lower.includes("am") || timeStr.startsWith("0") || timeStr.startsWith("10") || timeStr.startsWith("11")) {
    return <Sun size={18} className="text-amber-500" />;
  }
  if (lower.includes("pm")) {
    const hour = parseInt(timeStr, 10);
    if (hour >= 6 && hour < 12) {
      return <Moon size={18} className="text-indigo-500" />;
    }
    return <Sunset size={18} className="text-orange-500" />;
  }
  return <Clock size={18} className="text-blue-500" />;
}

export default function GuardianDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [error, setError] = useState("");

  // Proof image preview modal (view-only)
  const [previewImage, setPreviewImage] = useState(null);

  // 1. Fetch Linked Patients on mount
  useEffect(() => {
    async function loadPatients() {
      try {
        const res = await api.get("/profile/caretakers/patients");
        const list = Array.isArray(res.data) ? res.data : [];
        setPatients(list);

        if (list.length > 0) {
          setSelectedPatientId(list[0]._id);
          setSelectedPatient(list[0]);
        } else {
          // Check localStorage user.guardianFor as fallback
          try {
            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            if (Array.isArray(stored.guardianFor) && stored.guardianFor.length > 0) {
              const first = stored.guardianFor[0];
              const pId = typeof first === "object" ? first._id : first;
              setSelectedPatientId(pId);
              setSelectedPatient(typeof first === "object" ? first : { _id: pId, firstName: "Linked Patient" });
            }
          } catch (e) {
            console.error(e);
          }
        }
      } catch (err) {
        console.error("Error loading caretaker patients:", err);
        setError("Failed to load linked patient information.");
      }
    }
    loadPatients();
  }, []);

  // Update selected patient object when ID changes
  useEffect(() => {
    if (selectedPatientId && patients.length > 0) {
      const found = patients.find((p) => p._id === selectedPatientId);
      if (found) setSelectedPatient(found);
    }
  }, [selectedPatientId, patients]);

  // 2. Fetch Today's Schedules for selected patient
  const fetchTodaySchedule = useCallback(
    async (isBackground = false) => {
      if (!isBackground) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError("");

      try {
        const todayStr = new Date().toISOString().split("T")[0];
        const params = { date: todayStr };
        if (selectedPatientId) {
          params.patientId = selectedPatientId;
        }

        const res = await api.get("/today", { params });
        if (res.data?.success) {
          setSchedules(res.data.schedules || []);
        } else if (Array.isArray(res.data)) {
          setSchedules(res.data);
        } else {
          setSchedules([]);
        }
        setLastRefreshed(new Date());
      } catch (err) {
        console.error("Error fetching today's schedule:", err);
        if (!isBackground) {
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              "Could not load today's medication schedule."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedPatientId]
  );

  useEffect(() => {
    if (selectedPatientId) {
      fetchTodaySchedule(false);
    }
  }, [selectedPatientId, fetchTodaySchedule]);

  // 3. 30-Second Silent Real-Time Polling
  useEffect(() => {
    if (!selectedPatientId) return;

    const intervalId = setInterval(() => {
      fetchTodaySchedule(true);
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [selectedPatientId, fetchTodaySchedule]);

  // Derived counts for metric summary
  const totalDoses = schedules.length;
  const takenDoses = schedules.filter((s) => s.status === "taken").length;
  const pendingDoses = schedules.filter((s) => s.status === "pending" || !s.status).length;
  const missedDoses = schedules.filter((s) => s.status === "missed").length;

  const patientDisplayName = selectedPatient
    ? `${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`.trim() || selectedPatient.name || "Elder Patient"
    : "Patient";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* TOP BAR: PATIENT SELECTION & LIVE STATUS */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* PATIENT INFO OR SELECTOR */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
            <User size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Monitoring Patient
              </span>
              {patients.length > 1 && (
                <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {patients.length} Linked
                </span>
              )}
            </div>

            {patients.length > 1 ? (
              <div className="relative mt-1">
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-base font-bold rounded-xl py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {`${p.firstName || ""} ${p.lastName || ""}`.trim() || p.phone || "Patient"}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-2.5 top-3 text-gray-500 pointer-events-none"
                />
              </div>
            ) : (
              <h1 className="text-xl font-bold text-gray-900">
                {patientDisplayName}
              </h1>
            )}
          </div>
        </div>

        {/* LIVE SYNC STATUS & MANUAL REFRESH */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-emerald-700">Auto-updating (30s)</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Last synced: {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          </div>

          <button
            onClick={() => fetchTodaySchedule(false)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-all disabled:opacity-50"
            title="Refresh schedule now"
          >
            <RefreshCw size={14} className={refreshing || loading ? "animate-spin text-blue-600" : "text-gray-500"} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* TODAY'S SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Doses
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Pill size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold text-gray-900">
              {totalDoses}
            </span>
            <span className="text-xs text-gray-400">scheduled today</span>
          </div>
        </div>

        {/* TAKEN */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-emerald-100 shadow-sm bg-gradient-to-br from-emerald-50/30 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Taken
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold text-emerald-700">
              {takenDoses}
            </span>
            <span className="text-xs text-emerald-600/80 font-medium">completed</span>
          </div>
        </div>

        {/* PENDING */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-amber-100 shadow-sm bg-gradient-to-br from-amber-50/30 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Pending
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold text-amber-700">
              {pendingDoses}
            </span>
            <span className="text-xs text-amber-600/80 font-medium">remaining</span>
          </div>
        </div>

        {/* MISSED */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-red-100 shadow-sm bg-gradient-to-br from-red-50/30 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
              Missed
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold text-red-700">
              {missedDoses}
            </span>
            <span className="text-xs text-red-600/80 font-medium">needs attention</span>
          </div>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TODAY'S MEDICATION SCHEDULE LIST */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Today's Medication Timeline</h2>
            <p className="text-xs text-gray-500">
              Chronological schedule of medications for {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            <Info size={14} className="text-blue-500" />
            <span className="hidden sm:inline">View-Only Mode</span>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : schedules.length === 0 ? (
          /* EMPTY STATE */
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
              <Pill size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-800">No Medications Scheduled Today</h3>
            <p className="text-xs text-gray-500 max-w-sm mt-1">
              There are no active medication schedules for {patientDisplayName} on today's calendar.
            </p>
          </div>
        ) : (
          /* SCHEDULE CARDS */
          <div className="space-y-3">
            {schedules.map((dose) => {
              const med = dose.medication || {};
              const medName = med.name || dose.medicationName || "Medication";
              const dosage = med.dosage || dose.dosage || "";
              const instructions = med.instructions || dose.instructions || med.type || "";
              const scheduledTime12 = formatTimeTo12Hour(dose.time);
              const status = dose.status || "pending";
              const isTaken = status === "taken";
              const isMissed = status === "missed";
              const isPending = status === "pending";

              return (
                <div
                  key={dose._id || `${dose.time}-${medName}`}
                  className={`
                    p-4 md:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4
                    ${
                      isTaken
                        ? "bg-emerald-50/20 border-emerald-200/80 hover:border-emerald-300"
                        : isMissed
                        ? "bg-red-50/20 border-red-200/80 hover:border-red-300"
                        : "bg-white border-gray-200 hover:border-blue-200"
                    }
                  `}
                >
                  {/* LEFT: TIME & MEDICATION DETAILS */}
                  <div className="flex items-start gap-3.5">
                    {/* TIME ICON */}
                    <div
                      className={`
                        w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5
                        ${
                          isTaken
                            ? "bg-emerald-100 text-emerald-700"
                            : isMissed
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-50 text-blue-600"
                        }
                      `}
                    >
                      {getTimeSlotIcon(dose.time)}
                    </div>

                    <div>
                      {/* SCHEDULED TIME */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {scheduledTime12}
                        </span>
                        {dosage && (
                          <span className="text-xs text-gray-500 font-medium px-2 py-0.5 bg-gray-100 rounded-md">
                            {dosage}
                          </span>
                        )}
                      </div>

                      {/* MEDICATION NAME */}
                      <h4 className="text-base font-bold text-gray-900 mt-0.5 flex items-center gap-2">
                        <Pill size={16} className="text-blue-500" />
                        <span>{medName}</span>
                      </h4>

                      {/* INSTRUCTIONS / NOTES */}
                      {instructions && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {instructions}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: STATUS BADGE & TAKEN TIMESTAMP */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    {isTaken && (
                      <div className="flex flex-col sm:items-end">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span>✓ Taken</span>
                        </div>
                        <span className="text-xs text-emerald-700 font-medium mt-1">
                          Taken at {formatTakenTime(dose.takenAt || dose.updatedAt)}
                        </span>
                      </div>
                    )}

                    {isPending && (
                      <div className="flex flex-col sm:items-end">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock size={14} className="text-amber-600" />
                          <span>⏳ Pending</span>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          Scheduled for {scheduledTime12}
                        </span>
                      </div>
                    )}

                    {isMissed && (
                      <div className="flex flex-col sm:items-end">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                          <XCircle size={14} className="text-red-600" />
                          <span>✗ Missed</span>
                        </div>
                        <span className="text-xs text-red-600 font-medium mt-1">
                          Missed scheduled window
                        </span>
                      </div>
                    )}

                    {status === "cancelled" && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        <span>Cancelled</span>
                      </div>
                    )}

                    {/* PROOF PHOTO BUTTON IF AVAILABLE (VIEW-ONLY) */}
                    {dose.proofImage && isTaken && (
                      <button
                        onClick={() => setPreviewImage(dose.proofImage)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline mt-1"
                      >
                        <Eye size={12} />
                        <span>View Selfie Proof</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PROOF IMAGE MODAL (VIEW-ONLY) */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-sm">Medication Verification Selfie</h3>
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex flex-col items-center justify-center bg-gray-900">
              <img
                src={previewImage}
                alt="Verification Proof"
                className="max-h-[380px] w-auto rounded-xl object-contain shadow-lg"
              />
            </div>
            <div className="p-4 text-center bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Uploaded by patient via Medikto Mobile App
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
