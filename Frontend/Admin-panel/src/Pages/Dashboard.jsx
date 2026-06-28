import { useEffect, useState } from "react";

import {
  Users,
  Pill,
  Clock,
  AlertTriangle,
  BellRing,
  Activity,
  Droplets,
  Heart,
  FileBarChart,
  ArrowRight,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronDown,
  Sparkles,
  Shield,
  Stethoscope,
  ChevronRight,
  Loader2,
  Inbox,
  Zap,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import api from "../api/axios";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState({
    medications: [],
    reports: [],
    today: [],
    vitals: [],
    prescriptions: [],
    adherence: {},
    loading: true,
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const normalizeArray = (response, key) => {
    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.[key])) {
      return response.data[key];
    }

    return [];
  };

  const fetchDashboardData = async () => {
    try {
      const [
        medicationsRes,
        reportsRes,
        todayRes,
        vitalsRes,
        prescriptionsRes,
        adherenceRes,
      ] = await Promise.all([
        api.get("/medications"),
        api.get("/reports"),
        api.get("/today"),
        api.get("/vitals"),
        api.get("/prescriptions"),
        api.get("/adherence"),
      ]);

      const medications = normalizeArray(medicationsRes, "medications");

      const reports = normalizeArray(reportsRes, "reports");

      const today = normalizeArray(todayRes, "schedules");

      const vitals = normalizeArray(vitalsRes, "vitals");

      const prescriptions = normalizeArray(prescriptionsRes, "prescriptions");

      const adherence = adherenceRes?.data || {};

      const adherenceChart = adherence?.data?.length
        ? adherence.data.slice(0, 7).map((item, index) => ({
            day: `D${index + 1}`,
            value: item?.taken ? 92 : 74,
          }))
        : [
            { day: "Mon", value: 80 },
            { day: "Tue", value: 85 },
            { day: "Wed", value: 78 },
            { day: "Thu", value: 90 },
            { day: "Fri", value: 88 },
            { day: "Sat", value: 91 },
            { day: "Sun", value: 86 },
          ];

      setChartData(adherenceChart);

      setDashboard({
        medications,
        reports,
        today,
        vitals,
        prescriptions,
        adherence,
        loading: false,
      });
    } catch (error) {
      console.log("Dashboard Error:", error);

      setDashboard({
        medications: [],
        reports: [],
        today: [],
        vitals: [],
        prescriptions: [],
        adherence: {},
        loading: false,
      });
    }
  };

  // PREMIUM TOOLTIP
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-xl px-4 py-3 shadow-xl shadow-slate-900/10">
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-lg font-bold text-[#0F172A]">
            {payload[0].value}%
          </p>
          <p className="text-xs text-[#10B981] font-medium mt-0.5">
            Adherence Rate
          </p>
        </div>
      );
    }
    return null;
  };



  if (dashboard.loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
          <div>
            <div className="h-10 w-56 bg-slate-200 rounded-xl animate-pulse mb-3" />
            <div className="h-5 w-80 bg-slate-200 rounded-lg animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-11 w-28 bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-11 w-36 bg-slate-200 rounded-2xl animate-pulse" />
          </div>
        </div>

        {/* KPI Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="w-12 h-12 rounded-2xl bg-slate-200 animate-pulse" />
              </div>
              <div className="h-10 w-16 bg-slate-200 rounded-xl animate-pulse mb-2" />
              <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chart + Alerts Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5 mb-8">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className="h-6 w-40 bg-slate-200 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-6" />
            <div className="h-[320px] bg-slate-100 rounded-2xl animate-pulse" />
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse mb-6" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 mb-4">
                <div className="w-11 h-11 rounded-xl bg-slate-200 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm"
            >
              <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse mb-6" />
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-slate-200 animate-pulse mt-2" />
                  <div className="flex-1">
                    <div className="h-4 w-36 bg-slate-200 rounded animate-pulse mb-1" />
                    <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalPatients = Array.isArray(dashboard.vitals)
    ? dashboard.vitals.length
    : 0;

  const totalMedications = Array.isArray(dashboard.medications)
    ? dashboard.medications.length
    : 0;

const totalToday =
  dashboard?.adherence?.totalDoses || 0;

const completedToday =
  dashboard?.adherence?.takenDoses || 0;

const todayPercentage =
  dashboard?.adherence?.weeklyAdherence || 0;

const missedMedications =
  dashboard?.adherence?.missedDoses || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6">
      {/* HEADER */}
      <section className="relative mb-10 overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.04] via-transparent to-[#10B981]/[0.04]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563EB]/[0.06] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#10B981]/[0.06] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative px-6 sm:px-8 py-7 sm:py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748B]">
                Healthcare Admin
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
              Medikto Dashboard
            </h1>
            <p className="text-[#64748B] mt-2 text-base max-w-lg leading-relaxed">
              Monitor patients, medications and adherence analytics across your entire practice.
            </p>
          </div>

          {/* <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-sm font-medium text-emerald-700">
                All Systems Online
              </span>
            </div>

            <button className="h-11 px-5 rounded-2xl bg-white border border-slate-200 text-sm font-semibold text-[#0F172A] shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#64748B]" />
              This Week
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
            </button>

            <button className="h-11 px-5 rounded-2xl bg-[#2563EB] text-white text-sm font-semibold shadow-lg shadow-[#2563EB]/20 hover:bg-[#1D4ED8] hover:shadow-xl hover:shadow-[#2563EB]/30 transition-all duration-300 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Medication
            </button>
          </div> */}
        </div>
      </section>

      {/* KPI CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {/* PATIENTS */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#2563EB]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B]">
                Patients
              </span>
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-[#2563EB]" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">
              {totalPatients}
            </h2>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5" />
                Active
              </div>
              <span className="text-[#64748B] text-sm">
                Total registered
              </span>
            </div>
          </div>
        </div>

        {/* MEDICATIONS */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#10B981]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B]">
                Medications
              </span>
              <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Pill className="w-6 h-6 text-[#10B981]" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">
              {totalMedications}
            </h2>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                <Shield className="w-3.5 h-3.5" />
                Tracked
              </div>
              <span className="text-[#64748B] text-sm">
                Active prescriptions
              </span>
            </div>
          </div>
        </div>

        {/* ADHERENCE */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#2563EB]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B]">
                Adherence
              </span>
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6 text-[#2563EB]" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">
              {todayPercentage}%
            </h2>
            <div className="mt-4">
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${todayPercentage}%` }}
                  className="h-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] rounded-full transition-all duration-700 ease-out"
                />
              </div>
              <p className="text-[#64748B] text-sm mt-2 font-medium">
{completedToday} of {totalToday} doses taken
              </p>
            </div>
          </div>
        </div>

        {/* MISSED */}
        <div className="group relative bg-white rounded-3xl p-6 border border-red-100/60 shadow-sm hover:shadow-lg hover:shadow-[#EF4444]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#EF4444]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B]">
                Missed Doses
              </span>
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-[#EF4444] tracking-tight">
              {missedMedications}
            </h2>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1 text-red-600 text-sm font-semibold bg-red-50 px-2 py-1 rounded-lg">
                <TrendingDown className="w-3.5 h-3.5" />
                Alert
              </div>
              <span className="text-[#64748B] text-sm">
                Requires attention
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CHART + ALERTS */}
      <section className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5 mb-8">
        {/* CHART */}
        <div className="group relative bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#2563EB]" />
                  Medication Adherence
                </h3>
                <p className="text-sm text-[#64748B] mt-1">
                  Weekly analytics overview across all patients
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2563EB]/5 text-[#2563EB] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  {todayPercentage}% Avg
                </div>
                <button className="px-4 h-9 rounded-xl bg-slate-100 text-sm font-medium text-[#64748B] hover:bg-slate-200 transition-colors duration-200 flex items-center gap-1.5">
                  Weekly
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>

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
                    domain={[60, 100]}
                    dx={-5}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="url(#colorStroke)"
                    strokeWidth={3}
                    fill="url(#colorValue)"
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ALERTS */}
        <div className="group relative bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#EF4444]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
                <BellRing className="w-5 h-5 text-[#EF4444]" />
                Critical Alerts
              </h3>
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
              </div>
            </div>

            <div className="space-y-3">
              {Array.isArray(dashboard.vitals) && dashboard.vitals.length > 0 ? (
                dashboard.vitals.slice(0, 3).map((vital, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-red-50/60 border border-red-100/60 flex gap-4 hover:bg-red-50 hover:border-red-200 hover:shadow-sm transition-all duration-200 cursor-pointer group/alert"
                  >
                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#EF4444] shadow-sm flex-shrink-0 group-hover/alert:scale-105 transition-transform duration-200">
                      {index === 0 && <Activity className="w-5 h-5" />}
                      {index === 1 && <Droplets className="w-5 h-5" />}
                      {index === 2 && <Heart className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-[#0F172A] text-sm truncate">
                        {vital?.user?.name || "Patient"}
                      </h4>
                      <p className="text-xs text-[#64748B] mt-1">
                        Critical vital detected — immediate review required
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded-md">
                          URGENT
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">
                          2 min ago
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 self-center group-hover/alert:text-[#EF4444] transition-colors duration-200 flex-shrink-0" />
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-7 h-7 text-emerald-500" />
                  </div>
                  <p className="text-sm font-semibold text-[#0F172A]">No Critical Alerts</p>
                  <p className="text-xs text-[#64748B] mt-1">All vitals within normal range</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* REPORTS */}
        <div className="group relative bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
                <FileBarChart className="w-5 h-5 text-[#2563EB]" />
                Pending Reports
              </h3>
              <span className="text-xs font-semibold text-[#64748B] bg-slate-100 px-2.5 py-1 rounded-lg">
                {Array.isArray(dashboard.reports) ? dashboard.reports.length : 0} Total
              </span>
            </div>

            <div className="space-y-4">
              {Array.isArray(dashboard.reports) && dashboard.reports.length > 0 ? (
                dashboard.reports.slice(0, 3).map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8FAFC] transition-all duration-200 cursor-pointer group/report"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#EF4444] mt-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[#0F172A] text-sm truncate">
                          {report?.title || "Medical Report"}
                        </h4>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {report?.type || "Pending Review"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        Pending
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover/report:text-[#2563EB] group-hover/report:translate-x-0.5 transition-all duration-200" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Inbox className="w-6 h-6 text-[#94A3B8]" />
                  </div>
                  <p className="text-sm text-[#64748B]">No pending reports</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COMPLIANCE */}
        <div className="group relative bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative flex flex-col items-center justify-center py-4">
            <h3 className="font-bold text-[#0F172A] mb-6 flex items-center gap-2 self-start">
              <Zap className="w-5 h-5 text-[#10B981]" />
              Daily Compliance
            </h3>

            <div className="relative w-44 h-44">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#complianceGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${todayPercentage * 2.64} 264`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="complianceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-[#0F172A]">{todayPercentage}%</span>
                <span className="text-xs text-[#64748B] font-medium mt-1">Adherence</span>
              </div>
            </div>

            <p className="text-[#64748B] text-sm text-center mt-6 leading-relaxed">
              Daily medication adherence rate across all active patients
            </p>

            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#2563EB]" />
                <span className="text-xs text-[#64748B]">Taken</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="text-xs text-[#64748B]">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT PATIENTS */}
        <div className="group relative bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#2563EB]" />
                Recent Patients
              </h3>
              <span className="text-xs font-semibold text-[#64748B] bg-slate-100 px-2.5 py-1 rounded-lg">
                {Array.isArray(dashboard.vitals) ? dashboard.vitals.length : 0} Active
              </span>
            </div>

            <div className="space-y-4">
              {Array.isArray(dashboard.vitals) && dashboard.vitals.length > 0 ? (
                dashboard.vitals.slice(0, 3).map((patient, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F8FAFC] transition-all duration-200 cursor-pointer group/patient"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={`https://i.pravatar.cc/100?img=${index + 1}`}
                          className="w-11 h-11 rounded-xl object-cover ring-2 ring-white shadow-sm group-hover/patient:ring-[#2563EB]/20 transition-all duration-200"
                          alt=""
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-white" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-[#0F172A] text-sm truncate">
                          {patient?.user?.name || "Patient"}
                        </h4>
                        <p className="text-xs text-[#64748B]">
                          Medication Checkup
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100/60 flex-shrink-0">
                      Active
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-[#94A3B8]" />
                  </div>
                  <p className="text-sm text-[#64748B]">No recent patients</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING ACTION BUTTON */}
      <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#2563EB] text-white shadow-2xl shadow-[#2563EB]/30 flex items-center justify-center hover:scale-110 hover:shadow-[#2563EB]/40 transition-all duration-300 group z-50">
        <div className="absolute inset-0 rounded-full bg-[#2563EB] animate-ping opacity-20" />
        <Plus className="w-6 h-6 relative z-10" />
      </button>
    </div>
  );
}
