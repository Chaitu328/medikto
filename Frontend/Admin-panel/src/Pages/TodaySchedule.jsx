import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Calendar,
  Pill,
  UserCircle,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Loader2,
  Activity,
  Sunrise,
  Sunset,
} from "lucide-react";

import api from "../api/axios";

export default function TodaySchedule() {
 // ================= STATES =================

const [schedules, setSchedules] = useState([]);

const [loading, setLoading] = useState(true);

const [selectedDate, setSelectedDate] =
  useState(new Date());

const [currentMonth, setCurrentMonth] =
  useState(new Date());

// ================= FETCH =================

useEffect(() => {
  fetchTodaySchedule(selectedDate);
}, [selectedDate]);

const fetchTodaySchedule = async (
  date = new Date()
) => {
  try {
    setLoading(true);

    const formattedDate = date
      .toISOString()
      .split("T")[0];

    const response = await api.get(
      `/today?date=${formattedDate}`
    );

    const data = Array.isArray(
      response?.data
    )
      ? response.data
      : Array.isArray(
          response?.data?.schedules
        )
      ? response.data.schedules
      : [];

    setSchedules(data);

  } catch (error) {
    console.log(
      "Schedule Error:",
      error
    );
  } finally {
    setLoading(false);
  }
};

// ================= CALENDAR =================

const daysInMonth = new Date(
  currentMonth.getFullYear(),
  currentMonth.getMonth() + 1,
  0
).getDate();

const firstDayOfMonth = new Date(
  currentMonth.getFullYear(),
  currentMonth.getMonth(),
  1
).getDay();

const calendarDays = [
  ...Array(firstDayOfMonth).fill(null),
  ...Array(daysInMonth)
    .fill(0)
    .map((_, i) => i + 1),
];

const isSelectedDate = (day) => {
  if (!day) return false;

  return (
    selectedDate.getDate() === day &&
    selectedDate.getMonth() ===
      currentMonth.getMonth() &&
    selectedDate.getFullYear() ===
      currentMonth.getFullYear()
  );
};

const changeMonth = (direction) => {
  setCurrentMonth(
    new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() +
        direction,
      1
    )
  );
};

// ================= FILTERS =================

const morningSchedules = useMemo(() => {
  return schedules.filter((item) => {
    const hour =
      Number(
        item?.time?.split(":")[0]
      ) || 0;

    return hour >= 6 && hour < 12;
  });
}, [schedules]);

const afternoonSchedules = useMemo(() => {
  return schedules.filter((item) => {
    const hour =
      Number(
        item?.time?.split(":")[0]
      ) || 0;

    return hour >= 12 && hour < 18;
  });
}, [schedules]);

const eveningSchedules = useMemo(() => {
  return schedules.filter((item) => {
    const hour =
      Number(
        item?.time?.split(":")[0]
      ) || 0;

    return hour >= 18 || hour < 6;
  });
}, [schedules]);

// ================= STATS =================

const completedDoses =
  schedules.filter(
    (dose) =>
      dose?.status === "taken"
  ).length;

const missedDoses =
  schedules.filter(
    (dose) =>
      dose?.status === "MISSED"
  ).length;

const upcomingDoses =
  schedules.filter(
    (dose) =>
      dose?.status !== "taken" &&
      dose?.status !== "MISSED"
  ).length;

const adherence =
  schedules.length > 0
    ? Math.round(
        (completedDoses /
          schedules.length) *
          100
      )
    : 0;

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6">
        {/* Header Skeleton */}
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-sm p-6 sm:p-8">
          <div className="h-10 w-56 bg-slate-200 rounded-xl animate-pulse mb-3" />
          <div className="h-5 w-80 bg-slate-200 rounded-lg animate-pulse" />
        </div>

        {/* KPI Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-200 animate-pulse mb-5" />
              <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-10 w-16 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>

        {/* Schedule Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-slate-200 animate-pulse" />
                    <div>
                      <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-2" />
                      <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-6 w-20 bg-slate-200 rounded animate-pulse mb-2" />
                    <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-80">
              <div className="h-6 w-32 bg-slate-200 rounded-lg animate-pulse mb-4" />
              <div className="h-full bg-slate-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= CARD =================
  const ScheduleCard = ({ item }) => (
    <div
      className={`group relative bg-white rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden
      ${
        item?.status === "taken"
          ? "border-emerald-200/60 bg-emerald-50/30"
          : "border-slate-200/60"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
        {/* <div className="relative flex-shrink-0">
          <img
            src={`https://i.pravatar.cc/100?u=${item?._id}`}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-white shadow-sm group-hover:ring-[#2563EB]/20 group-hover:shadow-md transition-all duration-300"
            alt=""
          />
          {item?.taken && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          )}
        </div> */}

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base sm:text-lg text-[#0F172A] truncate">
            {item?.user?.firstName || "Patient"}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-sm text-[#64748B]">
              <Pill className="w-3.5 h-3.5 text-[#2563EB]" />
              {item?.medication?.name || "Medication"}
            </span>
            <span className="text-[#94A3B8]">•</span>
            <span className="text-sm text-[#64748B]">
              {item?.medication?.dosage || "--"}
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center gap-4 sm:gap-6 mt-4 sm:mt-0 flex-shrink-0">
        <div className="text-right">
          <h4 className="font-bold text-xl text-[#0F172A]">
            {item?.time || "08:00 AM"}
          </h4>

<span
  className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200

  ${
    item?.status === "taken"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"

      : item?.status === "MISSED"
      ? "bg-red-50 text-red-700 border border-red-200/60"

      : "bg-amber-50 text-amber-700 border border-amber-200/60"
  }`}
>
  {item?.status === "taken" ? (
    <CheckCircle2 className="w-3.5 h-3.5" />
  ) : item?.status === "MISSED" ? (
    <XCircle className="w-3.5 h-3.5" />
  ) : (
    <Clock3 className="w-3.5 h-3.5" />
  )}

  {item?.status === "taken"
    ? "COMPLETED"

    : item?.status === "MISSED"
    ? "MISSED"

    : "PENDING"}
</span>
        </div>

        {/* {!item?.taken && (
          <button
            onClick={async () => {
              try {
                await api.put(`/dose/${item?._id}/taken`);

                fetchTodaySchedule();
              } catch (error) {
                console.log(error);
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold shadow-lg shadow-[#2563EB]/20 hover:bg-[#1D4ED8] hover:shadow-xl hover:shadow-[#2563EB]/30 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirm
          </button>
        )} */}

        {/* {item?.taken && (
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
          </div>
        )} */}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6">
      {/* HEADER */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.04] via-transparent to-[#10B981]/[0.04]" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2563EB]/[0.06] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#10B981]/[0.06] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative px-6 sm:px-8 py-7 sm:py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748B]">
                Daily Operations
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
              Today Schedule
            </h1>
            <p className="text-[#64748B] mt-2 text-base max-w-lg leading-relaxed">
              Manage daily patient medication schedules and track dose adherence across all time periods.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-sm font-medium text-emerald-700">
                Live Schedule
              </span>
            </div> */}

            {/* <button className="h-11 px-6 rounded-2xl bg-[#2563EB] text-white font-semibold shadow-lg shadow-[#2563EB]/20 hover:bg-[#1D4ED8] hover:shadow-xl hover:shadow-[#2563EB]/30 transition-all duration-300 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Schedule
            </button> */}
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {/* UPCOMING */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#2563EB]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <Clock3 className="w-6 h-6 text-[#2563EB]" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] mb-2">
              Upcoming Doses
            </p>
            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">
              {upcomingDoses}
            </h2>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1 text-[#2563EB] text-sm font-semibold bg-[#2563EB]/5 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5" />
                Pending
              </div>
            </div>
          </div>
        </div>

        {/* COMPLETED */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#10B981]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] mb-2">
              Completed Doses
            </p>
            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">
              {completedDoses}
            </h2>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                <Shield className="w-3.5 h-3.5" />
                On Track
              </div>
            </div>
          </div>
        </div>

        {/* MISSED */}
        <div className="group relative bg-white rounded-3xl p-6 border border-red-100/60 shadow-sm hover:shadow-lg hover:shadow-[#EF4444]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#EF4444]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <XCircle className="w-6 h-6 text-[#EF4444]" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] mb-2">
              Missed Doses
            </p>
            <h2 className="text-4xl font-bold text-[#EF4444] tracking-tight">
              {missedDoses}
            </h2>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1 text-red-600 text-sm font-semibold bg-red-50 px-2 py-1 rounded-lg">
                <TrendingDown className="w-3.5 h-3.5" />
                Alert
              </div>
            </div>
          </div>
        </div>

        {/* ADHERENCE */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#F59E0B]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] mb-2">
              Adherence Rate
            </p>
            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">
              {adherence}%
            </h2>
            <div className="mt-3">
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${adherence}%` }}
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    adherence >= 80
                      ? "bg-[#10B981]"
                      : adherence >= 50
                      ? "bg-[#F59E0B]"
                      : "bg-[#EF4444]"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
        {/* LEFT */}
        <div>
          {/* MORNING */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Sunrise className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Morning
                </h2>
                <span className="text-sm text-[#64748B]">
                  06:00 — 11:59
                </span>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100/60">
                  {morningSchedules.length} doses
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {morningSchedules.length > 0 ? (
                morningSchedules.map((item, index) => (
                  <ScheduleCard key={index} item={item} />
                ))
              ) : (
                <div className="py-10 text-center bg-white rounded-2xl border border-slate-100 border-dashed">
                  <Sun className="w-8 h-8 text-[#94A3B8] mx-auto mb-3" />
                  <p className="text-sm text-[#64748B]">No morning schedules</p>
                </div>
              )}
            </div>
          </div>

          {/* AFTERNOON */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Sun className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Afternoon
                </h2>
                <span className="text-sm text-[#64748B]">
                  12:00 — 17:59
                </span>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-100/60">
                  {afternoonSchedules.length} doses
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {afternoonSchedules.length > 0 ? (
                afternoonSchedules.map((item, index) => (
                  <ScheduleCard key={index} item={item} />
                ))
              ) : (
                <div className="py-10 text-center bg-white rounded-2xl border border-slate-100 border-dashed">
                  <Sun className="w-8 h-8 text-[#94A3B8] mx-auto mb-3" />
                  <p className="text-sm text-[#64748B]">No afternoon schedules</p>
                </div>
              )}
            </div>
          </div>

          {/* EVENING */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Moon className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Evening & Night
                </h2>
                <span className="text-sm text-[#64748B]">
                  18:00 — 05:59
                </span>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100/60">
                  {eveningSchedules.length} doses
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {eveningSchedules.length > 0 ? (
                eveningSchedules.map((item, index) => (
                  <ScheduleCard key={index} item={item} />
                ))
              ) : (
                <div className="py-10 text-center bg-white rounded-2xl border border-slate-100 border-dashed">
                  <Moon className="w-8 h-8 text-[#94A3B8] mx-auto mb-3" />
                  <p className="text-sm text-[#64748B]">No evening schedules</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          {/* CALENDAR */}
         <div className="group relative bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">

  <div className="flex items-center justify-between mb-6">

    <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
      <Calendar className="w-5 h-5 text-[#2563EB]" />
      Schedule Calendar
    </h3>

    <div className="flex gap-1">

      <button
        onClick={() =>
          changeMonth(-1)
        }
        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={() =>
          changeMonth(1)
        }
        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

    </div>
  </div>

  <h2 className="text-center text-2xl font-bold text-[#0F172A] mb-6">

    {currentMonth.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    )}

  </h2>

  <div className="grid grid-cols-7 gap-2 text-center text-xs">

    {[
      "S",
      "M",
      "T",
      "W",
      "T",
      "F",
      "S",
    ].map((d, i) => (
      <div
        key={i}
        className="text-[#94A3B8] font-semibold uppercase tracking-wider py-2"
      >
        {d}
      </div>
    ))}

    {calendarDays.map((day, i) => {

      if (!day) {
        return (
          <div
            key={i}
            className="h-9 w-9"
          />
        );
      }

      return (
        <button
          key={i}
          onClick={() => {

            const newDate =
              new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                day
              );

            setSelectedDate(
              newDate
            );
          }}
          className={`h-9 w-9 rounded-xl flex items-center justify-center mx-auto text-sm font-medium transition-all duration-200 cursor-pointer
          ${
            isSelectedDate(day)
              ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/25"
              : "text-[#475569] hover:bg-[#F8FAFC]"
          }`}
        >
          {day}
        </button>
      );
    })}
  </div>

  <div className="mt-6 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100">

    <p className="text-xs uppercase tracking-wider text-[#64748B] font-semibold mb-2">
      Selected Date
    </p>

    <h4 className="text-lg font-bold text-[#0F172A]">
      {selectedDate.toDateString()}
    </h4>

    <p className="text-sm text-[#64748B] mt-1">
      {schedules.length} schedules found
    </p>

  </div>
</div>

          {/* COMPLETION */}
          <div className="group relative bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative flex flex-col items-center py-4">
              <h3 className="font-bold text-[#0F172A] mb-6 flex items-center gap-2 self-start">
                <Zap className="w-5 h-5 text-[#10B981]" />
                Daily Completion
              </h3>

              <div className="relative w-40 h-40">
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
                    stroke="url(#completionGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${adherence * 2.64} 264`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="completionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-[#0F172A]">{adherence}%</span>
                  <span className="text-xs text-[#64748B] font-medium mt-1">Complete</span>
                </div>
              </div>

              <p className="text-[#64748B] text-sm text-center mt-6 leading-relaxed">
                <span className="font-semibold text-[#0F172A]">{completedDoses}</span> of{" "}
                <span className="font-semibold text-[#0F172A]">{schedules.length}</span>{" "}
                doses administered today
              </p>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span className="text-xs text-[#64748B]">Taken</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <span className="text-xs text-[#64748B]">Remaining</span>
                </div>
              </div>
            </div>
          </div>

          {/* ALERTS */}
          <div className="group relative bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#EF4444]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                  Recent Alerts
                </h3>
                {missedDoses > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200/60">
                    {missedDoses} NEW
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {schedules
                  .filter((dose) => !dose?.taken)
                  .slice(0, 3)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-red-50/60 border border-red-100/60 hover:bg-red-50 hover:border-red-200 hover:shadow-sm transition-all duration-200 cursor-pointer group/alert"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#EF4444] shadow-sm flex-shrink-0 group-hover/alert:scale-105 transition-transform duration-200">
                          <XCircle className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-red-700 text-sm">
                            Missed Dose
                          </h4>
                          <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                            <span className="font-medium text-[#475569]">{item?.user?.name}</span>{" "}
                            missed{" "}
                            <span className="font-medium text-[#475569]">{item?.medication?.name}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded-md">
                              URGENT
                            </span>
                            <span className="text-[10px] text-[#94A3B8]">
                              {item?.time || "--:--"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

               {schedules.filter(
  (dose) => dose?.status === "MISSED"
).length === 0 && (
                  <div className="py-8 text-center">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-sm font-semibold text-[#0F172A]">All Caught Up</p>
                    <p className="text-xs text-[#64748B] mt-1">No missed doses today</p>
                  </div>
                )}
              </div>
            </div>

            {/* FLOATING MEDICAL BUTTON */}
            <button className="mt-5 w-full h-12 rounded-xl bg-[#2563EB] text-white font-semibold text-sm shadow-lg shadow-[#2563EB]/20 hover:bg-[#1D4ED8] hover:shadow-xl hover:shadow-[#2563EB]/30 transition-all duration-300 flex items-center justify-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Review All Alerts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
