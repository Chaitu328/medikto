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
  Phone,
  Mail,
  Calendar,
  Eye,
  CheckCircle2,
  ShieldCheck,
  HeartPulse,
  Droplets,
  Ruler,
  Weight,
  Building2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import api from "../Api/axios";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // PATIENT DETAILS DRAWER STATE
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

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

  useEffect(() => {
    fetchPatients();
  }, []);

  // FETCH PATIENTS
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      const patientData = Array.isArray(response?.data?.users)
        ? response.data.users
        : Array.isArray(response?.data)
        ? response.data
        : [];
      setPatients(patientData);
    } catch (error) {
      console.log("FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceStatus = (patient) => {
    const adherence = Number(patient?.adherence) || 0;
    if (adherence >= 80) return "High";
    if (adherence >= 50) return "Medium";
    return "Low";
  };

  // FILTERED PATIENTS
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      if (patient.role !== "patient") return false;

      // SEARCH
      const q = search.toLowerCase();
      const matchesSearch =
        (patient?.firstName || "").toLowerCase().includes(q) ||
        (patient?.name || "").toLowerCase().includes(q) ||
        (patient?.email || "").toLowerCase().includes(q) ||
        (patient?.phone || "").toLowerCase().includes(q) ||
        (patient?._id || "").toLowerCase().includes(q);

      // SUBSCRIPTION
      const plan = (patient?.subscription || "free").toLowerCase();
      const selectedPlan = subscriptionFilter.toLowerCase();
      const matchesSubscription =
        subscriptionFilter === "All" || plan === selectedPlan;

      // COMPLIANCE
      const compliance = getComplianceStatus(patient);
      const matchesStatus =
        statusFilter === "All" || compliance === statusFilter;

      return matchesSearch && matchesSubscription && matchesStatus;
    });
  }, [patients, search, subscriptionFilter, statusFilter]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / itemsPerPage));
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, subscriptionFilter, statusFilter]);

  // STATS
  const patientList = patients.filter((p) => p.role === "patient");
  const totalPatients = patientList.length;
  const premiumPatients = patientList.filter(
    (p) => (p?.subscription || "").toLowerCase() === "premium"
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
      const response = await api.post("/hospitals/send-link-otp", {
        phone: otpPhone,
      });
      if (response.data.success) {
        setOtpSent(true);
      } else {
        setOtpError(response.data.message || "Failed to dispatch verification code.");
      }
    } catch (err) {
      setOtpError(err?.response?.data?.message || err.message || "Failed to send code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyLinkOTP = async () => {
    if (!otpCode || otpCode.length < 4) {
      setOtpError("Please enter the 6-digit authorization code");
      return;
    }
    try {
      setOtpLoading(true);
      setOtpError("");
      const response = await api.post("/hospitals/verify-link", {
        phone: otpPhone,
        otp: otpCode,
      });
      if (response.data.success) {
        setOtpSuccess(true);
        fetchPatients();
        setTimeout(() => {
          closeHospitalLinkModal();
        }, 2000);
      } else {
        setOtpError(response.data.message || "Invalid or expired authorization code.");
      }
    } catch (err) {
      setOtpError(err?.response?.data?.message || err.message || "Verification failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  const openPatientDetail = (patient) => {
    setSelectedPatientForDetail(patient);
    setDetailDrawerOpen(true);
  };

  const getInitials = (patient) => {
    const name = patient?.firstName || patient?.name || "P";
    return name.charAt(0).toUpperCase();
  };

  // SKELETON LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-8 space-y-8 animate-pulse">
        <div className="h-28 bg-white rounded-3xl border border-slate-200/60 shadow-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-white rounded-2xl border border-slate-200/60 shadow-sm" />
          ))}
        </div>
        <div className="h-16 bg-white rounded-2xl border border-slate-200/60 shadow-sm" />
        <div className="h-96 bg-white rounded-2xl border border-slate-200/60 shadow-sm" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 px-4 sm:px-8 pt-6">
      {/* ── HEADER BANNER ────────────────────────────────────────────── */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl shadow-slate-900/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_40%)]" />

        <div className="relative px-8 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                Clinical Practice Directory
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Patient Management
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-1.5 max-w-xl leading-relaxed">
              Monitor connected patients, real-time medication adherence, clinical records, and hospital link status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-xs font-medium text-slate-200 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{totalPatients} Connected {totalPatients === 1 ? "Patient" : "Patients"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── METRIC STAT CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Patients */}
        <div className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
              <ArrowUpRight className="w-3 h-3" />
              Active
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Patients
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalPatients}
            </span>
            <span className="text-xs text-slate-500 font-medium">on roster</span>
          </div>
        </div>

        {/* Adherence Rate */}
        <div className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              {compliancePercent}% High
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Avg. Adherence
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {compliancePercent}%
            </span>
            <span className="text-xs text-slate-500 font-medium">overall rate</span>
          </div>
        </div>

        {/* Premium Subs */}
        <div className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-violet-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100/80 flex items-center justify-center text-violet-600 shadow-sm group-hover:scale-105 transition-transform">
              <Crown className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200/60">
              Premium Tier
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Premium Care
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {premiumPatients}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({totalPatients > 0 ? Math.round((premiumPatients / totalPatients) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="group relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-rose-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100/80 flex items-center justify-center text-rose-600 shadow-sm group-hover:scale-105 transition-transform">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
              Attention
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Pending Reviews
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {pendingReviews}
            </span>
            <span className="text-xs text-slate-500 font-medium">low adherence</span>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 mb-6 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email, or Patient ID..."
            className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/60 pl-11 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200/80 flex items-center justify-center hover:bg-slate-300 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-slate-600" />
            </button>
          )}
        </div>

        {/* Subscription Dropdown */}
        <div className="relative min-w-[170px]">
          <select
            value={subscriptionFilter}
            onChange={(e) => setSubscriptionFilter(e.target.value)}
            className="w-full h-11 px-4 pr-10 rounded-xl border border-slate-200 bg-slate-50/60 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 cursor-pointer appearance-none transition-all"
          >
            <option value="All">Subscription: All</option>
            <option value="premium">Premium</option>
            <option value="basic">Basic</option>
            <option value="free">Free</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Status Dropdown */}
        <div className="relative min-w-[160px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-11 px-4 pr-10 rounded-xl border border-slate-200 bg-slate-50/60 text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 cursor-pointer appearance-none transition-all"
          >
            <option value="All">Adherence: All</option>
            <option value="High">High (80%+)</option>
            <option value="Medium">Medium (50-79%)</option>
            <option value="Low">Low (&lt;50%)</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Clear Filter Button */}
        {(search || subscriptionFilter !== "All" || statusFilter !== "All") && (
          <button
            onClick={() => {
              setSearch("");
              setSubscriptionFilter("All");
              setStatusFilter("All");
            }}
            className="h-11 px-4 rounded-xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-100/60 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>

      {/* ── PATIENTS TABLE ──────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Patient</th>
                <th className="py-4 px-4">Patient ID</th>
                <th className="py-4 px-4">Demographics</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4">Plan</th>
                <th className="py-4 px-4">Adherence</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPatients.length > 0 ? (
                paginatedPatients.map((patient, index) => {
                  const patientName = patient?.firstName || patient?.name || "Patient";
                  const phone = patient?.phone || "N/A";
                  const email = patient?.email || "";
                  const subPlan = (patient?.subscription || "free").toLowerCase();
                  const compliance = getComplianceStatus(patient);
                  const isLinked = Array.isArray(patient?.hospitals) && patient.hospitals.length > 0;
                  const adherenceValue = Number(patient?.adherence) || 0;

                  return (
                    <tr
                      key={patient?._id || index}
                      onClick={() => openPatientDetail(patient)}
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    >
                      {/* Patient Name + Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                            {getInitials(patient)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                              {patientName}
                            </h3>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {email || "Medikto Member"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Monospace ID */}
                      <td className="py-4 px-4">
                        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                          #{patient?._id?.slice(-6).toUpperCase() || "N/A"}
                        </span>
                      </td>

                      {/* Demographics */}
                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-xs font-semibold text-slate-700">
                          <span>{patient?.age ? `${patient.age} yrs` : "Age N/A"}</span>
                          <span className="text-slate-300">•</span>
                          <span className="uppercase text-[11px] text-slate-500">
                            {patient?.gender || "Unknown"}
                          </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4">
                        <div className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{phone}</span>
                        </div>
                      </td>

                      {/* Subscription */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            subPlan === "premium"
                              ? "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border border-amber-300/60 shadow-xs"
                              : subPlan === "basic"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {subPlan === "premium" && <Crown className="w-3 h-3 text-amber-600" />}
                          {patient?.subscription || "Free"}
                        </span>
                      </td>

                      {/* Adherence */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5 w-28">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span
                              className={
                                compliance === "High"
                                  ? "text-emerald-700"
                                  : compliance === "Medium"
                                  ? "text-amber-700"
                                  : "text-rose-700"
                              }
                            >
                              {compliance === "High" ? "Optimal" : compliance === "Medium" ? "Fair" : "Low"}
                            </span>
                            <span className="text-slate-500">{adherenceValue}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.max(10, adherenceValue || (compliance === "High" ? 85 : compliance === "Medium" ? 55 : 20))}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                compliance === "High"
                                  ? "bg-emerald-500"
                                  : compliance === "Medium"
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status / Link */}
                      <td className="py-4 px-4">
                        {isLinked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            Unlinked
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openPatientDetail(patient)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-semibold transition-all shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            Profile
                          </button>

                          {!isGuardian && !isLinked && (
                            <button
                              onClick={() => openHospitalLinkModal(patient)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm"
                            >
                              Connect
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* Empty State */
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      No Patients Found
                    </h3>
                    <p className="text-slate-500 text-xs max-w-sm mx-auto">
                      No patients match your selected filters. Reset filters or check back later.
                    </p>
                    <button
                      onClick={() => {
                        setSearch("");
                        setSubscriptionFilter("All");
                        setStatusFilter("All");
                      }}
                      className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all"
                    >
                      Clear All Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── FOOTER & PAGINATION ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/40 gap-4">
          <p className="text-slate-500 text-xs font-medium">
            Showing <span className="text-slate-900 font-bold">{filteredPatients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{" "}
            <span className="text-slate-900 font-bold">{Math.min(currentPage * itemsPerPage, filteredPatients.length)}</span> of{" "}
            <span className="text-slate-900 font-bold">{filteredPatients.length}</span> patients
          </p>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                  currentPage === idx + 1
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── PATIENT DETAIL CLINICAL SLIDE-OVER DRAWER ─────────────────── */}
      {detailDrawerOpen && selectedPatientForDetail && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDetailDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <UserCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Patient Profile</h2>
                    <p className="text-xs text-slate-500 font-mono">#{selectedPatientForDetail._id?.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailDrawerOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Hero Avatar & Name */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-slate-50 border border-blue-100/60">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    {getInitials(selectedPatientForDetail)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedPatientForDetail?.firstName || selectedPatientForDetail?.name || "Patient"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedPatientForDetail?.phone || "No phone"}</p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                      {selectedPatientForDetail?.subscription || "Free Plan"}
                    </span>
                  </div>
                </div>

                {/* Vitals Grid */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Clinical Biometrics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <Droplets className="w-3.5 h-3.5 text-rose-500" />
                        <span>Blood Group</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{selectedPatientForDetail?.bloodGroup || "Not recorded"}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>Age & Gender</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedPatientForDetail?.age ? `${selectedPatientForDetail.age} yrs` : "--"} / {selectedPatientForDetail?.gender || "--"}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <Ruler className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Height</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedPatientForDetail?.height ? `${selectedPatientForDetail.height} cm` : "Not recorded"}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <Weight className="w-3.5 h-3.5 text-amber-500" />
                        <span>Weight</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedPatientForDetail?.weight ? `${selectedPatientForDetail.weight} kg` : "Not recorded"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Connection Status */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Hospital Connection
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-medium">Link Status:</span>
                      {selectedPatientForDetail?.hospitals?.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
                          Unlinked
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 font-medium">Account Created:</span>
                      <span className="text-xs font-semibold text-slate-800">
                        {selectedPatientForDetail?.createdAt
                          ? new Date(selectedPatientForDetail.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex gap-3">
                <button
                  onClick={() => setDetailDrawerOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HOSPITAL LINK MODAL ─────────────────────────────────────── */}
      {!isGuardian && hospitalLinkModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeHospitalLinkModal}
          />

          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[480px] overflow-hidden">
            <div className="px-7 pt-7 pb-5">
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-lg font-bold text-slate-900">
                  Connect Patient with Clinic
                </h2>
                <button
                  onClick={closeHospitalLinkModal}
                  className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Initiate clinical link via direct OTP authorization.
              </p>
            </div>

            <div className="px-7 pb-5">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {getInitials(selectedPatient)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">
                    {selectedPatient?.firstName || selectedPatient?.name || "Patient"}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{selectedPatient?.phone || "No phone"}</p>
                </div>
              </div>
            </div>

            <div className="px-7 pb-7">
              {otpSuccess ? (
                <div className="text-center py-5">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Connection Authorized
                  </h3>
                  <p className="text-xs text-slate-500">
                    The patient is now connected to your clinic.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Patient Phone
                    </label>
                    <input
                      type="text"
                      value={otpPhone}
                      readOnly
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-700 outline-none cursor-not-allowed"
                    />
                  </div>

                  {!otpSent ? (
                    <button
                      onClick={sendLinkOTP}
                      disabled={otpLoading}
                      className="w-full h-11 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
                    >
                      {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Authorization Code"}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-xs">
                        A 6-digit verification code was sent to the patient&apos;s device.
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Enter Code
                        </label>
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="••••••"
                          maxLength={6}
                          className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-center tracking-[0.4em] font-bold text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>

                      <button
                        onClick={verifyLinkOTP}
                        disabled={otpLoading || otpCode.length < 4}
                        className="w-full h-11 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
                      >
                        {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize & Link"}
                      </button>
                    </div>
                  )}

                  {otpError && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
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