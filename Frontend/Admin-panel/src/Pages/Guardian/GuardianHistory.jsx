import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar,
  Pill,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ChevronDown,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  Eye,
  X,
  CalendarRange,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter
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

  const [timeframe, setTimeframe] = useState("week"); // "week", "14d", "month", "custom"

  // Status Filter: "all" | "taken" | "missed"
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state: Fixed at 7 days per page
  const PAGE_SIZE = 7;
  const [currentPage, setCurrentPage] = useState(1);

  // Custom date range state (default to past 7 days)
  const todayISO = new Date().toISOString().split("T")[0];
  const defaultPast7ISO = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [customStart, setCustomStart] = useState(defaultPast7ISO);
  const [customEnd, setCustomEnd] = useState(todayISO);
  const [dateRangeError, setDateRangeError] = useState("");

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

  // Validate custom date range
  const validateCustomDates = (start, end) => {
    if (!start || !end) return "Both start and end dates are required.";
    const s = new Date(start);
    const e = new Date(end);
    if (s > e) return "Start date cannot be after end date.";

    const diffDays = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays > 30) {
      return "Custom range cannot exceed 30 days. Please select a shorter date window.";
    }
    return "";
  };

  // Reset page when timeframe, date range, or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [timeframe, statusFilter, selectedPatientId, customStart, customEnd]);

  // 2. Fetch Dose History
  const fetchHistory = useCallback(async () => {
    if (!selectedPatientId) return;

    if (timeframe === "custom") {
      const validationErr = validateCustomDates(customStart, customEnd);
      if (validationErr) {
        setDateRangeError(validationErr);
        return;
      }
      setDateRangeError("");
    }

    setLoading(true);
    setError("");

    try {
      const params = {
        patientId: selectedPatientId,
      };

      if (timeframe === "week") {
        params.timeframe = "week";
      } else if (timeframe === "14d") {
        const now = new Date();
        const past14 = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
        params.timeframe = "custom";
        params.startDate = past14.toISOString().split("T")[0];
        params.endDate = now.toISOString().split("T")[0];
      } else if (timeframe === "month") {
        params.timeframe = "month";
      } else if (timeframe === "custom") {
        params.timeframe = "custom";
        params.startDate = customStart;
        params.endDate = customEnd;
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
  }, [selectedPatientId, timeframe, customStart, customEnd]);

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

  // 3. Map individual doses from `schedules` grouped by date
  const timelineWithDoses = useMemo(() => {
    const schedules = historyData?.schedules || [];
    const timeline = historyData?.timeline || [];

    // Group individual dose objects by date
    const dosesByDate = {};
    for (const dose of schedules) {
      const d = dose.date;
      if (!d) continue;
      if (!dosesByDate[d]) {
        dosesByDate[d] = [];
      }
      dosesByDate[d].push(dose);
    }

    // Sort doses within each date chronologically by time
    for (const d in dosesByDate) {
      dosesByDate[d].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    }

    // If backend returned timeline items, use them and attach doses
    if (timeline.length > 0) {
      return timeline
        .map((item) => {
          const dayDoses = dosesByDate[item.date] || [];
          const taken = dayDoses.filter((x) => (x.status || "").toLowerCase() === "taken").length;
          const missed = dayDoses.filter((x) => (x.status || "").toLowerCase() === "missed").length;
          const pending = dayDoses.filter((x) => (x.status || "").toLowerCase() === "pending").length;

          return {
            date: item.date,
            dayLabel: item.dayLabel,
            doses: dayDoses,
            total: dayDoses.length || item.taken + item.missed + item.pending || 0,
            taken: taken || item.taken || 0,
            missed: missed || item.missed || 0,
            pending: pending || item.pending || 0,
          };
        })
        .sort((a, b) => b.date.localeCompare(a.date));
    }

    // Fallback: build timeline array directly from dosesByDate
    const dateKeys = Object.keys(dosesByDate).sort((a, b) => b.localeCompare(a));
    return dateKeys.map((dateStr) => {
      const dayDoses = dosesByDate[dateStr];
      const taken = dayDoses.filter((x) => (x.status || "").toLowerCase() === "taken").length;
      const missed = dayDoses.filter((x) => (x.status || "").toLowerCase() === "missed").length;
      const pending = dayDoses.filter((x) => (x.status || "").toLowerCase() === "pending").length;

      return {
        date: dateStr,
        doses: dayDoses,
        total: dayDoses.length,
        taken,
        missed,
        pending,
      };
    });
  }, [historyData]);

  // 4. Filter timeline based on Status Filter ("all", "taken", "missed")
  const filteredTimeline = useMemo(() => {
    if (statusFilter === "all") {
      return timelineWithDoses;
    }

    const targetStatus = statusFilter.toLowerCase(); // "taken" | "missed"

    return timelineWithDoses
      .map((dayGroup) => {
        const matchingDoses = (dayGroup.doses || []).filter(
          (d) => (d.status || "").toLowerCase() === targetStatus
        );

        return {
          ...dayGroup,
          filteredDoses: matchingDoses,
          matchingCount: matchingDoses.length,
        };
      })
      .filter((dayGroup) => dayGroup.matchingCount > 0);
  }, [timelineWithDoses, statusFilter]);

  // Pagination calculations: 7 days per page
  const totalDays = filteredTimeline.length;
  const totalPages = Math.max(1, Math.ceil(totalDays / PAGE_SIZE));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTimeline = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
    return filteredTimeline.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredTimeline, validCurrentPage, PAGE_SIZE]);

  const patientDisplayName = selectedPatient
    ? `${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`.trim() || selectedPatient.name || "Elder Patient"
    : "Patient";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* TOP BAR: PATIENT SELECTION & TIMEFRAME */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl self-start md:self-center">
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
            <button
              onClick={() => setTimeframe("custom")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                timeframe === "custom"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <CalendarRange size={13} />
              <span>Custom (Up to 30d)</span>
            </button>
          </div>
        </div>

        {/* CUSTOM DATE RANGE PICKER ROW (WHEN CUSTOM SELECTED) */}
        {timeframe === "custom" && (
          <div className="pt-4 mt-1 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/40 p-4 rounded-xl border border-blue-100/80">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-700">From:</label>
                <input
                  type="date"
                  value={customStart}
                  max={todayISO}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-700">To:</label>
                <input
                  type="date"
                  value={customEnd}
                  max={todayISO}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={fetchHistory}
                disabled={loading}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Apply Range</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>Select any date range up to 30 consecutive days</span>
            </div>
          </div>
        )}

        {dateRangeError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{dateRangeError}</span>
          </div>
        )}
      </div>

      {/* INTERACTIVE ADHERENCE STATS CARDS */}
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

        {/* TOTAL DOSES (CLICKABLE TO RESET STATUS FILTER) */}
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`text-left bg-white rounded-2xl p-5 border shadow-sm transition-all cursor-pointer ${
            statusFilter === "all"
              ? "border-blue-500 ring-2 ring-blue-100 shadow-md"
              : "border-gray-100 hover:border-gray-300"
          }`}
        >
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
            <span className="text-xs text-gray-400">all scheduled</span>
          </div>
        </button>

        {/* TAKEN (CLICKABLE TO FILTER TAKEN ONLY) */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "taken" ? "all" : "taken")}
          className={`text-left bg-white rounded-2xl p-5 border shadow-sm transition-all cursor-pointer ${
            statusFilter === "taken"
              ? "border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/40 shadow-md"
              : "border-emerald-100 hover:border-emerald-300 bg-gradient-to-br from-emerald-50/30 to-white"
          }`}
        >
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
            <span className="text-xs text-emerald-600 font-medium">
              {statusFilter === "taken" ? "• Active filter" : "doses completed"}
            </span>
          </div>
        </button>

        {/* MISSED (CLICKABLE TO FILTER MISSED ONLY) */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === "missed" ? "all" : "missed")}
          className={`text-left bg-white rounded-2xl p-5 border shadow-sm transition-all cursor-pointer ${
            statusFilter === "missed"
              ? "border-red-500 ring-2 ring-red-200 bg-red-50/40 shadow-md"
              : "border-red-100 hover:border-red-300 bg-gradient-to-br from-red-50/30 to-white"
          }`}
        >
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
            <span className="text-xs text-red-600 font-medium">
              {statusFilter === "missed" ? "• Active filter" : "doses missed"}
            </span>
          </div>
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STATUS FILTER CONTROLS BAR */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter size={13} className="text-gray-400" />
            Filter Doses:
          </span>

          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Doses ({summary.total})
          </button>

          <button
            onClick={() => setStatusFilter("taken")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === "taken"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Taken ({summary.taken})</span>
          </button>

          <button
            onClick={() => setStatusFilter("missed")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === "missed"
                ? "bg-red-600 text-white shadow-sm"
                : "bg-red-50 text-red-700 hover:bg-red-100"
            }`}
          >
            <XCircle size={13} />
            <span>Missed ({summary.missed})</span>
          </button>
        </div>

        {/* ACTIVE TIMEFRAME BADGE */}
        <div className="text-xs text-gray-500 font-medium">
          {totalDays} {totalDays === 1 ? "day" : "days"} with {statusFilter === "all" ? "scheduled" : statusFilter} doses
        </div>
      </div>

      {/* DAILY GROUPED TIMELINE */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : paginatedTimeline.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3">
              <CalendarCheck size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-800">
              {statusFilter !== "all"
                ? `No ${statusFilter === "taken" ? "Taken" : "Missed"} Doses Found`
                : "No History Available"}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              {statusFilter !== "all"
                ? `There were no ${statusFilter} doses recorded in the selected date range.`
                : `There is no medication activity logged for ${patientDisplayName} in the selected timeframe.`}
            </p>
          </div>
        ) : (
          paginatedTimeline.map((dayGroup) => {
            const dayTitle = formatDayHeader(dayGroup.date);
            const dayTaken = dayGroup.taken || 0;
            const dayTotal = dayGroup.total || (dayGroup.doses ? dayGroup.doses.length : 0);
            const dayDoses = dayGroup.filteredDoses || dayGroup.doses || [];

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
                      {statusFilter === "taken"
                        ? `${dayDoses.length} Taken`
                        : statusFilter === "missed"
                        ? `${dayDoses.length} Missed`
                        : `${dayTaken} / ${dayTotal} Taken`}
                    </span>
                  </div>
                </div>

                {/* DOSES FOR THIS DAY */}
                <div className="space-y-2.5">
                  {dayDoses.map((dose, idx) => {
                    const medName = dose.medicationName || dose.medication?.name || "Medication";
                    const dosage = dose.dosage || dose.medication?.dosage || "";
                    const time12 = formatTimeTo12Hour(dose.time);
                    const status = (dose.status || "pending").toLowerCase();
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

      {/* PAGINATION CONTROLS (RENDERS WHEN TOTAL DAYS EXCEED 7) */}
      {!loading && totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-gray-500 font-medium">
            Showing days <span className="font-bold text-gray-800">{(validCurrentPage - 1) * PAGE_SIZE + 1}</span> to{" "}
            <span className="font-bold text-gray-800">
              {Math.min(validCurrentPage * PAGE_SIZE, totalDays)}
            </span>{" "}
            of <span className="font-bold text-gray-800">{totalDays}</span> days total
          </div>

          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage === 1}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                  validCurrentPage === pageNum
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

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
