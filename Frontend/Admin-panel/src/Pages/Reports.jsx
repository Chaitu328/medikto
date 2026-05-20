import { useEffect, useMemo, useState } from "react";

import {
  UploadCloud,
  Folder,
  ClipboardCheck,
  AlertCircle,
  Upload,
  Grid,
  List,
  Calendar,
  Heart,
  Droplets,
  Brain,
  FileText,
  Download,
  X,
  Search,
  Eye,
  Trash2,
  User,
  BadgeCheck,
  Stethoscope,
  TrendingUp,
  TrendingDown,
  Shield,
  Inbox,
  ChevronRight,
  Sparkles,
  FileBarChart,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import api from "../api/axios";

export default function ReportsPage() {
  // ================= STATES =================
  const [reports, setReports] = useState([]);

  const [selectedReport, setSelectedReport] = useState(null);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [viewMode, setViewMode] = useState("grid");

  const [uploading, setUploading] = useState(false);

  // ================= FETCH =================
  useEffect(() => {
    fetchReports();
  }, []);

  // ================= GET REPORTS =================
  const fetchReports = async () => {
    try {
      setLoading(true);

      const response = await api.get("/reports");

      const reportData = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.reports)
        ? response.data.reports
        : [];

      setReports(reportData);

      if (reportData.length > 0) {
        setSelectedReport(reportData[0]);
      }
    } catch (error) {
      console.log("REPORT FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================= UPLOAD =================
  const handleUpload = async (e) => {
    try {
      const file = e.target.files[0];

      if (!file) return;

      setUploading(true);

      const formData = new FormData();

      formData.append("file", file);

      formData.append("title", file.name);

      formData.append("description", "Uploaded report");

      formData.append("condition", "normal");

      formData.append("type", "medical");

      formData.append("date", new Date());

      await api.post("/reports", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      fetchReports();
    } catch (error) {
      console.log("UPLOAD ERROR:", error);
    } finally {
      setUploading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await api.delete(`/reports/${id}`);

      fetchReports();
    } catch (error) {
      console.log("DELETE ERROR:", error);
    }
  };

  // ================= FILTER =================
  const filteredReports = useMemo(() => {
    return reports.filter(
      (report) =>
        report?.title?.toLowerCase().includes(search.toLowerCase()) ||
        report?.condition?.toLowerCase().includes(search.toLowerCase()) ||
        report?.type?.toLowerCase().includes(search.toLowerCase())
    );
  }, [reports, search]);

  // ================= STATS =================
  const totalReports = reports.length;

  const pendingReports = reports.filter((r) => r?.condition === "pending").length;

  const criticalReports = reports.filter((r) => r?.condition === "critical").length;

  const uploadedToday = reports.filter((r) => {
    const today = new Date().toDateString();

    return new Date(r?.createdAt).toDateString() === today;
  }).length;

  // ================= ICON =================
  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "cardiac":
        return <Heart className="w-5 h-5" />;

      case "blood":
        return <Droplets className="w-5 h-5" />;

      case "brain":
        return <Brain className="w-5 h-5" />;

      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // ================= CONDITION COLOR =================
  const getConditionStyle = (condition) => {
    switch (condition?.toLowerCase()) {
      case "critical":
        return "bg-red-50 text-red-700 border border-red-200/60";

      case "normal":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";

      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200/60";

      default:
        return "bg-slate-100 text-[#64748B] border border-slate-200/60";
    }
  };

  const getConditionDot = (condition) => {
    switch (condition?.toLowerCase()) {
      case "critical":
        return "bg-[#EF4444]";
      case "normal":
        return "bg-[#10B981]";
      case "pending":
        return "bg-[#F59E0B]";
      default:
        return "bg-[#94A3B8]";
    }
  };

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

        {/* Search + Toggle Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-12 w-80 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-10 w-40 bg-slate-200 rounded-xl animate-pulse" />
        </div>

        {/* Main Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm h-64">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 animate-pulse" />
                  <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
                </div>
                <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-slate-200 rounded animate-pulse mb-4" />
                <div className="h-px bg-slate-100 my-5" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-11 bg-slate-200 rounded-xl animate-pulse" />
                  <div className="h-11 bg-slate-200 rounded-xl animate-pulse" />
                  <div className="h-11 bg-slate-200 rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm h-96">
            <div className="h-16 bg-slate-200 animate-pulse rounded-t-3xl" />
            <div className="p-6">
              <div className="h-64 bg-slate-200 rounded-2xl animate-pulse mb-6" />
              <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.04] via-transparent to-[#10B981]/[0.04]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563EB]/[0.06] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#10B981]/[0.06] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative px-6 sm:px-8 py-7 sm:py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
                <FileBarChart className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#64748B]">
                Medical Records
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
              Reports
            </h1>
            <p className="text-[#64748B] mt-2 text-base max-w-lg leading-relaxed">
              View and manage patient medical reports dynamically with real-time preview and analytics.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-sm font-medium text-emerald-700">
                System Active
              </span>
            </div> */}

            {/* <label className="h-11 px-6 rounded-2xl bg-[#2563EB] text-white font-semibold shadow-lg shadow-[#2563EB]/20 hover:bg-[#1D4ED8] hover:shadow-xl hover:shadow-[#2563EB]/30 transition-all duration-300 flex items-center gap-2 cursor-pointer">
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
              {uploading ? "Uploading..." : "Upload Report"}
              <input type="file" hidden onChange={handleUpload} />
            </label> */}
          </div>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {/* TOTAL */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#2563EB]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Folder className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5" />
                All
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] mb-2">
              Total Reports
            </p>
            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">{totalReports}</h2>
          </div>
        </div>

        {/* PENDING */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#F59E0B]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ClipboardCheck className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div className="flex items-center gap-1 text-amber-600 text-sm font-semibold bg-amber-50 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5" />
                Review
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] mb-2">
              Pending
            </p>
            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">{pendingReports}</h2>
          </div>
        </div>

        {/* CRITICAL */}
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
              Critical
            </p>
            <h2 className="text-4xl font-bold text-[#EF4444] tracking-tight">{criticalReports}</h2>
          </div>
        </div>

        {/* TODAY */}
        <div className="group relative bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-[#10B981]/[0.08] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-5 h-5 text-[#10B981]" />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5" />
                Today
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B] mb-2">
              Uploaded Today
            </p>
            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">{uploadedToday}</h2>
          </div>
        </div>
      </div>

      {/* SEARCH + TOGGLE */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        {/* SEARCH */}
        <div className="relative group w-full sm:w-[320px]">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#2563EB] transition-colors duration-200" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all duration-200"
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

        {/* TOGGLE */}
        <div className="inline-flex bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`h-10 px-5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all duration-200
            ${
              viewMode === "grid"
                ? "bg-white text-[#2563EB] shadow-sm"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Grid className="w-4 h-4" />
            Grid
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={`h-10 px-5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all duration-200
            ${
              viewMode === "list"
                ? "bg-white text-[#2563EB] shadow-sm"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <List className="w-4 h-4" />
            Table
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
        {/* REPORTS */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-1 gap-5"
              : "space-y-4"
          }
        >
          {filteredReports.length > 0 ? (
            filteredReports.map((report, index) => (
              <div
                key={report?._id || index}
                onClick={() => setSelectedReport(report)}
                className={`group relative bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden
                ${
                  selectedReport?._id === report?._id
                    ? "border-[#2563EB]/30 ring-1 ring-[#2563EB]/20"
                    : "border-slate-200/60"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative">
                  {/* TOP */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-105
                      ${
                        report?.type?.toLowerCase() === "cardiac"
                          ? "bg-red-50 text-red-600"
                          : report?.type?.toLowerCase() === "blood"
                          ? "bg-amber-50 text-amber-600"
                          : report?.type?.toLowerCase() === "brain"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-[#2563EB]/10 text-[#2563EB]"
                      }`}
                    >
                      {getIcon(report?.type)}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all duration-200 group-hover:scale-105 ${getConditionStyle(
                        report?.condition
                      )}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${getConditionDot(report?.condition)}`} />
                      {report?.condition}
                    </span>
                  </div>

                  {/* BODY */}
                  <h3 className="text-lg font-bold text-[#0F172A] truncate">
                    {report?.title}
                  </h3>

                  <p className="text-[#64748B] text-sm mt-2 line-clamp-2 leading-relaxed">
                    {report?.description}
                  </p>

                  <div className="h-px bg-slate-100 my-5" />

                  {/* INFO */}
                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <User className="w-4 h-4 text-[#94A3B8]" />
<span className="truncate">
  Patient:
  {" "}
  {report?.user?.firstName ||
    report?.user?.phone ||
    "Unknown"}
</span>                    </div>

                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <Calendar className="w-4 h-4 text-[#94A3B8]" />
                      <span>
                        {report?.date
                          ? new Date(report.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recently"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <BadgeCheck className="w-4 h-4 text-[#94A3B8]" />
                      <span className="capitalize">{report?.type}</span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href={report?.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="h-10 rounded-xl bg-[#F8FAFC] border border-slate-200 text-sm font-semibold text-[#475569] hover:bg-white hover:border-slate-300 hover:text-[#0F172A] hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </a>

                    <a
                      href={report?.fileUrl}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="h-10 rounded-xl bg-[#F8FAFC] border border-slate-200 text-sm font-semibold text-[#475569] hover:bg-white hover:border-slate-300 hover:text-[#0F172A] hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(report?._id);
                      }}
                      className="h-10 rounded-xl bg-red-50 border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-100 hover:border-red-300 hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-100 border-dashed">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-7 h-7 text-[#94A3B8]" />
              </div>
              <h3 className="font-semibold text-lg text-[#0F172A]">No Reports Found</h3>
              <p className="text-[#64748B] text-sm mt-2">Try adjusting your search criteria</p>
            </div>
          )}
        </div>

        {/* PREVIEW PANEL */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-lg sticky top-6 h-fit">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-6 py-5 flex items-center justify-between text-white">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Report Preview
            </h3>

            <button
              onClick={() => setSelectedReport(null)}
              className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CONTENT */}
          <div className="p-6">
            {selectedReport ? (
              <>
                <div className="relative rounded-2xl border border-slate-200 overflow-hidden mb-6 bg-[#F8FAFC]">
                  <iframe
                    src={selectedReport?.fileUrl}
                    title="Report Preview"
                    className="w-full h-[380px]"
                  />
                </div>

                <h2 className="text-xl font-bold text-[#0F172A] truncate">
                  {selectedReport?.title}
                </h2>

                <p className="text-[#64748B] text-sm mt-2 leading-relaxed">
                  {selectedReport?.description}
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                    <span className="text-[#64748B] font-medium">Condition</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getConditionStyle(
                        selectedReport?.condition
                      )}`}
                    >
                      {selectedReport?.condition}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                    <span className="text-[#64748B] font-medium">Type</span>
                    <span className="text-[#0F172A] font-semibold capitalize">
                      {selectedReport?.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                    <span className="text-[#64748B] font-medium">Date</span>
                    <span className="text-[#0F172A] font-semibold">
                      {selectedReport?.date
                        ? new Date(selectedReport.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Recently"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm py-2">
                    <span className="text-[#64748B] font-medium">User ID</span>
                   <span className="text-[#0F172A] font-semibold text-xs bg-slate-100 px-2 py-1 rounded-lg">
  {selectedReport?.user
    ?.firstName ||
    selectedReport?.user
      ?.phone ||
    "Unknown"}
</span>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="grid grid-cols-2 gap-3 mt-8">
                  <a
                    href={selectedReport?.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 rounded-xl bg-[#F8FAFC] border border-slate-200 text-sm font-semibold text-[#475569] hover:bg-white hover:border-slate-300 hover:text-[#0F172A] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View File
                  </a>

                  <button className="h-11 rounded-xl bg-[#2563EB] text-white text-sm font-semibold shadow-lg shadow-[#2563EB]/20 hover:bg-[#1D4ED8] hover:shadow-xl hover:shadow-[#2563EB]/30 transition-all duration-200 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              </>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-[#94A3B8]">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-[#64748B]">No report selected</p>
                <p className="text-xs text-[#94A3B8] mt-1">Click on a report to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
