import { useState, useEffect, useMemo } from "react";
import {
  Pill,
  Search,
  Filter,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldCheck,
  FileText,
  Bell,
  Sun,
  Sunset,
  Moon,
  Info,
} from "lucide-react";
import { useGuardianPatient } from "./GuardianPatientContext";
import api from "../../Api/axios";

export default function GuardianMedications() {
  const { selectedPatientId, selectedPatient } = useGuardianPatient();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");

  const fetchMedications = async () => {
    if (!selectedPatientId) {
      setMedications([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/medications?patientId=${selectedPatientId}`);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.medications)
        ? res.data.medications
        : [];
      setMedications(list);
    } catch (err) {
      console.error("[GuardianMedications] Error fetching medications:", err);
      setError("Failed to load medication records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, [selectedPatientId]);

  const filteredMeds = useMemo(() => {
    return medications.filter((m) => {
      const q = search.toLowerCase();
      const matchesSearch =
        (m.name || "").toLowerCase().includes(q) ||
        (m.instructions || "").toLowerCase().includes(q);

      const isItemActive = m.status === "active" || m.active === true || m.active === undefined;
      const statusKey = isItemActive ? "active" : m.status?.toLowerCase() || "stopped";

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isItemActive) ||
        (statusFilter === "stopped" && (m.status === "stopped" || m.status === "cancelled")) ||
        (statusFilter === "completed" && m.status === "completed");

      return matchesSearch && matchesStatus;
    });
  }, [medications, search, statusFilter]);

  const stats = useMemo(() => {
    const total = medications.length;
    const active = medications.filter((m) => m.status === "active" || m.active === true || m.active === undefined).length;
    const completed = medications.filter((m) => m.status === "completed").length;
    const stopped = medications.filter((m) => m.status === "stopped" || m.status === "cancelled").length;
    return { total, active, completed, stopped };
  }, [medications]);

  const formatTimeSlot = (t) => {
    const lower = t.toLowerCase();
    if (lower === "morning") return "Morning (08:30 AM)";
    if (lower === "afternoon") return "Afternoon (12:00 PM)";
    if (lower === "evening") return "Evening (06:00 PM)";
    if (lower === "night") return "Night (09:00 PM)";
    return t;
  };

  const getTimeIcon = (t) => {
    const lower = t.toLowerCase();
    if (lower.includes("morning") || lower.includes("am")) return <Sun size={14} className="text-amber-500" />;
    if (lower.includes("afternoon")) return <Sunset size={14} className="text-orange-500" />;
    if (lower.includes("night") || lower.includes("evening")) return <Moon size={14} className="text-indigo-500" />;
    return <Clock size={14} className="text-blue-500" />;
  };

  const patientName = selectedPatient
    ? `${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`.trim() || selectedPatient.name || "Patient"
    : "Patient";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER BANNER */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Medication Regimen</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {patientName}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Read-only overview of daily active medicines, timings, dosage schedules, and doctor instructions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck size={14} />
            Read-Only Guardian Access
          </span>
          <button
            onClick={fetchMedications}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Refresh Medications"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* STATS METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Prescriptions</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Active Regimens</span>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{stats.active}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Completed Courses</span>
          <p className="text-2xl font-bold text-blue-600 mt-2">{stats.completed}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Stopped / Inactive</span>
          <p className="text-2xl font-bold text-gray-600 mt-2">{stats.stopped}</p>
        </div>
      </div>

      {/* SEARCH AND STATUS FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by medicine name or instruction..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {["all", "active", "completed", "stopped"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`
                px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap
                ${
                  statusFilter === st
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              `}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* MEDICATION CARDS LIST */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredMeds.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto border border-gray-200/80 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Pill size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Medications Found</h3>
          <p className="text-sm text-gray-500">
            {search || statusFilter !== "all"
              ? "No medication matched your current search and filter criteria."
              : "No prescribed medications are currently registered for this patient."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeds.map((med) => {
            const isActive = med.status === "active" || med.active === true || med.active === undefined;
            return (
              <div
                key={med._id}
                className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Pill size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{med.name}</h3>
                        <p className="text-xs font-semibold text-blue-600">
                          {med.dosage} {med.unit || "mg"} • <span className="capitalize">{med.frequency || "Daily"}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`
                        px-2.5 py-0.5 rounded-full text-xs font-bold uppercase
                        ${
                          isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : med.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-700"
                        }
                      `}
                    >
                      {isActive ? "Active" : med.status || "Stopped"}
                    </span>
                  </div>

                  {/* TIMINGS BADGES */}
                  <div className="mb-4">
                    <span className="text-[11px] font-semibold uppercase text-gray-400 block mb-1.5">Scheduled Timings</span>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(med.timings) && med.timings.length > 0 ? (
                        med.timings.map((t, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200/80 text-xs font-medium text-gray-700"
                          >
                            {getTimeIcon(t)}
                            {formatTimeSlot(t)}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No scheduled timings</span>
                      )}
                    </div>
                  </div>

                  {/* INSTRUCTIONS & DETAILS */}
                  {med.instructions && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600 flex items-start gap-2 mb-3">
                      <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{med.instructions}</span>
                    </div>
                  )}
                </div>

                {/* CARD FOOTER */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    Started: {med.startDate ? new Date(med.startDate).toLocaleDateString() : "Ongoing"}
                  </span>
                  {med.isContinue ? (
                    <span className="font-semibold text-indigo-600">Continuous Regimen</span>
                  ) : med.endDate ? (
                    <span>Ends: {new Date(med.endDate).toLocaleDateString()}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
