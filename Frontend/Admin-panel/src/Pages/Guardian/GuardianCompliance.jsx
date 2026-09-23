import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Activity,
  Award,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { useGuardianPatient } from "./GuardianPatientContext";
import api from "../../Api/axios";

export default function GuardianCompliance() {
  const { selectedPatientId, selectedPatient } = useGuardianPatient();
  const [adherenceData, setAdherenceData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCompliance = async () => {
    if (!selectedPatientId) {
      setAdherenceData(null);
      setHistoryData(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");

      const [adhRes, histRes] = await Promise.all([
        api.get(`/adherence?patientId=${selectedPatientId}`),
        api.get(`/doses/history?patientId=${selectedPatientId}&timeframe=week`),
      ]);

      setAdherenceData(adhRes.data);
      setHistoryData(histRes.data);
    } catch (err) {
      console.error("[GuardianCompliance] Error fetching compliance:", err);
      setError("Failed to load medication adherence data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompliance();
  }, [selectedPatientId]);

  const percentage = adherenceData?.weeklyAdherence ?? 0;
  const status = adherenceData?.weeklyStatus || "Active";
  const totalDoses = adherenceData?.totalDoses ?? 0;
  const takenDoses = adherenceData?.takenDoses ?? 0;
  const missedDoses = adherenceData?.missedDoses ?? 0;

  const timelineChartData = useMemo(() => {
    if (Array.isArray(historyData?.timeline) && historyData.timeline.length > 0) {
      return historyData.timeline.map((item) => ({
        day: item.dayLabel || item.date || "—",
        taken: item.taken || 0,
        missed: item.missed || 0,
        pending: item.pending || 0,
      }));
    }
    return [];
  }, [historyData]);

  const patientName = selectedPatient
    ? `${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`.trim() || selectedPatient.name || "Patient"
    : "Patient";

  const getStatusColor = (st) => {
    switch ((st || "").toLowerCase()) {
      case "excellent":
      case "good":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "average":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "poor":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER BANNER */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Adherence & Compliance</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {patientName}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            7-day performance tracking, intake punctuality, and medication consistency insights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck size={14} />
            Read-Only Guardian Access
          </span>
          <button
            onClick={fetchCompliance}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Refresh Compliance"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* TOP SCORE & STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* HERO SCORE CARD */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                    7-Day Score
                  </span>
                  <Award size={22} className="text-yellow-300" />
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-extrabold">{percentage}%</span>
                  <span className="text-sm font-semibold text-blue-200">Adherence</span>
                </div>
                <p className="text-xs text-blue-100 mb-4">
                  Calculated based on taken vs scheduled doses over the last 7 calendar days.
                </p>
              </div>

              <div className="pt-4 border-t border-blue-400/30 flex items-center justify-between">
                <span className="text-xs text-blue-200">Performance Status</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-blue-900 shadow-sm">
                  {status}
                </span>
              </div>
            </div>

            {/* METRICS BREAKDOWN CARD */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex flex-col justify-between col-span-1 md:col-span-2">
              <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                <Activity size={18} className="text-blue-600" />
                Weekly Dose Distribution
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Clock size={16} className="text-gray-500" />
                    <span className="text-xs font-semibold uppercase text-gray-500">Scheduled</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{totalDoses}</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-semibold uppercase">Taken</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700">{takenDoses}</p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                  <div className="flex items-center gap-2 text-rose-600 mb-1">
                    <XCircle size={16} />
                    <span className="text-xs font-semibold uppercase">Missed</span>
                  </div>
                  <p className="text-2xl font-bold text-rose-700">{missedDoses}</p>
                </div>
              </div>

              {/* RATIO PROGRESS BAR */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5 font-medium">
                  <span>Intake Ratio</span>
                  <span>{totalDoses > 0 ? `${takenDoses}/${totalDoses} Doses Completed` : "0 Doses"}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 transition-all duration-500"
                    style={{ width: `${totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0}%` }}
                  />
                  <div
                    className="bg-rose-500 transition-all duration-500"
                    style={{ width: `${totalDoses > 0 ? (missedDoses / totalDoses) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 7-DAY DAILY TIMELINE BAR CHART */}
          {timelineChartData.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                Daily Dose Intake Activity (Last 7 Days)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        borderRadius: "12px",
                        border: "none",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                    <Bar dataKey="taken" name="Taken Doses" fill="#10B981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="missed" name="Missed Doses" fill="#EF4444" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="pending" name="Pending Doses" fill="#9CA3AF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
