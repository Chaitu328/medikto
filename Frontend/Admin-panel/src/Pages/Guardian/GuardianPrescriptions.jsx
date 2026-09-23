import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Search,
  Calendar,
  Eye,
  X,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  Clock,
  Pill,
} from "lucide-react";
import { useGuardianPatient } from "./GuardianPatientContext";
import api from "../../Api/axios";

export default function GuardianPrescriptions() {
  const { selectedPatientId, selectedPatient } = useGuardianPatient();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [previewPrescription, setPreviewPrescription] = useState(null);
  const [error, setError] = useState("");

  const fetchPrescriptions = async () => {
    if (!selectedPatientId) {
      setPrescriptions([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/prescriptions?patientId=${selectedPatientId}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setPrescriptions(list);
    } catch (err) {
      console.error("[GuardianPrescriptions] Error fetching prescriptions:", err);
      setError("Failed to load patient prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [selectedPatientId]);

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((p) => {
      const q = search.toLowerCase();
      return (
        (p.medicineName || "").toLowerCase().includes(q) ||
        (p.dosageInstructions || "").toLowerCase().includes(q)
      );
    });
  }, [prescriptions, search]);

  const patientName = selectedPatient
    ? `${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`.trim() || selectedPatient.name || "Patient"
    : "Patient";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER BANNER */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Doctor Prescriptions</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {patientName}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Official doctor prescriptions, uploaded physical scripts, and dosage directives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck size={14} />
            Read-Only Guardian Access
          </span>
          <button
            onClick={fetchPrescriptions}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Refresh Prescriptions"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* SEARCH CONTROL */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by medicine name or dosage..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* PRESCRIPTIONS GRID */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto border border-gray-200/80 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Prescriptions Found</h3>
          <p className="text-sm text-gray-500">
            {search
              ? "No prescription matched your search query."
              : "No doctor prescriptions have been uploaded for this patient."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrescriptions.map((p) => {
            const dateStr = p.createdAt || p.date;
            const formattedDate = dateStr
              ? new Date(dateStr).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "—";

            return (
              <div
                key={p._id}
                className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Pill size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{p.medicineName}</h3>
                        <span className="text-xs text-gray-400">Prescription Record</span>
                      </div>
                    </div>
                  </div>

                  {p.dosageInstructions && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700 mb-3">
                      <p className="font-semibold text-gray-900 mb-1">Dosage Instructions:</p>
                      <p>{p.dosageInstructions}</p>
                    </div>
                  )}

                  {Array.isArray(p.reminders) && p.reminders.length > 0 && (
                    <div className="mb-3">
                      <span className="text-[11px] font-semibold uppercase text-gray-400 block mb-1.5">Daily Dose Reminders</span>
                      <div className="flex flex-wrap gap-1.5">
                        {p.reminders.map((rem, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-800 text-xs font-semibold"
                          >
                            <Clock size={12} className="text-blue-600" />
                            {typeof rem === "object" ? rem.time || JSON.stringify(rem) : rem}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={13} />
                    Uploaded: {formattedDate}
                  </span>

                  {p.fileUrl && (
                    <button
                      onClick={() => setPreviewPrescription(p)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
                    >
                      <Eye size={13} />
                      <span>View Script</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewPrescription && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewPrescription(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{previewPrescription.medicineName}</h3>
                <p className="text-xs text-gray-500">Prescription Script Document</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewPrescription.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink size={18} />
                </a>
                <button
                  onClick={() => setPreviewPrescription(null)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* MODAL BODY */}
            <div className="p-4 flex-1 overflow-auto bg-gray-50 flex items-center justify-center min-h-[400px]">
              {previewPrescription.fileUrl.endsWith(".pdf") || previewPrescription.fileUrl.includes(".pdf") ? (
                <iframe
                  src={previewPrescription.fileUrl}
                  title={previewPrescription.medicineName}
                  className="w-full h-[600px] rounded-xl border border-gray-200"
                />
              ) : (
                <img
                  src={previewPrescription.fileUrl}
                  alt={previewPrescription.medicineName}
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
