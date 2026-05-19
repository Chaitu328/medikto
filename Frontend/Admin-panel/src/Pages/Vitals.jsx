import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  Heart,
  Droplets,
  Thermometer,
  TrendingUp,
  CheckCircle,
  Moon,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Search,
  User,
  Stethoscope,
  TrendingDown,
  Sparkles,
  Zap,
  Inbox,
  X,
  ChevronDown,
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

import api from "../api/axios";

export default function VitalsPage() {
  // ================= STATES =================
  const [vitals, setVitals] = useState([]);

  const [users, setUsers] = useState([]);

  const [selectedPatient, setSelectedPatient] = useState("all");

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // ================= FETCH =================
  useEffect(() => {
    fetchVitals();
    fetchUsers();
  }, []);

  // ================= GET VITALS =================
  const fetchVitals = async () => {
    try {
      setLoading(true);

      const response = await api.get("/vitals");

      const vitalsData = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.vitals)
        ? response.data.vitals
        : [];

      setVitals(vitalsData);
    } catch (error) {
      console.log("VITALS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================= GET USERS =================
  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");

      const userData = Array.isArray(response?.data?.users)
        ? response.data.users
        : Array.isArray(response?.data)
        ? response.data
        : [];

      setUsers(userData);
    } catch (error) {
      console.log("USERS ERROR:", error);
    }
  };

  // ================= FILTER =================
 const filteredVitals = useMemo(() => {
  return vitals.filter((item) => {
    const patient =
      users.find((u) => u._id === item?.user) || {};

    const patientName =
      patient?.firstName ||
      patient?.phone ||
      "";

    const matchesSearch = patientName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesPatient =
      selectedPatient === "all" ||
      item?.user === selectedPatient ||
      item?.user?._id === selectedPatient;

    return matchesSearch && matchesPatient;
  });
}, [vitals, users, search, selectedPatient]);
  // ================= CHART DATA =================
  const chartData = filteredVitals.map((item, index) => ({
    day: `#${index + 1}`,
    systolic: item?.bloodPressure?.systolic || 0,
    diastolic: item?.bloodPressure?.diastolic || 0,
  }));

  // ================= LATEST =================
  // ================= LATEST VITALS =================

const latestBP = [...filteredVitals]
  .filter((item) => item?.type === "bloodPressure")
  .sort(
    (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
  )[0];

const latestHeart = [...filteredVitals]
  .filter((item) => item?.type === "heartRate")
  .sort(
    (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
  )[0];

const latestSugar = [...filteredVitals]
  .filter((item) => item?.type === "sugar")
  .sort(
    (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
  )[0];

const latestTemp = [...filteredVitals]
  .filter((item) => item?.type === "temperature")
  .sort(
    (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
  )[0];

  const latestPatient =
  users.find(
    (u) =>
      u._id === latestBP?.user ||
      u._id === latestHeart?.user ||
      u._id === latestSugar?.user ||
      u._id === latestTemp?.user
  ) || {};
  // ================= CUSTOM TOOLTIP =================
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-xl px-4 py-3 shadow-xl shadow-slate-900/10">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
            Reading {label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium text-[#0F172A]">
                {entry.name}: {entry.value} mmHg
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6">
        {/* Header Skeleton */}
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-sm p-6 sm:p-8">
          <div className="h-10 w-56 bg-slate-200 rounded-xl animate-pulse mb-3" />
          <div className="h-5 w-80 bg-slate-200 rounded-lg animate-pulse" />
        </div>

        {/* Filter Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-8 shadow-sm">
          <div className="flex gap-4">
            <div className="flex-1 h-12 bg-slate-200 rounded-xl animate-pulse" />
            <div className="w-48 h-12 bg-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 animate-pulse" />
                <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
              </div>
              <div className="h-3 w-28 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-10 w-24 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>

        {/* Main Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
          <div>
            <div className="bg-white rounded-3xl border border-slate-100 p-6 mb-6 shadow-sm h-80">
              <div className="h-6 w-40 bg-slate-200 rounded-lg animate-pulse mb-6" />
              <div className="h-full bg-slate-100 rounded-2xl animate-pulse" />
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-14 bg-slate-100 border-b border-slate-200" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 border-b border-slate-100 px-6 flex items-center gap-4">
                  <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm h-32">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-200 animate-pulse" />
                <div>
                  <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
              <div className="h-6 w-24 bg-slate-200 rounded animate-pulse mb-6" />
              {[1, 2].map((i) => (
                <div key={i} className="bg-slate-100 rounded-2xl p-5 mb-4 h-28" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6">
      {/* HEADER */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.04] via-transparent to-[#EF4444]/[0.04]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563EB]/[0.06] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#EF4444]/[0.06] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative px-6 sm:px-8 py-7 sm:py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-[#2563EB]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748B]">
              Live Monitoring
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
            Vitals Monitoring
          </h1>
          <p className="text-[#64748B] mt-2 text-base max-w-lg leading-relaxed">
            Monitor real-time patient vitals and healthcare analytics across all connected devices.
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-4 mb-8 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-white/50 rounded-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* SEARCH */}
          <div className="flex-1 relative group">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#2563EB] transition-colors duration-200" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient..."
              className="w-full h-12 rounded-xl border border-slate-200 bg-[#F8FAFC] pl-11 pr-10 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all duration-200"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200/80 flex items-center justify-center hover:bg-slate-300 transition-colors duration-200"
              >
                <X className="w-3 h-3 text-[#64748B]" />
              </button>
            )}
          </div>

          {/* PATIENT FILTER */}
          <div className="relative group">
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="h-12 px-5 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 cursor-pointer appearance-none transition-all duration-200 hover:border-slate-300 min-w-[180px]"
            >
              <option value="all">All Patients</option>

              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none" />
          </div>
        </div>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {/* BP */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#2563EB]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
                Normal
              </span>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B]">
              Blood Pressure
            </p>

            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight mt-2">
              {latestBP?.bloodPressure?.systolic || "--"}
              <span className="text-2xl text-[#94A3B8]">/</span>
              {latestBP?.bloodPressure?.diastolic || "--"}
              <span className="text-lg text-[#94A3B8] font-medium ml-2">mmHg</span>
            </h2>

            <div className="flex items-center gap-2 mt-5 text-sm text-emerald-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              Latest sync
            </div>
          </div>
        </div>

        {/* HEART */}
        <div className="group relative bg-white rounded-3xl p-6 border border-red-100/60 shadow-sm hover:shadow-lg hover:shadow-[#EF4444]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#EF4444]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-5 h-5 text-[#EF4444]" />
              </div>
              <span className="px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-200/60">
                Active
              </span>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B]">
              Heart Rate
            </p>

            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight mt-2">
             {latestHeart?.heartRate || "--"}
              <span className="text-lg text-[#94A3B8] font-medium ml-2">bpm</span>
            </h2>

            <div className="flex items-center gap-2 mt-5 text-sm text-red-600 font-medium">
              <TrendingUp className="w-4 h-4" />
              Live monitoring
            </div>
          </div>
        </div>

        {/* SUGAR */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-amber-500/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Droplets className="w-5 h-5 text-amber-600" />
              </div>
              <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200/60">
                Stable
              </span>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B]">
              Blood Sugar
            </p>

            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight mt-2">
              {latestSugar?.sugarLevel || "--"}
              <span className="text-lg text-[#94A3B8] font-medium ml-2">mg/dL</span>
            </h2>

            <div className="flex items-center gap-2 mt-5 text-sm text-amber-600 font-medium">
              <Moon className="w-4 h-4" />
              Current reading
            </div>
          </div>
        </div>

        {/* TEMP */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#10B981]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Thermometer className="w-5 h-5 text-[#10B981]" />
              </div>
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-[#64748B] text-xs font-semibold border border-slate-200/60">
                Healthy
              </span>
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B]">
              Temperature
            </p>

            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight mt-2">
              {latestTemp?.temperature || "--"}
              <span className="text-lg text-[#94A3B8] font-medium ml-2">°F</span>
            </h2>

            <div className="flex items-center gap-2 mt-5 text-sm text-emerald-600 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Stable health
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
        {/* LEFT */}
        <div>
          {/* CHART */}
          <div className="group relative bg-white rounded-3xl border border-slate-200/60 p-6 mb-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#2563EB]" />
                    Blood Pressure Trends
                  </h2>
                  <p className="text-sm text-[#64748B] mt-1">
                    Systolic vs diastolic readings over time
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#2563EB]" />
                    <span className="text-xs text-[#64748B] font-medium">Systolic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                    <span className="text-xs text-[#64748B] font-medium">Diastolic</span>
                  </div>
                </div>
              </div>

              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />

                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
                      dx={-5}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Line
                      type="monotone"
                      dataKey="systolic"
                      stroke="#2563EB"
                      strokeWidth={3}
                      dot={{ fill: "#2563EB", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={1500}
                    />

                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

 {/* TABLE */}
<div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
  <div className="px-6 py-5 border-b border-slate-100">
    <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
      <User className="w-5 h-5 text-[#2563EB]" />
      Patient Vitals
    </h2>
  </div>

  {(() => {

    // ================= GROUP USER DATA =================
    const groupedVitals = {};

    filteredVitals.forEach((item) => {

      const userId =
        item?.user || "unknown-user";

      if (!groupedVitals[userId]) {
        groupedVitals[userId] = {
          patient:
            users.find((u) => u._id === userId) || {},

          bloodPressure: null,
          heartRate: null,
          sugar: null,
          temperature: null,

          updatedAt: item?.createdAt,
        };
      }

      // BLOOD PRESSURE
      if (item?.type === "bloodPressure") {
        groupedVitals[userId].bloodPressure =
          item?.bloodPressure;
      }

      // HEART RATE
      if (item?.type === "heartRate") {
        groupedVitals[userId].heartRate =
          item?.heartRate;
      }

      // SUGAR
      if (item?.type === "sugar") {
        groupedVitals[userId].sugar =
          item?.sugarLevel;
      }

      // TEMP
      if (item?.type === "temperature") {
        groupedVitals[userId].temperature =
          item?.temperature;
      }

      // UPDATED TIME
      if (
        new Date(item?.createdAt) >
        new Date(groupedVitals[userId].updatedAt)
      ) {
        groupedVitals[userId].updatedAt =
          item?.createdAt;
      }
    });

    const rows = Object.values(groupedVitals);

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* HEADER */}
          <thead className="bg-[#F8FAFC]">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-bold uppercase text-[#64748B]">
                Patient
              </th>

              <th className="text-left px-6 py-4 text-xs font-bold uppercase text-[#64748B]">
                Blood Pressure
              </th>

              <th className="text-left px-6 py-4 text-xs font-bold uppercase text-[#64748B]">
                Heart
              </th>

              <th className="text-left px-6 py-4 text-xs font-bold uppercase text-[#64748B]">
                Sugar
              </th>

              <th className="text-left px-6 py-4 text-xs font-bold uppercase text-[#64748B]">
                Temp
              </th>

              <th className="text-left px-6 py-4 text-xs font-bold uppercase text-[#64748B]">
                Updated
              </th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr
                  key={index}
                  className="border-t border-slate-100 hover:bg-slate-50 transition"
                >
                  {/* PATIENT */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-[#0F172A]">
                          {row?.patient?.firstName ||
                            "Unknown"}
                        </h4>

                        <p className="text-xs text-[#64748B]">
                          {row?.patient?.email ||
                            row?.patient?.phone ||
                            "No Contact"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* BP */}
                  <td className="px-6 py-5">
                    {row?.bloodPressure ? (
                      <div>
                        <p className="font-semibold text-sm">
                          {
                            row?.bloodPressure
                              ?.systolic
                          }
                          /
                          {
                            row?.bloodPressure
                              ?.diastolic
                          }
                        </p>

                        <span className="text-xs text-[#64748B]">
                          mmHg
                        </span>
                      </div>
                    ) : (
                      "--"
                    )}
                  </td>

                  {/* HEART */}
                  <td className="px-6 py-5">
                    <span className="font-semibold text-sm">
                      {row?.heartRate || "--"}
                    </span>

                    {row?.heartRate && (
                      <span className="text-xs text-[#64748B] ml-1">
                        bpm
                      </span>
                    )}
                  </td>

                  {/* SUGAR */}
                  <td className="px-6 py-5">
                    <span className="font-semibold text-sm">
                      {row?.sugar || "--"}
                    </span>

                    {row?.sugar && (
                      <span className="text-xs text-[#64748B] ml-1">
                        mg/dL
                      </span>
                    )}
                  </td>

                  {/* TEMP */}
                  <td className="px-6 py-5">
                    <span className="font-semibold text-sm">
                      {row?.temperature || "--"}
                    </span>

                    {row?.temperature && (
                      <span className="text-xs text-[#64748B] ml-1">
                        °F
                      </span>
                    )}
                  </td>

                  {/* UPDATED */}
                  <td className="px-6 py-5 text-sm text-[#64748B]">
                    {row?.updatedAt
                      ? new Date(
                          row.updatedAt
                        ).toLocaleString()
                      : "--"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-16"
                >
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  })()}
</div>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          {/* PATIENT CARD */}
          <div className="group relative bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB]/20 to-[#10B981]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <User className="w-8 h-8 text-[#2563EB]" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-[#0F172A] truncate">
                    {latestPatient?.name || "No Patient Selected"}
                  </h2>

                  <p className="text-[#64748B] text-sm mt-1">
                    Live healthcare monitoring
                  </p>
                </div>
              </div>

              {latestPatient && (
                <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748B]">Patient ID</span>
                    <span className="font-semibold text-[#0F172A] text-xs bg-slate-100 px-2 py-1 rounded-lg">
                      {latestPatient?._id?.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748B]">Email</span>
                    <span className="font-medium text-[#0F172A] text-xs truncate max-w-[140px]">
                      {latestPatient?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#64748B]">Phone</span>
                    <span className="font-medium text-[#0F172A] text-xs">
                      {latestPatient?.phone || "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ALERTS */}
          <div className="group relative bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#EF4444]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                  Alerts
                </h2>

                <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center border border-red-200/60">
                  {filteredVitals.length}
                </div>
              </div>

              {filteredVitals.length > 0 ? (
                filteredVitals.map((item, index) => {
const alertPatient =
  item?.user || {};
                  return (
                    <div
                      key={index}
                      className="bg-red-50/60 border border-red-100/60 rounded-2xl p-5 mb-3 hover:bg-red-50 hover:border-red-200 hover:shadow-sm transition-all duration-200 cursor-pointer group/alert"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#EF4444] shadow-sm flex-shrink-0 group-hover/alert:scale-105 transition-transform duration-200">
                          <AlertTriangle className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-red-700 text-sm">
                            Vitals Alert
                          </h4>

                          <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                            Patient{" "}
                            <span className="font-semibold text-[#475569]">
                            {alertPatient?.firstName ||
  alertPatient?.phone}
                            </span>{" "}
                            requires monitoring attention.
                          </p>

                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded-md">
                              URGENT
                            </span>
                            <span className="text-[10px] text-[#94A3B8]">
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Recently"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-sm font-semibold text-[#0F172A]">All Clear</p>
                  <p className="text-xs text-[#64748B] mt-1">No vitals alerts at this time</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
