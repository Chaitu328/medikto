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
  UserCircle,
  ChevronDown,
  FileText,
  Upload,
  Trash2,
  Eye,
  Stethoscope,
  Shield,
  TrendingUp,
  TrendingDown,
  Inbox,
  Loader2,
  Sparkles,
  User,
} from "lucide-react";

import api from "../Api/axios";
import PatientAutocomplete from "../Components/PatientAutocomplete";
import {
  resolvePatient,
  getPatientDisplayName,
  getPatientIdentifier,
  recordMatchesPatient,
} from "../Utils/patientUtils";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [loading, setLoading] = useState(true);

  const [subscriptionFilter, setSubscriptionFilter] = useState("All");

  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  // ================= FETCH =================
  useEffect(() => {
    fetchPatients();
    fetchPrescriptions();
  }, []);

  // ================= FETCH PATIENTS =================
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

  // ================= FETCH PRESCRIPTIONS =================
  const fetchPrescriptions = async () => {
    try {
      const response = await api.get("/prescriptions");

      const prescriptionData = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.prescriptions)
        ? response.data.prescriptions
        : [];

      setPrescriptions(prescriptionData);
    } catch (error) {
      console.log("PRESCRIPTION ERROR:", error);
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

  // ================= DELETE PRESCRIPTION =================
  const handleDeletePrescription = async (id) => {
    try {
      await api.delete(`/prescriptions/${id}`);

      fetchPrescriptions();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= FILTER =================
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      if (patient.role && patient.role !== "patient") {
        return false;
      }

      const matchesSelected =
        !selectedPatient ||
        String(patient._id || patient.id) ===
          String(selectedPatient._id || selectedPatient.id);

      const plan = (patient?.subscription || "Free").toLowerCase();
      const selectedPlan = subscriptionFilter.toLowerCase();
      const matchesSubscription =
        subscriptionFilter === "All" || plan === selectedPlan;

      const compliance = getComplianceStatus(patient);
      const matchesStatus =
        statusFilter === "All" || compliance === statusFilter;

      return matchesSelected && matchesSubscription && matchesStatus;
    });
  }, [patients, selectedPatient, subscriptionFilter, statusFilter]);

  const filteredPrescriptions = useMemo(() => {
    if (!selectedPatient) return prescriptions;
    return prescriptions.filter((item) =>
      recordMatchesPatient(item, selectedPatient, patients)
    );
  }, [prescriptions, selectedPatient, patients]);
  // ================= PAGINATION =================
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

  // ================= STATS =================
  const patientList = patients.filter(
  (p) => p.role === "patient"
);
 const totalPatients = patientList.length;

const premiumPatients =
  patientList.filter(
    (p) =>
      (p?.subscription || "").toLowerCase() === "premium"
  ).length;

const highCompliance =
  patientList.filter(
    (p) =>
      getComplianceStatus(p) === "High"
  ).length;

const pendingReviews =
  patientList.filter(
    (p) =>
      getComplianceStatus(p) === "Low"
  ).length;

  const compliancePercent =
  totalPatients > 0
    ? Math.round(
        (highCompliance / totalPatients) * 100
      )
    : 0;
  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6">
        {/* Header Skeleton */}
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-sm p-6 sm:p-8">
          <div className="h-10 w-48 bg-slate-200 rounded-xl animate-pulse mb-3" />
          <div className="h-5 w-80 bg-slate-200 rounded-lg animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 animate-pulse mb-5" />
              <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-10 w-16 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>

        {/* Filter Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 shadow-sm">
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
            <div key={i} className="h-16 border-b border-slate-100 px-6 flex items-center gap-4">
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
    <div className="space-y-6 sm:space-y-8">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-xs">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.04] via-transparent to-[#10B981]/[0.04]" />
        <div className="absolute top-0 right-0 w-64 sm:w-80 h-64 sm:h-80 bg-[#2563EB]/[0.06] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 sm:w-56 h-48 sm:h-56 bg-[#10B981]/[0.06] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative px-5 sm:px-8 py-5 sm:py-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-2 sm:mb-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-[#2563EB]" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
                Healthcare Dashboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] tracking-tight">
              Prescriptions & Patients
            </h1>
            <p className="text-[#64748B] mt-1.5 text-xs sm:text-sm lg:text-base max-w-lg leading-relaxed">
              Manage patients, prescriptions and healthcare compliance across your entire practice.
            </p>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {/* TOTAL */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#2563EB]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5" />
                Active
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] mb-2">
              Total Patients
            </p>
            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">{totalPatients}</h2>
          </div>
        </div>

        {/* COMPLIANCE */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#10B981]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-5 h-5 text-[#10B981]" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5" />
                {compliancePercent}%
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] mb-2">
              Compliance
            </p>
            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">{compliancePercent}%</h2>
            <div className="mt-3">
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${compliancePercent}%` }}
                  className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full transition-all duration-700 ease-out"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PREMIUM */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-amber-500/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex items-center gap-1 text-amber-600 text-sm font-semibold bg-amber-50 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5" />
                {totalPatients > 0 ? Math.round((premiumPatients / totalPatients) * 100) : 0}%
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] mb-2">
              Premium Users
            </p>
            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">{premiumPatients}</h2>
          </div>
        </div>

        {/* ALERTS */}
        <div className="group relative bg-white rounded-3xl p-6 border border-red-100/60 shadow-sm hover:shadow-lg hover:shadow-[#EF4444]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#EF4444]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <AlertCircle className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div className="flex items-center gap-1 text-red-600 text-sm font-semibold bg-red-50 px-2 py-1 rounded-lg">
                <TrendingDown className="w-3.5 h-3.5" />
                Alert
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] mb-2">
              Pending Reviews
            </p>
            <h2 className="text-4xl font-bold text-[#EF4444] tracking-tight">{pendingReviews}</h2>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="relative z-40 bg-white rounded-2xl p-4 mb-6 border border-slate-200/60 shadow-xs">
        <div className="relative flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* PATIENT AUTOCOMPLETE */}
          <div className="flex-1">
            <PatientAutocomplete
              selectedPatient={selectedPatient}
              onSelectPatient={setSelectedPatient}
              patients={patients}
              placeholder="Search patient by name, phone, or ID to filter records..."
            />
          </div>

          {/* SUBSCRIPTION */}
          <div className="relative group">
            <select
              value={subscriptionFilter}
              onChange={(e) => setSubscriptionFilter(e.target.value)}
              className="h-12 px-4 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-[#0F172A] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 cursor-pointer appearance-none transition-all duration-200 hover:border-slate-300 min-w-[160px]"
            >
              <option value="All">All Plans</option>
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
              <option value="All">All Status</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
          </div>

          {/* CLEAR */}
          <button
            onClick={() => {
              setSelectedPatient(null);
              setSubscriptionFilter("All");
              setStatusFilter("All");
            }}
            className="h-12 px-5 rounded-xl border border-slate-200 text-[#2563EB] font-semibold text-sm hover:bg-[#2563EB]/5 hover:border-[#2563EB]/30 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Filter className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* PATIENTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 mb-10">
        <div className="overflow-x-auto w-full">
          <div className="min-w-[760px]">
            {/* HEADER */}
            <div className="grid grid-cols-7 gap-4 px-6 py-4 bg-[#F8FAFC] border-b border-slate-200 text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B] sticky top-0 z-10">
          <div className="flex items-center">ID</div>
          <div className="flex items-center">Name</div>
          <div className="flex items-center">Age/Gender</div>
          <div className="flex items-center">Contact</div>
          <div className="flex items-center">Plan</div>
          <div className="flex items-center">Compliance</div>
          <div className="flex items-center">Updated</div>
        </div>

        {/* ROWS */}
        {paginatedPatients.length > 0 ? (
          paginatedPatients.map((patient, index) => (
            <div
              key={patient?._id || index}
              className="grid grid-cols-7 gap-4 px-6 py-5 border-b border-slate-100 items-center hover:bg-[#F8FAFC]/80 transition-all duration-200 group cursor-pointer"
            >
              {/* ID */}
              <div>
                <span className="text-[#2563EB] font-semibold text-sm bg-[#2563EB]/5 px-2.5 py-1 rounded-lg group-hover:bg-[#2563EB]/10 transition-colors duration-200">
                  #{patient?._id?.slice(-6).toUpperCase()}
                </span>
              </div>

              {/* NAME */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB]/20 to-[#10B981]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                  <UserCircle className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-[#0F172A] truncate">
                    {patient?.firstName || "Unknown"}
                  </h3>
                  <p className="text-xs text-[#64748B]">Patient</p>
                </div>
              </div>

              {/* AGE */}
              <div className="text-sm text-[#475569] font-medium">
                {patient?.age || "--"} <span className="text-[#94A3B8]">/</span>{" "}
                <span className="uppercase">{patient?.gender}</span>
              </div>

              {/* CONTACT */}
              <div className="text-sm text-[#475569] truncate">
                {patient?.phone || patient?.email || "N/A"}
              </div>

              {/* PLAN */}
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

    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">

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
            ? "bg-[#F59E0B] w-[60%]"

            : "bg-[#EF4444] w-[25%]"
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

              {/* UPDATED */}
              <div className="text-sm text-[#475569] font-medium">
                {patient?.updatedAt
                  ? new Date(patient.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently"}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <Inbox className="w-8 h-8 text-[#94A3B8]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-2">No Patients Found</h3>
            <p className="text-sm text-[#64748B] max-w-sm mx-auto leading-relaxed">
              No patients match your current filters. Try adjusting your search criteria or clear the filters.
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
          </div>
        </div>

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
            <span className="text-[#0F172A] font-semibold">{filteredPatients.length}</span>{" "}
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

            {totalPages > 5 && <span className="text-[#94A3B8] text-sm px-1">...</span>}

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

      {/* PRESCRIPTIONS */}
      <div className="group relative bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="relative">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2563EB]" />
                Prescriptions
              </h2>
              <p className="text-[#64748B] text-sm mt-1">
                Connected with API: /prescriptions
              </p>
            </div>

            {/* <button className="h-11 px-5 rounded-xl bg-[#2563EB] text-white font-semibold shadow-lg shadow-[#2563EB]/20 hover:bg-[#1D4ED8] hover:shadow-xl hover:shadow-[#2563EB]/30 transition-all duration-300 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Prescription
            </button> */}
          </div>

          {/* LIST */}
          <div className="divide-y divide-slate-100">
            {filteredPrescriptions.length > 0 ? (
              filteredPrescriptions.map((prescription, index) => {
                const pat = resolvePatient(prescription, patients);
                const patientName = getPatientDisplayName(pat);
                const patientIdentifier = getPatientIdentifier(pat);

                return (
                  <div
                    key={prescription?._id || index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 hover:bg-[#F8FAFC]/80 transition-all duration-200 group/prescription cursor-pointer gap-4"
                  >
                    {/* LEFT */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0 group-hover/prescription:scale-105 transition-transform duration-200">
                        <FileText className="w-5 h-5 text-[#2563EB]" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[#0F172A] text-sm truncate">
                            {prescription?.title || "Prescription"}
                          </h3>
                        </div>

                        {/* PATIENT ATTRIBUTION */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B] mt-1.5">
                          <span className="flex items-center gap-1.5 font-medium text-slate-800">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            {patientName}
                          </span>

                          {patientIdentifier && (
                            <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded-md font-mono text-slate-600">
                              {patientIdentifier}
                            </span>
                          )}

                          <span className="text-slate-400">
                            • {prescription?.createdAt
                              ? new Date(prescription.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Recently"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          if (prescription?.fileUrl) {
                            window.open(prescription.fileUrl, "_blank", "noopener,noreferrer");
                          } else {
                            alert("Prescription file not available.");
                          }
                        }}
                        className="h-9 px-3 rounded-xl border border-slate-200 flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:bg-[#F8FAFC] hover:border-slate-300 transition-all duration-200"
                        title="View Prescription"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-[#94A3B8]" />
                </div>
                <h3 className="font-semibold text-lg text-[#0F172A]">No Prescriptions</h3>
                <p className="text-[#64748B] text-sm mt-2">
                  {selectedPatient
                    ? "No prescriptions found for the selected patient."
                    : "No prescriptions found."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
