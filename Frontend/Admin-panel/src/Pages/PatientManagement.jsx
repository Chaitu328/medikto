import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Users,
  Activity,
  Crown,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Loader2,
  UserCircle,
  ChevronDown,
} from "lucide-react";

import api from "../api/axios";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [subscriptionFilter, setSubscriptionFilter] = useState("All");

  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  // HOSPITAL LINK MODAL STATE
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [hospitalLinkModalOpen, setHospitalLinkModalOpen] = useState(false);
  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [otpError, setOtpError] = useState("");

  const role = (localStorage.getItem("role") || "").toLowerCase();

const isGuardian = role === "guardian";
const isAdmin = role === "admin";
const isSuperAdmin = role === "superadmin";

 const gridClass = isGuardian
    ? "grid grid-cols-7 gap-4"
    : "grid grid-cols-8 gap-4";

  useEffect(() => {
    fetchPatients();
  }, []);

  // FETCH PATIENTS
  const fetchPatients = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users");

      const patientData = Array.isArray(response?.data?.users) ? response.data.users : Array.isArray(response?.data) ? response.data : [];

      setPatients(patientData);
    } catch (error) {
      console.log("FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceStatus = (
  patient
) => {

  const adherence =
    Number(
      patient?.adherence
    ) || 0;

  if (adherence >= 80) {
    return "High";
  }

  if (adherence >= 50) {
    return "Medium";
  }

  return "Low";
};

  // FILTERED PATIENTS
  const filteredPatients = useMemo(() => {
  return patients.filter((patient) => {

    if (patient.role !== "patient") {
      return false;
    }

    // SEARCH
    const matchesSearch =

      (patient?.firstName || "")
        .toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      (patient?.name || "")
        .toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      (patient?.email || "")
        .toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      (patient?.phone || "")
        .toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      (patient?._id || "")
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );

    // SUBSCRIPTION
    const plan =
      (
        patient?.subscription ||
        "free"
      ).toLowerCase();

    const selectedPlan =
      subscriptionFilter.toLowerCase();

    const matchesSubscription =

      subscriptionFilter === "All" ||

      plan === selectedPlan;

    // COMPLIANCE
    const compliance =
      getComplianceStatus(
        patient
      );

    const matchesStatus =

      statusFilter === "All" ||

      compliance === statusFilter;

    return (
      matchesSearch &&
      matchesSubscription &&
      matchesStatus
    );
  });
}, [
  patients,
  search,
  subscriptionFilter,
  statusFilter,
]);



  // PAGINATION
  const totalPages =
  Math.max(
    1,
    Math.ceil(
      filteredPatients.length /
        itemsPerPage
    )
  );

  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
  setCurrentPage(1);
}, [
  search,
  subscriptionFilter,
  statusFilter,
]);

  // STATS

  const patientList = patients.filter(
  (p) => p.role === "patient"
);

 const totalPatients = patientList.length;

const premiumPatients = patientList.filter(
  (p) =>
    (p?.subscription || "").toLowerCase() === "premium"
).length;

const highCompliance = patientList.filter(
  (p) => getComplianceStatus(p) === "High"
).length;

const pendingReviews = patientList.filter(
  (p) => getComplianceStatus(p) === "Low"
).length;

const compliancePercent =
  totalPatients > 0
    ? Math.round((highCompliance / totalPatients) * 100)
    : 0;

  // HOSPITAL LINK MODAL HANDLERS
  const openHospitalLinkModal = (patient) => {
    setSelectedPatient(patient);
    setOtpPhone(patient?.phone || "");
    setOtpCode("");
    setOtpSent(false);
    setOtpSuccess(false);
    setOtpError("");
    setHospitalLinkModalOpen(true);
  };

  const closeHospitalLinkModal = () => {
    setHospitalLinkModalOpen(false);
    setSelectedPatient(null);
    setOtpPhone("");
    setOtpCode("");
    setOtpSent(false);
    setOtpSuccess(false);
    setOtpError("");
  };

  const sendLinkOTP = async () => {
    if (!otpPhone) {
      setOtpError("Phone number is required");
      return;
    }
    try {
      setOtpLoading(true);
      setOtpError("");
      await api.post("/hospitals/send-link-otp", { phone: otpPhone });
      setOtpSent(true);
    } catch (error) {
      setOtpError(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyLinkOTP = async () => {
    if (!otpCode || otpCode.length < 4) {
      setOtpError("Please enter a valid OTP");
      return;
    }
    try {
      setOtpLoading(true);
      setOtpError("");
      await api.post("/hospitals/verify-link", {
        phone: otpPhone,
        otp: otpCode,
      });
      setOtpSuccess(true);
      setTimeout(() => {
        closeHospitalLinkModal();
        fetchPatients();
      }, 1500);
    } catch (error) {
      setOtpError(error?.response?.data?.message || "Failed to verify OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // SKELETON LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-10">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-slate-200 rounded-xl animate-pulse mb-3" />
          <div className="h-5 w-80 bg-slate-200 rounded-lg animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
            >
              <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mb-4" />
              <div className="h-10 w-20 bg-slate-200 rounded-xl animate-pulse mb-2" />
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Filter Skeleton */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-slate-100 shadow-sm">
          <div className="flex gap-4">
            <div className="flex-1 h-12 bg-slate-200 rounded-xl animate-pulse" />
            <div className="w-40 h-12 bg-slate-200 rounded-xl animate-pulse" />
            <div className="w-40 h-12 bg-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-14 bg-slate-100 border-b border-slate-200" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 border-b border-slate-100 px-6 flex items-center gap-4"
            >
              <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      {/* HEADER */}
      <div className="relative mb-10 overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.03] via-transparent to-[#10B981]/[0.03]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB]/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#10B981]/[0.04] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative px-8 py-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">
                Healthcare Dashboard
              </span>
            </div>
            <h1 className="text-4xl font-bold text-[#0F172A] tracking-tight">
              Patients
            </h1>
            <p className="text-[#64748B] text-base mt-2 max-w-lg leading-relaxed">
              Manage your clinical patient roster and track compliance across your entire practice.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {/* <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-sm font-medium text-emerald-700">
                System Online
              </span>
            </div> */}
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Patients */}
        <div className="group relative bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#2563EB]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#2563EB]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Active
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1">
              Total Active Patients
            </p>
            <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">
              {totalPatients}
            </h2>
            <p className="text-[#64748B] text-sm mt-2 font-medium">
              Across all subscriptions
            </p>
          </div>
        </div>

        {/* Compliance */}
        <div className="group relative bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#10B981]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#10B981]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-5 h-5 text-[#10B981]" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {compliancePercent}%
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1">
              Avg. Compliance
            </p>
            <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">
              {compliancePercent}%
            </h2>
            <p className="text-[#64748B] text-sm mt-2 font-medium">
              Real-time adherence rate
            </p>
          </div>
        </div>

        {/* Premium */}
        <div className="group relative bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-amber-500/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex items-center gap-1 text-amber-600 text-sm font-semibold bg-amber-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {totalPatients > 0 ? Math.round((premiumPatients / totalPatients) * 100) : 0}%
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1">
              Premium Subs
            </p>
            <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">
              {premiumPatients}
            </h2>
            <p className="text-[#64748B] text-sm mt-2 font-medium">
              Premium members
            </p>
          </div>
        </div>

        {/* Pending */}
        <div className="group relative bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#EF4444]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#EF4444]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <AlertCircle className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div className="flex items-center gap-1 text-red-600 text-sm font-semibold bg-red-50 px-2 py-1 rounded-lg">
                <ArrowDownRight className="w-3.5 h-3.5" />
                Attention
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1">
              Pending Reviews
            </p>
            <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">
              {pendingReviews}
            </h2>
            <p className="text-[#64748B] text-sm mt-2 font-medium">
              Requires immediate attention
            </p>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-4 mb-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-white/50 rounded-2xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* SEARCH */}
          <div className="flex-1 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <Search className="w-4 h-4 text-[#64748B] group-focus-within:text-[#2563EB] transition-colors duration-200" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name or ID..."
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

          {/* SUBSCRIPTION */}
          <div className="relative group">
            <select
              value={subscriptionFilter}
              onChange={(e) => setSubscriptionFilter(e.target.value)}
              className="h-12 px-4 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 cursor-pointer appearance-none transition-all duration-200 hover:border-slate-300 min-w-[160px]"
            >
              <option value="All">Subscription: All</option>
             <option value="premium">Premium</option>
<option value="basic">Basic</option>
<option value="free">Free</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
          </div>

          {/* STATUS */}
          <div className="relative group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-12 px-4 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 cursor-pointer appearance-none transition-all duration-200 hover:border-slate-300 min-w-[140px]"
            >
              <option value="All">Status: All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
          </div>

          {/* CLEAR */}
          <button
            onClick={() => {
              setSearch("");
              setSubscriptionFilter("All");
              setStatusFilter("All");
            }}
            className="h-12 px-5 rounded-xl border border-slate-200 text-[#2563EB] font-semibold text-sm hover:bg-[#2563EB]/5 hover:border-[#2563EB]/30 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Filter className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
        {/* TABLE HEADER */}
<div
  className={`${gridClass} px-6 py-4 bg-[#F8FAFC] border-b border-slate-200`}
>          <div className="flex items-center">Patient ID</div>
          <div className="flex items-center">Name</div>
          <div className="flex items-center">Age / Gender</div>
          <div className="flex items-center">Contact</div>
          <div className="flex items-center">Subscription</div>
          <div className="flex items-center">Compliance</div>
          <div className="flex items-center">Last Activity</div>
          {!isGuardian && (
  <div className="flex items-center">
    Actions
  </div>
)}
        </div>

        {/* ROWS */}
        {paginatedPatients.length > 0 ? (
          paginatedPatients.map((patient, index) => (
<div
  key={patient?._id || index}
  className={`${gridClass} px-6 py-5 border-b border-slate-100 items-center hover:bg-[#F8FAFC]/80 transition-all duration-200 group cursor-pointer`}
>
              {/* ID */}
              <div className="flex items-center">
                <span className="text-[#2563EB] font-semibold text-sm bg-[#2563EB]/5 px-2.5 py-1 rounded-lg group-hover:bg-[#2563EB]/10 transition-colors duration-200">
                  #{patient?._id?.slice(-6).toUpperCase() || "N/A"}
                </span>
              </div>

              {/* NAME */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB]/20 to-[#10B981]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                  <UserCircle className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#0F172A] text-sm truncate">
                    {patient?.firstName || patient?.name || "Unknown"}
                  </h3>
                  <p className="text-xs text-[#64748B] truncate">
                    Last visit: Recently
                  </p>
                </div>
              </div>

              {/* AGE */}
              <div className="text-[#475569] text-sm font-medium">
                {patient?.age || "--"} <span className="text-[#94A3B8]">/</span>{" "}
                <span className="uppercase">{patient?.gender || "--"}</span>
              </div>

              {/* CONTACT */}
              <div className="text-[#475569] text-sm leading-relaxed">
                <div className="truncate">{patient?.phone || patient?.email || "N/A"}</div>
              </div>

              {/* SUBSCRIPTION */}
             <div>
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 group-hover:scale-105

    ${
      (
        patient?.subscription ||
        ""
      ).toLowerCase() ===
      "premium"

        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"

        : (
            patient?.subscription ||
            ""
          ).toLowerCase() ===
          "basic"

        ? "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20"

        : "bg-slate-100 text-[#64748B] border border-slate-200/60"
    }`}
  >
    {(
      patient?.subscription ||
      ""
    ).toLowerCase() ===
      "premium" && (
      <Crown className="w-3 h-3" />
    )}

    {patient?.subscription ||
      "Free"}
  </span>
</div>

              {/* COMPLIANCE */}
              <div className="flex items-center gap-3">

  <div className="flex-1 max-w-[100px]">

    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">

      <div
        className={`h-full rounded-full transition-all duration-500 ease-out

        ${
          getComplianceStatus(
            patient
          ) === "High"
            ? "bg-[#10B981] w-[90%]"

            : getComplianceStatus(
                patient
              ) === "Medium"
            ? "bg-[#F59E0B] w-[55%]"

            : "bg-[#EF4444] w-[20%]"
        }`}
      />
    </div>
  </div>

  <span
    className={`text-xs font-semibold px-2 py-1 rounded-lg

    ${
      getComplianceStatus(
        patient
      ) === "High"
        ? "text-emerald-700 bg-emerald-50"

        : getComplianceStatus(
            patient
          ) === "Medium"
        ? "text-amber-700 bg-amber-50"

        : "text-red-700 bg-red-50"
    }`}
  >
    {getComplianceStatus(
      patient
    )}
  </span>
</div>

              {/* ACTIVITY */}
              <div className="text-[#475569] text-sm font-medium">
                {patient?.updatedAt
                  ? new Date(patient.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently"}
              </div>

              {/* ACTIONS */}
              <div className="flex items-center">
               {!isGuardian && (
  patient?.hospitals?.length > 0 ? (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60"
    >
      Linked
    </span>
  ) : (
    <button
      onClick={(e) => {
        e.stopPropagation();
        openHospitalLinkModal(patient);
      }}
      className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg px-3 py-2 text-xs font-semibold transition-all shadow-sm"
    >
      Link Hospital
    </button>
  )
)}
              </div>
            </div>
          ))
        ) : (
          /* EMPTY STATE */
          <div className="py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <Search className="w-8 h-8 text-[#94A3B8]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
              No Patients Found
            </h3>
            <p className="text-[#64748B] text-sm max-w-sm mx-auto leading-relaxed">
              No patients match your current filters. Try adjusting your search criteria or clear the filters to see all patients.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSubscriptionFilter("All");
                setStatusFilter("All");
              }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors duration-200"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 gap-4">
          <p className="text-[#64748B] text-sm font-medium">
            Showing{" "}
            <span className="text-[#0F172A] font-semibold">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="text-[#0F172A] font-semibold">
              {Math.min(currentPage * itemsPerPage, filteredPatients.length)}
            </span>{" "}
            of{" "}
            <span className="text-[#0F172A] font-semibold">
              {filteredPatients.length}
            </span>{" "}
            patients
          </p>

          {/* PAGINATION */}
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] hover:border-slate-300 hover:text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-200 transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages })
              .slice(0, 5)
              .map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200
                  ${
                    currentPage === index + 1
                      ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/20"
                      : "border border-slate-200 text-[#64748B] hover:bg-[#F8FAFC] hover:border-slate-300 hover:text-[#0F172A]"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

            {totalPages > 5 && (
              <span className="text-[#94A3B8] text-sm px-1">...</span>
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] hover:border-slate-300 hover:text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-slate-200 transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* HOSPITAL LINK MODAL */}
{!isGuardian &&
 hospitalLinkModalOpen &&
 selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeHospitalLinkModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[500px] overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Link Patient To Hospital
                </h2>
                <button
                  onClick={closeHospitalLinkModal}
                  className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors duration-200"
                >
                  <X className="w-4 h-4 text-[#64748B]" />
                </button>
              </div>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Connect this patient securely using OTP verification.
              </p>
            </div>

            {/* Patient Card */}
            <div className="px-8 pb-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/60">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB]/20 to-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                  <UserCircle className="w-6 h-6 text-[#2563EB]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#0F172A] text-sm truncate">
                    {selectedPatient?.firstName || selectedPatient?.name || "Unknown"}
                  </h3>
                  <p className="text-xs text-[#64748B] truncate">
                    {selectedPatient?.phone || "No phone"}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    (selectedPatient?.subscription || "").toLowerCase() === "premium"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      : (selectedPatient?.subscription || "").toLowerCase() === "basic"
                      ? "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20"
                      : "bg-slate-100 text-[#64748B] border border-slate-200/60"
                  }`}
                >
                  {(selectedPatient?.subscription || "").toLowerCase() === "premium" && (
                    <Crown className="w-3 h-3" />
                  )}
                  {selectedPatient?.subscription || "Free"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 pb-8">
              {otpSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-1">
                    Hospital linked successfully
                  </h3>
                  <p className="text-sm text-[#64748B]">
                    Closing in a moment...
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Step 1: Phone */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={otpPhone}
                      readOnly
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-4 text-sm text-[#0F172A] outline-none cursor-not-allowed"
                    />
                  </div>

                  {/* Step 2: OTP or Send Button */}
                  {!otpSent ? (
                    <button
                      onClick={sendLinkOTP}
                      disabled={otpLoading}
                      className="w-full h-12 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {otpLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2">
                          Enter OTP
                        </label>
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="6-digit OTP"
                          maxLength={6}
                          className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-4 pr-4 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all duration-200 text-center tracking-[0.5em] font-semibold"
                        />
                      </div>

                      <button
                        onClick={verifyLinkOTP}
                        disabled={otpLoading || otpCode.length < 4}
                        className="w-full h-12 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {otpLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Verify & Link Hospital"
                        )}
                      </button>
                    </div>
                  )}

                  {/* Error */}
                  {otpError && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200/60 text-red-700 text-sm font-medium">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {otpError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}