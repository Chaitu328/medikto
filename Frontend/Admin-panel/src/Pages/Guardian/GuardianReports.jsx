import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Eye,
  X,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  Download,
  Info,
} from "lucide-react";
import { useGuardianPatient } from "./GuardianPatientContext";
import api from "../../Api/axios";

export default function GuardianReports() {
  const { selectedPatientId, selectedPatient } = useGuardianPatient();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [previewReport, setPreviewReport] = useState(null);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    if (!selectedPatientId) {
      setReports([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/reports?patientId=${selectedPatientId}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setReports(list);
    } catch (err) {
      console.error("[GuardianReports] Error fetching reports:", err);
      setError("Failed to load medical reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedPatientId]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch =
        (r.title || "").toLowerCase().includes(q) ||
        (r.condition || "").toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q);

      const matchesType =
        selectedType === "all" ||
        (r.type || "").toLowerCase() === selectedType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [reports, search, selectedType]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(["all"]);
    reports.forEach((r) => {
      if (r.type) types.add(r.type.toLowerCase());
    });
    return Array.from(types);
  }, [reports]);

  const patientName = selectedPatient
    ? `${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`.trim() || selectedPatient.name || "Patient"
    : "Patient";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER BANNER */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Medical Reports & Labs</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {patientName}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Access, view, and inspect clinical lab documents, blood tests, and diagnostic summaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck size={14} />
            Read-Only Guardian Access
          </span>
          <button
            onClick={fetchReports}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Refresh Reports"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search report by title or condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {uniqueTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`
                px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap
                ${
                  selectedType === t
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              `}
            >
              {t === "all" ? "All Categories" : t}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* REPORTS GRID */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto border border-gray-200/80 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Reports Found</h3>
          <p className="text-sm text-gray-500">
            {search || selectedType !== "all"
              ? "No reports match your current filter criteria."
              : "No diagnostic or lab records have been uploaded for this patient."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => {
            const dateStr = report.date || report.createdAt;
            const formattedDate = dateStr
              ? new Date(dateStr).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "—";

            return (
              <div
                key={report._id}
                className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">
                          {report.title}
                        </h3>
                        <span className="text-[11px] font-semibold text-blue-600 uppercase">
                          {report.type || "Medical Report"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {report.condition && (
                    <div className="mb-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        Condition: {report.condition}
                      </span>
                    </div>
                  )}

                  {report.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {report.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={13} />
                    {formattedDate}
                  </span>

                  {report.fileUrl && (
                    <button
                      onClick={() => setPreviewReport(report)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
                    >
                      <Eye size={13} />
                      <span>View File</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewReport && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewReport(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{previewReport.title}</h3>
                <p className="text-xs text-gray-500 capitalize">{previewReport.type || "Medical"} Document</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewReport.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink size={18} />
                </a>
                <button
                  onClick={() => setPreviewReport(null)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* MODAL BODY */}
            <div className="p-4 flex-1 overflow-auto bg-gray-50 flex items-center justify-center min-h-[400px]">
              {previewReport.fileUrl.endsWith(".pdf") || previewReport.fileUrl.includes(".pdf") ? (
                <iframe
                  src={previewReport.fileUrl}
                  title={previewReport.title}
                  className="w-full h-[600px] rounded-xl border border-gray-200"
                />
              ) : (
                <img
                  src={previewReport.fileUrl}
                  alt={previewReport.title}
                  className="max-h-[600px] object-contain rounded-xl shadow"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
