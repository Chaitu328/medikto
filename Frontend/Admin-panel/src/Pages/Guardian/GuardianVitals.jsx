import { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Heart,
  Droplets,
  Thermometer,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Clock,
  Search,
  RefreshCw,
  Sparkles,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useGuardianPatient } from "./GuardianPatientContext";
import api from "../../Api/axios";

export default function GuardianVitals() {
  const { selectedPatientId, selectedPatient } = useGuardianPatient();
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [error, setError] = useState("");

  const fetchVitals = async () => {
    if (!selectedPatientId) {
      setVitals([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/vitals?patientId=${selectedPatientId}`);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.vitals)
        ? res.data.vitals
        : [];
      setVitals(list);
    } catch (err) {
      console.error("[GuardianVitals] Error fetching vitals:", err);
      setError("Failed to load patient vitals data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVitals();
  }, [selectedPatientId]);

  // Latest Vitals Computation
  const latestVitals = useMemo(() => {
    const bp = vitals.find((v) => v.type === "bloodPressure" || v.bloodPressure);
    const hr = vitals.find((v) => v.type === "heartRate" || v.heartRate);
    const temp = vitals.find((v) => v.type === "temperature" || v.temperature);
    const sugar = vitals.find((v) => v.type === "sugar" || v.sugarLevel);

    return { bp, hr, temp, sugar };
  }, [vitals]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    return [...vitals]
      .sort((a, b) => new Date(a.recordedAt || a.createdAt) - new Date(b.recordedAt || b.createdAt))
      .map((item) => {
        const dateStr = item.recordedAt || item.createdAt;
        const timeLabel = dateStr
          ? new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "—";

        return {
          time: timeLabel,
          systolic: item.bloodPressure?.systolic || null,
          diastolic: item.bloodPressure?.diastolic || null,
          heartRate: item.heartRate || null,
          temperature: item.temperature || null,
          sugarLevel: item.sugarLevel || null,
        };
      });
  }, [vitals]);

  // Filtered History Table
  const filteredList = useMemo(() => {
    if (selectedType === "all") return vitals;
    return vitals.filter((v) => v.type === selectedType);
  }, [vitals, selectedType]);

  const patientName = selectedPatient
    ? `${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`.trim() || selectedPatient.name || "Patient"
    : "Patient";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER BANNER */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Health Vitals & Trends</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {patientName}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time telemetry, vital metrics logs, and historical biometric trends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck size={14} />
            Read-Only Guardian Access
          </span>
          <button
            onClick={fetchVitals}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Refresh Vitals"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* LATEST VITALS SUMMARY METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* BLOOD PRESSURE */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Blood Pressure</span>
            <Activity size={18} className="text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {latestVitals.bp?.bloodPressure
              ? `${latestVitals.bp.bloodPressure.systolic}/${latestVitals.bp.bloodPressure.diastolic}`
              : "—"}
            <span className="text-xs text-gray-400 font-normal ml-1">mmHg</span>
          </p>
          <span className="text-xs text-gray-500 mt-1 block">
            Status: <strong className="text-rose-600">{latestVitals.bp?.bloodPressure?.status || "Normal"}</strong>
          </span>
        </div>

        {/* HEART RATE */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-600">Heart Rate</span>
            <Heart size={18} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {latestVitals.hr?.heartRate ? latestVitals.hr.heartRate : "—"}
            <span className="text-xs text-gray-400 font-normal ml-1">BPM</span>
          </p>
          <span className="text-xs text-gray-500 mt-1 block">
            Status: <strong className="text-red-600">{latestVitals.hr?.heartRateStatus || "Normal"}</strong>
          </span>
        </div>

        {/* BODY TEMPERATURE */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Temperature</span>
            <Thermometer size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {latestVitals.temp?.temperature ? latestVitals.temp.temperature : "—"}
            <span className="text-xs text-gray-400 font-normal ml-1">°F</span>
          </p>
          <span className="text-xs text-gray-500 mt-1 block">
            Status: <strong className="text-amber-600">{latestVitals.temp?.temperatureStatus || "Normal"}</strong>
          </span>
        </div>

        {/* BLOOD SUGAR */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Blood Sugar</span>
            <Droplets size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {latestVitals.sugar?.sugarLevel ? latestVitals.sugar.sugarLevel : "—"}
            <span className="text-xs text-gray-400 font-normal ml-1">mg/dL</span>
          </p>
          <span className="text-xs text-gray-500 mt-1 block">
            Status: <strong className="text-blue-600">{latestVitals.sugar?.sugarStatus || "Normal"}</strong>
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* TREND CHART */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" />
            Biometric Trends Over Time
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="systolic" name="Systolic BP" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="diastolic" name="Diastolic BP" stroke="#F87171" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#EC4899" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="sugarLevel" name="Sugar Level" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VITALS HISTORY LOG TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="font-bold text-gray-900 text-base">Recorded Measurements Log</h3>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: "all", label: "All Vitals" },
              { key: "bloodPressure", label: "BP" },
              { key: "heartRate", label: "Pulse" },
              { key: "temperature", label: "Temp" },
              { key: "sugar", label: "Sugar" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedType(tab.key)}
                className={`
                  px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                  ${
                    selectedType === tab.key
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No vital logs found for the selected category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/70 text-gray-400 uppercase text-[11px] font-bold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Vital Type</th>
                  <th className="px-6 py-3.5">Reading Value</th>
                  <th className="px-6 py-3.5">Clinical Status</th>
                  <th className="px-6 py-3.5">Recorded Timestamp</th>
                  <th className="px-6 py-3.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredList.map((item) => {
                  let valueStr = "—";
                  let statusBadge = item.status || "Normal";
                  let typeName = item.type || "Vital";

                  if (item.type === "bloodPressure" || item.bloodPressure) {
                    typeName = "Blood Pressure";
                    valueStr = item.bloodPressure ? `${item.bloodPressure.systolic}/${item.bloodPressure.diastolic} mmHg` : "—";
                    statusBadge = item.bloodPressure?.status || "Normal";
                  } else if (item.type === "heartRate" || item.heartRate) {
                    typeName = "Heart Rate";
                    valueStr = `${item.heartRate} BPM`;
                    statusBadge = item.heartRateStatus || "Normal";
                  } else if (item.type === "temperature" || item.temperature) {
                    typeName = "Body Temperature";
                    valueStr = `${item.temperature} °F`;
                    statusBadge = item.temperatureStatus || "Normal";
                  } else if (item.type === "sugar" || item.sugarLevel) {
                    typeName = "Blood Sugar";
                    valueStr = `${item.sugarLevel} mg/dL`;
                    statusBadge = item.sugarStatus || "Normal";
                  }

                  const dateStr = item.recordedAt || item.createdAt;
                  const formattedTime = dateStr
                    ? new Date(dateStr).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "—";

                  return (
                    <tr key={item._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">{typeName}</td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-900">{valueStr}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {statusBadge}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">{formattedTime}</td>
                      <td className="px-6 py-4 text-xs text-gray-400">{item.notes || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
