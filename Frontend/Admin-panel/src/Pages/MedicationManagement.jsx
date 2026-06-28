import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Plus,
  Clock,
  Pill,
  ShieldCheck,
  UserCheck,
  MoreHorizontal,
  Filter,
  Download,
  Syringe,
  AlertTriangle,
  Activity,
  Calendar,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  X,
  FlaskConical,
  Package,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

import api from "../api/axios";

export default function MedicationManagement() {
  const [medications, setMedications] = useState([]);

  const [today, setToday] = useState([]);

  const [loading, setLoading] = useState(true);

const [search, setSearch] = useState("");

const [selectedStatus, setSelectedStatus] =
  useState("all");

const [selectedType, setSelectedType] =
  useState("all");

  // ================= FETCH =================
  useEffect(() => {
    fetchMedicationData();
  }, []);

  const fetchMedicationData = async () => {
    try {
      setLoading(true);

      const [medicationsRes, todayRes] = await Promise.all([
        api.get("/medications"),
        api.get("/today"),
      ]);

      const medicationData = Array.isArray(medicationsRes?.data)
        ? medicationsRes.data
        : Array.isArray(medicationsRes?.data?.medications)
        ? medicationsRes.data.medications
        : [];

      const todayData = Array.isArray(todayRes?.data)
        ? todayRes.data
        : Array.isArray(todayRes?.data?.schedules)
        ? todayRes.data.schedules
        : [];

      setMedications(medicationData);

      setToday(todayData);
    } catch (error) {
      console.log("Medication Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTER =================
 const filteredMedications = useMemo(() => {
  return medications.filter((item) => {

    const matchesSearch =
      item?.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" &&
        item?.active) ||
      (selectedStatus === "paused" &&
        !item?.active);

    const matchesType =
      selectedType === "all" ||
      item?.type === selectedType;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType
    );
  });
}, [
  medications,
  search,
  selectedStatus,
  selectedType,
]);

 // ================= STATS =================

const completedToday = today.filter(
  (dose) =>
    dose?.taken === true ||
    dose?.taken === "true" ||
    dose?.status === "taken" ||
    dose?.status === "completed"
).length;

const pendingToday =
  today.length - completedToday;

const adherence =
  today.length > 0
    ? Math.round(
        (completedToday / today.length) *
          100
      )
    : 0;


    const isDoseTaken = (dose) => {
  return (
    dose?.taken === true ||
    dose?.taken === "true" ||
    dose?.status === "taken" ||
    dose?.status === "completed"
  );
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

        {/* Analytics Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5 mb-8">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm h-80">
            <div className="h-6 w-40 bg-slate-200 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-7 gap-4 h-full">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-8 bg-slate-200 rounded animate-pulse mx-auto" />
                  <div className="h-10 bg-slate-200 rounded-xl animate-pulse" />
                  <div className="h-10 bg-slate-200 rounded-xl animate-pulse" />
                  <div className="h-10 bg-slate-200 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse mb-6" />
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i}>
                  <div className="flex justify-between mb-3">
                    <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-14 bg-slate-100 border-b border-slate-200" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 border-b border-slate-100 px-6 flex items-center gap-4">
              <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-10 bg-slate-200 rounded animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6">
      {/* HEADER */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.04] via-transparent to-[#10B981]/[0.04]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563EB]/[0.06] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#10B981]/[0.06] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative px-6 sm:px-8 py-7 sm:py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748B]">
                Pharmacy Management
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
              Medications
            </h1>
            <p className="text-[#64748B] mt-2 text-base max-w-lg leading-relaxed">
              Manage prescriptions and monitor medication adherence across all patient schedules.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-sm font-medium text-emerald-700">
                System Active
              </span>
            </div>

            <button className="h-11 px-5 rounded-2xl bg-white border border-slate-200 text-sm font-semibold text-[#0F172A] shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex items-center gap-2">
              <Download className="w-4 h-4 text-[#64748B]" />
              Export
            </button>

            {/* <button className="h-11 px-6 rounded-2xl bg-[#2563EB] text-white font-semibold shadow-lg shadow-[#2563EB]/20 hover:bg-[#1D4ED8] hover:shadow-xl hover:shadow-[#2563EB]/30 hover:scale-[1.02] transition-all duration-300 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Medication
            </button> */}
          </div>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5 mb-8">
        {/* HEATMAP */}
        <div className="group relative bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#2563EB]" />
                  Adherence Heatmap
                </h2>
                <p className="text-sm text-[#64748B] mt-1">
                  Weekly medication analytics across all patients
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-[#BFDBFE]"></div>
                  <span className="text-[#64748B]">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-[#2563EB]"></div>
                  <span className="text-[#64748B]">High</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, i) => (
                <div key={i}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-3 text-center">
                    {day}
                  </p>

                  <div className="space-y-2">
                    <div className="h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer group/cell">
                      <div className="w-full h-full rounded-xl bg-white/10 opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200" />
                    </div>

                    <div className="h-10 rounded-xl bg-gradient-to-br from-[#60A5FA] to-[#93C5FD] shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer group/cell">
                      <div className="w-full h-full rounded-xl bg-white/10 opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200" />
                    </div>

                    <div className="h-10 rounded-xl bg-gradient-to-br from-[#BFDBFE] to-[#DBEAFE] shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer group/cell">
                      <div className="w-full h-full rounded-xl bg-white/10 opacity-0 group-hover/cell:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="group relative bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative">
            <h2 className="text-xl font-bold text-[#0F172A] mb-8 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#10B981]" />
              Daily Progress
            </h2>

            <div className="space-y-7">
              {/* ADHERENCE */}
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium text-[#475569]">
                    Adherence Rate
                  </span>
                  <span className="font-bold text-[#2563EB] text-sm">
                    {adherence}%
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${adherence}%` }}
                    className="h-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] rounded-full transition-all duration-700 ease-out"
                  />
                </div>
              </div>

              {/* COMPLETED */}
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-medium text-[#475569]">
                    Completed Doses
                  </span>
                  <span className="font-bold text-[#10B981] text-sm">
                    {completedToday}
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    style={{ width: `${today.length > 0 ? (completedToday / today.length) * 100 : 0}%` }}
                    className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full transition-all duration-700 ease-out"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 mt-8 pt-6 flex justify-between">
              <div>
                <h3 className="text-3xl font-bold text-[#F59E0B]">
                  {pendingToday}
                </h3>
                <p className="text-[#64748B] text-sm mt-1 font-medium">
                  Pending
                </p>
              </div>

              <div className="text-right">
                <h3 className="text-3xl font-bold text-[#10B981]">
                  {completedToday}
                </h3>
                <p className="text-[#64748B] text-sm mt-1 font-medium">
                  Completed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TODAY TIMELINE */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#2563EB]" />
              Today's Schedule
            </h2>
            <p className="text-[#64748B] mt-1 text-sm">
              Medication timeline for today — {today.length} scheduled doses
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2563EB]/5 text-[#2563EB] text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Live
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {today.map((dose, index) => (
            <div
              key={index}
              className={`group relative bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden
              ${
                dose?.taken
                  ? "border-emerald-200/60"
                  : "border-slate-200/60"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105
                      ${
                        dose?.taken
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-[#2563EB]/10 text-[#2563EB]"
                      }`}
                    >
                      <Pill className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg text-[#0F172A] truncate">
                        {dose?.medication?.name || "Medication"}
                      </h3>

                      <p className="text-[#64748B] text-sm mt-1">
                        {dose?.medication?.dosage || "Dosage"}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1.5 rounded-full bg-[#2563EB]/5 text-[#2563EB] text-xs font-semibold border border-[#2563EB]/10 flex-shrink-0">
                    {dose?.time || "08:00 AM"}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-[#64748B]">
                    <UserCheck className="w-4 h-4" />
                    <span className="truncate">
                      {dose?.user?.firstName || dose?.user?.phone}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-200
                    ${
                      dose?.taken
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : "bg-amber-50 text-amber-700 border border-amber-200/60"
                    }`}
                  >
                    {dose?.taken ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    {dose?.taken ? "TAKEN" : "PENDING"}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {today.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-100 border-dashed">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-[#94A3B8]" />
              </div>
              <p className="text-sm font-semibold text-[#0F172A]">No Scheduled Doses</p>
              <p className="text-xs text-[#64748B] mt-1">No medications scheduled for today</p>
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#2563EB]" />
              Active Medications
            </h2>
            <p className="text-[#64748B] text-sm mt-1">
              Total medications: <span className="font-semibold text-[#0F172A]">{filteredMedications.length}</span>
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* SEARCH */}
            <div className="relative group">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#2563EB] transition-colors duration-200" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medication..."
                className="h-11 w-full sm:w-[260px] rounded-xl border border-slate-200 bg-[#F8FAFC] pl-11 pr-10 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all duration-200"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200/80 flex items-center justify-center hover:bg-slate-300 transition-colors duration-200"
                >
                  <X className="w-3 h-3 text-[#64748B]" />
                </button>
              )}
            </div>

           {/* STATUS FILTER */}
<select
  value={selectedStatus}
  onChange={(e) =>
    setSelectedStatus(e.target.value)
  }
  className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all duration-200"
>
  <option value="all">
    All Status
  </option>

  <option value="active">
    Active
  </option>

  <option value="paused">
    Paused
  </option>
</select>

{/* TYPE FILTER */}
<select
  value={selectedType}
  onChange={(e) =>
    setSelectedType(e.target.value)
  }
  className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all duration-200"
>
  <option value="all">
    All Types
  </option>

  {[
    ...new Set(
      medications
        .map((m) => m?.type)
        .filter(Boolean)
    ),
  ].map((type, index) => (
    <option
      key={index}
      value={type}
    >
      {type}
    </option>
  ))}
</select>

            <button className="h-11 px-4 rounded-xl border border-slate-200 flex items-center gap-2 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] hover:border-slate-300 hover:text-[#0F172A] transition-all duration-200">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8FAFC] sticky top-0 z-10">
              <tr>
                <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                  Medication
                </th>

                <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                  Dosage
                </th>

                <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
  Patient
</th>

                <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                  Status
                </th>

                <th className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
                  Verification
                </th>

                <th className="px-6 py-4"></th>
              </tr>
            </thead>

            <tbody>
              {filteredMedications.length > 0 ? (
                filteredMedications.map((item, index) => (
                  <tr
                    key={item?._id || index}
                    className="border-t border-slate-100 hover:bg-[#F8FAFC]/80 transition-all duration-200 group cursor-pointer"
                  >
                    {/* NAME */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-105
                          ${
                            item?.type === "Injection"
                              ? "bg-red-50 text-red-600"
                              : "bg-[#2563EB]/10 text-[#2563EB]"
                          }`}
                        >
                          {item?.type === "Injection" ? (
                            <Syringe className="w-5 h-5" />
                          ) : (
                            <Pill className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-semibold text-[#0F172A] text-sm truncate">
                            {item?.name || "Medication"}
                          </h3>

                          <p className="text-xs text-[#64748B] mt-0.5">
                            {item?.category || "General"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* DOSAGE */}
                    <td className="px-6 py-5">
                      <span className="text-sm text-[#475569] font-medium">
                        {item?.dosage || "--"}
                      </span>
                    </td>

                    {/* FREQUENCY */}
                   <td className="px-6 py-5">
  <div className="flex items-center gap-3">
    <img
      src={
        item?.user?.profilePic ||
        "https://ui-avatars.com/api/?name=Patient"
      }
      alt="patient"
      className="w-10 h-10 rounded-xl object-cover"
    />

    <div>
      <h4 className="text-sm font-semibold text-[#0F172A]">
        {item?.user?.firstName ||
          item?.user?.phone}
      </h4>

      <p className="text-xs text-[#64748B]">
        {item?.user?.phone}
      </p>
    </div>
  </div>
</td>

                    {/* STATUS */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
                        ${
                          item?.active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : "bg-slate-100 text-[#64748B] border border-slate-200/60"
                        }`}
                      >
                        {item?.active ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {item?.active ? "Active" : "Paused"}
                      </span>
                    </td>

                    {/* VERIFY */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {item?.verified ? (
                          <>
                            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                            <span className="text-[#10B981]">Verified</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                            <span className="text-[#F59E0B]">Pending</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-5 text-right">
                      <button className="w-9 h-9 rounded-lg hover:bg-[#F8FAFC] flex items-center justify-center transition-all duration-200 group-hover:bg-[#F8FAFC]">
                        <MoreHorizontal className="w-5 h-5 text-[#94A3B8] group-hover:text-[#64748B] transition-colors duration-200" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-7 h-7 text-[#94A3B8]" />
                    </div>
                    <p className="text-sm font-semibold text-[#0F172A]">No Medications Found</p>
                    <p className="text-xs text-[#64748B] mt-1">Try adjusting your search criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
