import {
  Search,
  Download,
  AlertTriangle,
  ShieldCheck,
  UserX,
  CheckCircle2,
  XCircle,
  Clock3,
  Loader2,
  Activity,
  Calendar,
  Pill,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  X,
  Phone,
  Mail,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../Api/axios";

export default function ComplianceTracker() {
  // ================= STATES =================
  const [users, setUsers] = useState([]);
  const [medications, setMedications] = useState([]);
  const [todayDoses, setTodayDoses] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // PATIENT COMPLIANCE MODAL STATE
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // ================= FETCH DATA =================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [usersRes, medicationsRes, todayRes, reportsRes] = await Promise.all([
        api.get("/users"),
        api.get("/medications"),
        api.get("/today"),
        api.get("/reports"),
      ]);

      const allUsers = Array.isArray(usersRes?.data?.users)
        ? usersRes.data.users
        : Array.isArray(usersRes?.data)
        ? usersRes.data
        : [];

      setUsers(allUsers.filter((user) => !user?.role || user?.role === "patient"));

      setMedications(
        Array.isArray(medicationsRes?.data?.medications)
          ? medicationsRes.data.medications
          : Array.isArray(medicationsRes?.data)
          ? medicationsRes.data
          : []
      );

      const rawToday = Array.isArray(todayRes?.data?.schedules)
        ? todayRes.data.schedules
        : Array.isArray(todayRes?.data?.doses)
        ? todayRes.data.doses
        : Array.isArray(todayRes?.data)
        ? todayRes.data
        : [];

      setTodayDoses(rawToday);

      setReports(
        Array.isArray(reportsRes?.data?.reports)
          ? reportsRes.data.reports
          : Array.isArray(reportsRes?.data)
          ? reportsRes.data
          : []
      );
    } catch (error) {
      console.error("COMPLIANCE FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to match dose or med with user
  const isUserMatch = (itemUser, targetUser) => {
    if (!itemUser || !targetUser) return false;
    const itemUserId = itemUser._id || itemUser.id || itemUser;
    const targetUserId = targetUser._id || targetUser.id;
    return String(itemUserId) === String(targetUserId);
  };

  // Compute stats per patient
  const patientStats = useMemo(() => {
    return users.map((user) => {
      const userMeds = medications.filter((m) => isUserMatch(m?.user, user));
      const userDoses = todayDoses.filter((d) => isUserMatch(d?.user, user));

      const completedDoses = userDoses.filter(
        (d) => d?.status === "taken" || d?.taken === true
      );
      const missedDoses = userDoses.filter(
        (d) => d?.status === "missed" || d?.status === "MISSED"
      );
      const pendingDoses = userDoses.filter(
        (d) =>
          d?.status === "pending" ||
          (!d?.taken && d?.status !== "taken" && d?.status !== "missed" && d?.status !== "MISSED")
      );

      const verifiedDoses = completedDoses.filter(
        (d) => d?.proofImage || d?.verified
      );

      // Score: If today has doses, adherence is completed / total. If no doses today, fallback to 100% if meds active or N/A
      let score = 100;
      if (userDoses.length > 0) {
        score = Math.round((completedDoses.length / userDoses.length) * 100);
      } else if (userMeds.length === 0) {
        score = 100;
      }

      let risk = "Low";
      if (score < 50 || missedDoses.length >= 2) {
        risk = "Critical";
      } else if (score < 80 || missedDoses.length > 0) {
        risk = "Moderate";
      }

      return {
        user,
        medsCount: userMeds.length,
        userMeds,
        todayCount: userDoses.length,
        userDoses,
        completedCount: completedDoses.length,
        missedCount: missedDoses.length,
        pendingCount: pendingDoses.length,
        verifiedCount: verifiedDoses.length,
        score,
        risk,
      };
    });
  }, [users, medications, todayDoses]);

  // Overall KPIs
  const totalDosesToday = todayDoses.length;
  const totalCompletedDoses = todayDoses.filter(
    (d) => d?.status === "taken" || d?.taken === true
  ).length;
  const totalMissedDoses = todayDoses.filter(
    (d) => d?.status === "missed" || d?.status === "MISSED"
  ).length;
  const totalPendingDoses = todayDoses.filter(
    (d) =>
      d?.status === "pending" ||
      (!d?.taken && d?.status !== "taken" && d?.status !== "missed" && d?.status !== "MISSED")
  ).length;

  const totalVerifiedDoses = todayDoses.filter(
    (d) => (d?.status === "taken" || d?.taken === true) && (d?.proofImage || d?.verified)
  ).length;

  const averageCompliance =
    totalDosesToday > 0
      ? Math.round((totalCompletedDoses / totalDosesToday) * 100)
      : users.length > 0
      ? 100
      : 0;

  const highRiskPatientsCount = patientStats.filter(
    (p) => p.risk === "Critical" || p.risk === "Moderate"
  ).length;

  const verificationRate =
    totalCompletedDoses > 0
      ? Math.round((totalVerifiedDoses / totalCompletedDoses) * 100)
      : 0;

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return patientStats.filter(({ user, risk }) => {
      const q = search.toLowerCase();
      const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim().toLowerCase();
      const phone = (user?.phone || "").toLowerCase();
      const email = (user?.email || "").toLowerCase();

      const matchesSearch = !q || name.includes(q) || phone.includes(q) || email.includes(q);
      const matchesRisk =
        riskFilter === "All" ||
        (riskFilter === "High" && (risk === "Critical" || risk === "Moderate")) ||
        (riskFilter === "Low" && risk === "Low");

      return matchesSearch && matchesRisk;
    });
  }, [patientStats, search, riskFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRoster.length / itemsPerPage) || 1;
  const paginatedRoster = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRoster.slice(start, start + itemsPerPage);
  }, [filteredRoster, currentPage]);

  // Export CSV Report
  const exportCSVReport = () => {
    const headers = [
      "Patient Name",
      "Phone",
      "Email",
      "Active Medications",
      "Today Total Doses",
      "Completed Doses",
      "Missed Doses",
      "Pending Doses",
      "Compliance Score (%)",
      "Risk Level",
    ];

    const rows = filteredRoster.map(({ user, medsCount, todayCount, completedCount, missedCount, pendingCount, score, risk }) => [
      `"${user?.firstName || "Patient"} ${user?.lastName || ""}"`,
      `"${user?.phone || ""}"`,
      `"${user?.email || ""}"`,
      medsCount,
      todayCount,
      completedCount,
      missedCount,
      pendingCount,
      `${score}%`,
      risk,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Medikto_Compliance_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#2563EB]" />
        <p className="text-sm font-medium text-slate-500">
          Calculating patient adherence analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      {/* ================= HERO HEADER ================= */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.04] via-transparent to-[#10B981]/[0.04]" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#2563EB]/[0.06] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#10B981]/[0.06] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative px-6 sm:px-8 py-7 sm:py-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748B]">
                Clinical Adherence Monitoring
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
              Compliance Tracking
            </h1>
            <p className="text-[#64748B] mt-2 text-base max-w-xl leading-relaxed">
              Real-time medication intake verification, patient risk stratification, and adherence trends across your clinic.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCSVReport}
              className="h-12 px-6 rounded-2xl bg-[#2563EB] text-white font-semibold shadow-lg shadow-[#2563EB]/25 hover:bg-[#1D4ED8] hover:shadow-xl hover:shadow-[#2563EB]/35 active:scale-95 transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {/* CARD 1: AVERAGE COMPLIANCE */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#2563EB]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] mb-2">
                Average Compliance
              </p>
              <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">
                {averageCompliance}%
              </h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] font-bold text-base ring-4 ring-[#2563EB]/10">
              {averageCompliance}%
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100/60">
              <TrendingUp className="w-3.5 h-3.5" />
              Real-time adherence
            </span>
          </div>
        </div>

        {/* CARD 2: MISSED DOSES */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-red-500/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] mb-2">
                Missed Doses
              </p>
              <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">
                {totalMissedDoses}
              </h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 ring-4 ring-red-50">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                totalMissedDoses > 0
                  ? "bg-red-50 text-red-700 border border-red-100/60"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-100/60"
              }`}
            >
              {totalMissedDoses > 0 ? "Action required" : "Zero missed doses"}
            </span>
            <span className="text-xs text-slate-400">
              {totalPendingDoses} pending today
            </span>
          </div>
        </div>

        {/* CARD 3: HIGH-RISK PATIENTS */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-amber-500/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] mb-2">
                High-Risk Patients
              </p>
              <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">
                {highRiskPatientsCount}
              </h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 ring-4 ring-amber-50">
              <UserX className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                highRiskPatientsCount > 0
                  ? "bg-amber-50 text-amber-700 border border-amber-100/60"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-100/60"
              }`}
            >
              {highRiskPatientsCount > 0 ? "Needs clinical follow-up" : "All patients optimal"}
            </span>
          </div>
        </div>

        {/* CARD 4: VERIFICATION RATE */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#10B981]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] mb-2">
                Verification Rate
              </p>
              <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">
                {verificationRate}%
              </h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 ring-4 ring-emerald-50">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100/60">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {totalVerifiedDoses} photo verified
            </span>
          </div>
        </div>
      </div>

      {/* ================= ROSTER TABLE SECTION ================= */}
      <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
        {/* TABLE FILTER & SEARCH TOOLBAR */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              Patient Compliance Roster
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Live adherence records and risk classification
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* SEARCH */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search patient or phone..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>

            {/* RISK FILTER */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {["All", "High", "Low"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setRiskFilter(lvl);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    riskFilter === lvl
                      ? "bg-white text-[#0F172A] shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {lvl === "All" ? "All Patients" : lvl === "High" ? "Needs Attention" : "High Adherence"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] border-b border-slate-100">
              <tr className="text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Patient</th>
                <th className="py-4 px-6">Compliance Score</th>
                <th className="py-4 px-6">Active Meds</th>
                <th className="py-4 px-6">Today's Doses</th>
                <th className="py-4 px-6">Risk Stratification</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedRoster.length > 0 ? (
                paginatedRoster.map((item, index) => {
                  const {
                    user,
                    medsCount,
                    todayCount,
                    completedCount,
                    missedCount,
                    pendingCount,
                    score,
                    risk,
                  } = item;

                  return (
                    <tr
                      key={user?._id || index}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* PATIENT */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={
                              user?.profilePic ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user?.firstName || "P"
                              )}&background=2563EB&color=fff`
                            }
                            alt=""
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shadow-sm"
                          />
                          <div>
                            <h4 className="font-semibold text-[#0F172A]">
                              {user?.firstName || "Patient"}{" "}
                              {user?.lastName || ""}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                              <span>{user?.phone || "No phone"}</span>
                              {user?.email && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[140px]">
                                    {user.email}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* COMPLIANCE SCORE */}
                      <td className="py-4 px-6">
                        <div className="w-36">
                          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                            <span
                              className={
                                score >= 80
                                  ? "text-emerald-600"
                                  : score >= 50
                                  ? "text-amber-600"
                                  : "text-red-600"
                              }
                            >
                              {score}%
                            </span>
                            <span className="text-slate-400 font-normal text-[11px]">
                              {completedCount}/{todayCount || medsCount || 0} taken
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              style={{ width: `${score}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                score >= 80
                                  ? "bg-emerald-500"
                                  : score >= 50
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* ACTIVE MEDS */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                          <Pill className="w-3.5 h-3.5 text-[#2563EB]" />
                          {medsCount} {medsCount === 1 ? "medication" : "medications"}
                        </span>
                      </td>

                      {/* TODAY'S DOSES BREAKDOWN */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {completedCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {completedCount} taken
                            </span>
                          )}
                          {missedCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-100">
                              <XCircle className="w-3 h-3 text-red-600" />
                              {missedCount} missed
                            </span>
                          )}
                          {pendingCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                              <Clock3 className="w-3 h-3 text-slate-500" />
                              {pendingCount} pending
                            </span>
                          )}
                          {todayCount === 0 && (
                            <span className="text-xs text-slate-400 italic">
                              No doses scheduled today
                            </span>
                          )}
                        </div>
                      </td>

                      {/* RISK */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            risk === "Low"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : risk === "Moderate"
                              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                              : "bg-red-50 text-red-700 border border-red-200/60"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              risk === "Low"
                                ? "bg-emerald-500"
                                : risk === "Moderate"
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                          />
                          {risk === "Low"
                            ? "Low Risk"
                            : risk === "Moderate"
                            ? "Moderate Risk"
                            : "Critical Attention"}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            setSelectedPatient(item);
                            setDetailModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#2563EB] text-slate-700 hover:text-white text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <UserX className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No patients found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting your search query or risk filters
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER & PAGINATION */}
        <div className="flex items-center justify-between p-5 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing{" "}
            <strong className="text-slate-800">
              {filteredRoster.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </strong>{" "}
            to{" "}
            <strong className="text-slate-800">
              {Math.min(currentPage * itemsPerPage, filteredRoster.length)}
            </strong>{" "}
            of <strong className="text-slate-800">{filteredRoster.length}</strong>{" "}
            patients
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition cursor-pointer flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= PATIENT DETAILS COMPLIANCE MODAL ================= */}
      {detailModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* MODAL HEADER */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={
                    selectedPatient.user?.profilePic ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selectedPatient.user?.firstName || "P"
                    )}&background=2563EB&color=fff`
                  }
                  alt=""
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20"
                />
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedPatient.user?.firstName}{" "}
                    {selectedPatient.user?.lastName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedPatient.user?.phone || "No phone"}
                    </span>
                    {selectedPatient.user?.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {selectedPatient.user.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDetailModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* MODAL CONTENT BODY */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* ADHERENCE STATS GRID */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    Adherence Score
                  </p>
                  <h4
                    className={`text-2xl font-bold mt-1 ${
                      selectedPatient.score >= 80
                        ? "text-emerald-600"
                        : selectedPatient.score >= 50
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedPatient.score}%
                  </h4>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    Active Prescriptions
                  </p>
                  <h4 className="text-2xl font-bold text-[#0F172A] mt-1">
                    {selectedPatient.medsCount}
                  </h4>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    Risk Assessment
                  </p>
                  <h4
                    className={`text-xl font-bold mt-1.5 ${
                      selectedPatient.risk === "Low"
                        ? "text-emerald-600"
                        : selectedPatient.risk === "Moderate"
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedPatient.risk}
                  </h4>
                </div>
              </div>

              {/* TODAY'S DOSES TIMELINE */}
              <div>
                <h4 className="font-bold text-sm text-[#0F172A] mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#2563EB]" />
                  Today's Dose Timeline
                </h4>

                {selectedPatient.userDoses.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedPatient.userDoses.map((dose, idx) => (
                      <div
                        key={dose._id || idx}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                          dose?.status === "taken" || dose?.taken
                            ? "bg-emerald-50/50 border-emerald-200/60"
                            : dose?.status === "missed" || dose?.status === "MISSED"
                            ? "bg-red-50/50 border-red-200/60"
                            : "bg-slate-50 border-slate-200/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              dose?.status === "taken" || dose?.taken
                                ? "bg-emerald-100 text-emerald-700"
                                : dose?.status === "missed" || dose?.status === "MISSED"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            <Pill className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-xs sm:text-sm text-[#0F172A]">
                              {dose?.medication?.name || "Medication"}
                            </h5>
                            <span className="text-[11px] text-slate-400">
                              {dose?.time || "--:--"} • {dose?.medication?.dosage || ""}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {dose?.proofImage && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              Photo Verified
                            </span>
                          )}
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              dose?.status === "taken" || dose?.taken
                                ? "bg-emerald-100 text-emerald-800"
                                : dose?.status === "missed" || dose?.status === "MISSED"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {dose?.status === "taken" || dose?.taken
                              ? "Taken"
                              : dose?.status === "missed" || dose?.status === "MISSED"
                              ? "Missed"
                              : "Pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-3 text-center bg-slate-50 rounded-xl">
                    No scheduled doses for today.
                  </p>
                )}
              </div>

              {/* ACTIVE MEDICATIONS LIST */}
              <div>
                <h4 className="font-bold text-sm text-[#0F172A] mb-3 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-[#2563EB]" />
                  Active Medications ({selectedPatient.userMeds.length})
                </h4>

                {selectedPatient.userMeds.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedPatient.userMeds.map((med, idx) => (
                      <div
                        key={med._id || idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-xs text-[#0F172A]">
                            {med.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {med.dosage} {med.unit || "mg"} • {med.frequency || "Daily"}
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100">
                          {med.status || "Active"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-3 text-center bg-slate-50 rounded-xl">
                    No active medications recorded.
                  </p>
                )}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}