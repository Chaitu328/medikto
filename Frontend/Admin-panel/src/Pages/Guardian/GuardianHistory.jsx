import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Pill,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ChevronDown,
  Filter,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  Eye,
  X
} from "lucide-react";
import api from "../../Api/axios";

// Helper to format 12-hour time
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

// Helper to format ISO Date to friendly display
function formatDayHeader(dateStr) {
  if (!dateStr) return "";
  try {
    const today = new Date().toISOString().split("T")[0];
    const yesterdayDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    if (dateStr === today) return "Today";
    if (dateStr === yesterdayDate) return "Yesterday";

    // Format like "Wednesday, Sep 18, 2024"
    const [year, month, day] = dateStr.split("-");
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Helper to format taken time
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

export default function GuardianHistory() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [timeframe, setTimeframe] = useState("week"); // "week", "14d", "month"
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [previewImage, setPreviewImage] = useState(null);

  // 1. Fetch Monitored Patients
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
        console.error("Error loading patients:", err);
      }
    }
    loadPatients();
  }, []);

  // Update selected patient object
  useEffect(() => {
    if (selectedPatientId && patients.length > 0) {
      const found = patients.find((p) => p._id === selectedPatientId);
      if (found) setSelectedPatient(found);
    }
  }, [selectedPatientId, patients]);

  // 2. Fetch Dose History
  const fetchHistory = useCallback(async () => {
    if (!selectedPatientId) return;

    setLoading(true);
    setError("");

    try {
      const tfParam = timeframe === "14d" ? "custom" : timeframe;
      const params = {
        patientId: selectedPatientId,
        timeframe: tfParam,
      };

      if (timeframe === "14d") {
        const now = new Date();
        const past14 = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
        params.startDate = past14.toISOString().split("T")[0];
        params.endDate = now.toISOString().split("T")[0];
      }

      const res = await api.get("/doses/history", { params });
      if (res.data?.success) {
        setHistoryData(res.data);
      } else {
        setHistoryData(null);
      }
    } catch (err) {
      console.error("Error fetching dose history:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load medication history."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId, timeframe]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const summary = historyData?.summary || {
    total: 0,
    taken: 0,
    missed: 0,
    pending: 0,
    adherencePercentage: 0,
  };

  const timeline = historyData?.timeline || [];

  // Sort timeline reverse chronologically
  const sortedTimeline = [...timeline].sort((a, b) => b.date.localeCompare(a.date));

  const patientDisplayName = selectedPatient
    ? `${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`.trim() || selectedPatient.name || "Elder Patient"
    : "Patient";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* TOP FILTER & PATIENT SELECTION BAR */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* PATIENT INFO OR SELECTOR */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
            <User size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Viewing History For
            </span>
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

        {/* TIMEFRAME PILL SWITCHER */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl self-start md:self-center">
          <button
            onClick={() => setTimeframe("week")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === "week"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeframe("14d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === "14d"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Last 14 Days
          </button>
          <button
            onClick={() => setTimeframe("month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === "month"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* ADHERENCE STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ADHERENCE % */}
        <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm bg-gradient-to-br from-blue-50/40 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
              Adherence Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-600">
              {summary.adherencePercentage}%
            </span>
            <span className="text-xs text-blue-700 font-medium">taken on time</span>
          </div>
        </div>

        {/* TOTAL DOSES */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Doses
            </span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
              <Pill size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {summary.total}
            </span>
            <span className="text-xs text-gray-400">recorded</span>
          </div>
        </div>

        {/* TAKEN */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm bg-gradient-to-br from-emerald-50/30 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Taken
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-700">
              {summary.taken}
            </span>
            <span className="text-xs text-emerald-600 font-medium">doses completed</span>
          </div>
        </div>

        {/* MISSED */}
        <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm bg-gradient-to-br from-red-50/30 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
              Missed
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-red-700">
              {summary.missed}
            </span>
            <span className="text-xs text-red-600 font-medium">doses missed</span>
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

      {/* DAILY GROUPED TIMELINE */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : sortedTimeline.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3">
              <CalendarCheck size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-800">No History Available</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              There is no medication activity logged for {patientDisplayName} in the selected timeframe.
            </p>
          </div>
        ) : (
          sortedTimeline.map((dayGroup) => {
            const dayTitle = formatDayHeader(dayGroup.date);
            const dayTaken = dayGroup.taken || 0;
            const dayTotal = dayGroup.total || (dayGroup.doses ? dayGroup.doses.length : 0);
            const dayDoses = dayGroup.doses || [];

            return (
              <div
                key={dayGroup.date}
                className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm"
              >
                {/* DAY HEADER */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{dayTitle}</h3>
                      <p className="text-[11px] text-gray-400">{dayGroup.date}</p>
                    </div>
                  </div>

                  {/* DAY MINI SUMMARY */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                      {dayTaken} / {dayTotal} Taken
                    </span>
                  </div>
                </div>

                {/* DOSES FOR THIS DAY */}
                <div className="space-y-2.5">
                  {dayDoses.map((dose, idx) => {
                    const medName = dose.medicationName || dose.medication?.name || "Medication";
                    const dosage = dose.dosage || dose.medication?.dosage || "";
                    const time12 = formatTimeTo12Hour(dose.time);
                    const status = dose.status || "pending";
                    const isTaken = status === "taken";
                    const isMissed = status === "missed";

                    return (
                      <div
                        key={dose._id || `${dayGroup.date}-${idx}`}
                        className={`
                          p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm
                          ${
                            isTaken
                              ? "bg-emerald-50/30 border-emerald-100"
                              : isMissed
                              ? "bg-red-50/30 border-red-100"
                              : "bg-gray-50/50 border-gray-100"
                          }
                        `}
                      >
                        {/* LEFT: DOSE INFO */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                              w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold
                              ${
                                isTaken
                                  ? "bg-emerald-100 text-emerald-700"
                                  : isMissed
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-200 text-gray-600"
                              }
                            `}
                          >
                            <Pill size={14} />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{medName}</span>
                              {dosage && (
                                <span className="text-xs text-gray-500 font-normal">
                                  • {dosage}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              Scheduled for {time12}
                            </span>
                          </div>
                        </div>

                        {/* RIGHT: STATUS */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {isTaken ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                              <CheckCircle2 size={14} className="text-emerald-600" />
                              <span>✓ Taken</span>
                              {dose.takenAt && (
                                <span className="text-emerald-600/80 font-normal text-[11px]">
                                  ({formatTakenTime(dose.takenAt)})
                                </span>
                              )}
                            </div>
                          ) : isMissed ? (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
                              <XCircle size={14} className="text-red-600" />
                              <span>✗ Missed</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                              <Clock size={14} />
                              <span>Pending</span>
                            </div>
                          )}

                          {/* VIEW PROOF PHOTO IF AVAILABLE (VIEW-ONLY) */}
                          {dose.proofImage && isTaken && (
                            <button
                              onClick={() => setPreviewImage(dose.proofImage)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 ml-2"
                            >
                              <Eye size={12} />
                              <span>Proof</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PROOF IMAGE MODAL */}
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
