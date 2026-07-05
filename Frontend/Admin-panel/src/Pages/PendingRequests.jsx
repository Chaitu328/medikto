import React, { useState, useEffect, useCallback } from "react";
import api from "../Api/axios.js";
import {
  Search,
  ChevronDown,
  Check,
  X,
  Eye,
  Loader2,
  User,
  Phone,
  Calendar,
  Building2,
  Droplets,
  HeartPulse,
  AlertCircle,
  ArrowLeft,
  Clock,
  Inbox,
} from "lucide-react";

// ═════════════════════════════════════════════════════════════════════════════
// UTILITY
// ═════════════════════════════════════════════════════════════════════════════
const formatDate = (isoString) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ═════════════════════════════════════════════════════════════════════════════
// TOAST
// ═════════════════════════════════════════════════════════════════════════════
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800";
  const icon = type === "success" ? <Check size={16} className="text-emerald-500" /> : <X size={16} className="text-red-500" />;

  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl border shadow-lg shadow-slate-200/50 animate-in slide-in-from-right fade-in duration-300 ${bg}`}>
      {icon}
      <span className="text-sm font-semibold">{message}</span>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SKELETON CARD
// ═════════════════════════════════════════════════════════════════════════════
const SkeletonCard = () => (
  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm animate-pulse">
    <div className="flex items-start gap-5">
      <div className="w-16 h-16 rounded-2xl bg-slate-200 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="w-40 h-5 rounded-lg bg-slate-200" />
        <div className="w-56 h-4 rounded-lg bg-slate-200" />
        <div className="w-32 h-4 rounded-lg bg-slate-200" />
      </div>
      <div className="flex gap-2">
        <div className="w-24 h-9 rounded-xl bg-slate-200" />
        <div className="w-24 h-9 rounded-xl bg-slate-200" />
        <div className="w-24 h-9 rounded-xl bg-slate-200" />
      </div>
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// CONFIRMATION MODAL
// ═════════════════════════════════════════════════════════════════════════════
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor, icon: Icon, loading }) => {
  if (!isOpen) return null;

  const colorMap = {
    blue: "bg-[#2563EB] hover:bg-blue-700",
    red: "bg-red-500 hover:bg-red-600",
    emerald: "bg-emerald-500 hover:bg-emerald-600",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-5">
          <Icon size={26} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 text-center">{title}</h3>
        <p className="text-sm text-slate-500 text-center mt-3 leading-relaxed">{message}</p>
        <div className="flex items-center justify-center gap-3 mt-7">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 ${colorMap[confirmColor] || colorMap.blue}`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// VIEW DETAILS MODAL
// ═════════════════════════════════════════════════════════════════════════════
const ViewModal = ({ isOpen, onClose, invitation, onAccept, onReject, acceptLoading, rejectLoading }) => {
  if (!isOpen || !invitation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Invitation Details</h3>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <X size={16} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Patient Card */}
        <div className="px-8 pb-6">
          <div className="flex items-center gap-5 p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200">
            <img
              src={invitation.patientId?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(invitation.patientId?.firstName || "P")}&background=2563EB&color=fff&size=128`}
              alt={invitation.patientId?.firstName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm flex-shrink-0"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(invitation.patientId?.name || "P")}&background=2563EB&color=fff`;
              }}
            />
            <div className="min-w-0">
              <h4 className="text-lg font-bold text-slate-900 truncate">{invitation.patientId?.firstName || "Unknown Patient"}</h4>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                  <Clock size={10} /> Pending
                </span>
                <span className="text-xs text-slate-500 font-medium">{formatDate(invitation.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-2 gap-4">
            <DetailItem icon={User} label="Age" value={`${invitation.patientId?.age || "—"} years`} />
            <DetailItem icon={HeartPulse} label="Gender" value={invitation.patientId?.gender || "—"} />
            <DetailItem icon={Droplets} label="Blood Group" value={invitation.patientId?.bloodGroup || "—"} />
            <DetailItem icon={Phone} label="Phone" value={invitation.patientId?.phone || "—"} />
            <DetailItem icon={HeartPulse} label="Relation" value={invitation.relation || "—"} />
            <DetailItem icon={Building2} label="Hospital" value={invitation.hospital?.name || invitation.hospital || "—"} />
            <DetailItem icon={Calendar} label="Invitation Date" value={formatDate(invitation.createdAt)} />
            <DetailItem icon={User} label="Email" value={invitation.email || "—"} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-7">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => { onClose(); onReject(invitation); }}
              disabled={rejectLoading}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-red-600 bg-white border-2 border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {rejectLoading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              Reject
            </button>
            <button
              onClick={() => { onClose(); onAccept(invitation); }}
              disabled={acceptLoading}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-[#2563EB] hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {acceptLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100">
    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
      <Icon size={14} className="text-slate-400" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{value}</p>
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═════════════════════════════════════════════════════════════════════════════
const EmptyState = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center py-24 px-4">
    <div className="w-24 h-24 rounded-[24px] bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
      <Inbox size={40} className="text-slate-300" />
    </div>
    <h3 className="text-xl font-bold text-slate-900">No Pending Requests</h3>
    <p className="text-sm text-slate-500 mt-2 text-center max-w-sm leading-relaxed">
      You don&apos;t have any pending invitations. New requests will appear here when a hospital sends you an invitation.
    </p>
    <button
      onClick={onNavigate}
      className="mt-7 flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/10"
    >
      <ArrowLeft size={16} /> Go to Dashboard
    </button>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// REQUEST CARD
// ═════════════════════════════════════════════════════════════════════════════
const RequestCard = ({ invitation, onAccept, onReject, onView, acceptLoading, rejectLoading, removing }) => {
  const patient = invitation.patientId || {};

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:shadow-slate-200/40 hover:-translate-y-0.5 transition-all duration-300 ${
        removing ? "opacity-0 scale-95 translate-x-8" : "opacity-100 scale-100 translate-x-0"
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
        {/* Left: Patient Info */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <img
            src={patient.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.firstName || "P")}&background=2563EB&color=fff&size=128`}
            alt={patient.firstName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm flex-shrink-0"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name || "P")}&background=2563EB&color=fff`;
            }}
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-bold text-slate-900 truncate">{patient.firstName || "Unknown Patient"}</h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              <span className="text-sm text-slate-500 font-medium">{patient.age ? `${patient.age} years` : "—"}</span>
              <span className="text-sm text-slate-400">•</span>
              <span className="text-sm text-slate-500 font-medium capitalize">{patient.gender || "—"}</span>
              <span className="text-sm text-slate-400">•</span>
              <span className="inline-flex items-center gap-1 text-sm text-slate-500 font-medium">
                <Droplets size={12} className="text-red-400" />
                {patient.bloodGroup || "—"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
              <span className="inline-flex items-center gap-1 text-sm text-slate-500 font-medium">
                <Phone size={12} className="text-slate-400" />
                {patient.phone || "—"}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-slate-500 font-medium">
                <HeartPulse size={12} className="text-slate-400" />
                {invitation.relation || "—"}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-slate-500 font-medium">
                <Building2 size={12} className="text-slate-400" />
                {invitation.hospital?.name || invitation.hospital || "—"}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-slate-500 font-medium">
                <Calendar size={12} className="text-slate-400" />
                {formatDate(invitation.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Status */}
        <div className="flex items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} />
            Pending
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onView(invitation)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.97]"
          >
            <Eye size={14} />
            View
          </button>
          <button
            onClick={() => onAccept(invitation)}
            disabled={acceptLoading === invitation._id}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#2563EB] hover:bg-blue-700 transition-all active:scale-[0.97] disabled:opacity-60 shadow-sm shadow-blue-500/15"
          >
            {acceptLoading === invitation._id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Accept
          </button>
          <button
            onClick={() => onReject(invitation)}
            disabled={rejectLoading === invitation._id}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-white border-2 border-red-200 hover:bg-red-50 transition-all active:scale-[0.97] disabled:opacity-60"
          >
            {rejectLoading === invitation._id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const PendingRequests = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortFilter, setSortFilter] = useState("all");
  const [acceptLoading, setAcceptLoading] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(null);
  const [removingIds, setRemovingIds] = useState(new Set());
  const [toast, setToast] = useState(null);

  // Modals
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, invitation: null });
  const [viewModal, setViewModal] = useState({ open: false, invitation: null });

  // Fetch invitations
  const fetchInvitations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/guardian/invitations");
      const data = Array.isArray(res.data) ? res.data : res.data?.invitations || [];
      setInvitations(data);
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
      setToast({ message: err.response?.data?.message || "Failed to load invitations", type: "error" });
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // Filter & Sort
  const filteredInvitations = React.useMemo(() => {
    let result = [...invitations];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.patientId?.name?.toLowerCase().includes(q) ||
          inv.patientId?.phone?.includes(q) ||
          inv.hospital?.name?.toLowerCase().includes(q) ||
          inv.hospital?.toLowerCase().includes(q) ||
          inv.relation?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const aDate = new Date(a.createdAt || 0);
      const bDate = new Date(b.createdAt || 0);
      if (sortFilter === "oldest") return aDate - bDate;
      if (sortFilter === "newest") return bDate - aDate;
      return bDate - aDate;
    });

    return result;
  }, [invitations, searchQuery, sortFilter]);

  // Accept
  const handleAcceptClick = (invitation) => {
    setConfirmModal({ open: true, type: "accept", invitation });
  };

  const handleConfirmAccept = async () => {
    const invitation = confirmModal.invitation;
    if (!invitation) return;

    setAcceptLoading(invitation._id);
    setConfirmModal({ open: false, type: null, invitation: null });

    try {
      await api.post(`/guardian/invitations/${invitation._id}/accept`);
      setToast({ message: "Invitation accepted successfully.", type: "success" });

      // Animate removal
      setRemovingIds((prev) => new Set(prev).add(invitation._id));
      setTimeout(() => {
        setInvitations((prev) => prev.filter((inv) => inv._id !== invitation._id));
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(invitation._id);
          return next;
        });
      }, 400);
    } catch (err) {
      console.error("Failed to accept invitation:", err);
      setToast({ message: err.response?.data?.message || "Failed to accept invitation", type: "error" });
    } finally {
      setAcceptLoading(null);
    }
  };

  // Reject
  const handleRejectClick = (invitation) => {
    setConfirmModal({ open: true, type: "reject", invitation });
  };

  const handleConfirmReject = async () => {
    const invitation = confirmModal.invitation;
    if (!invitation) return;

    setRejectLoading(invitation._id);
    setConfirmModal({ open: false, type: null, invitation: null });

    try {
      await api.post(`/guardian/invitations/${invitation._id}/reject`);
      setToast({ message: "Invitation rejected successfully.", type: "error" });

      // Animate removal
      setRemovingIds((prev) => new Set(prev).add(invitation._id));
      setTimeout(() => {
        setInvitations((prev) => prev.filter((inv) => inv._id !== invitation._id));
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(invitation._id);
          return next;
        });
      }, 400);
    } catch (err) {
      console.error("Failed to reject invitation:", err);
      setToast({ message: err.response?.data?.message || "Failed to reject invitation", type: "error" });
    } finally {
      setRejectLoading(null);
    }
  };

  // View
  const handleView = (invitation) => {
    setViewModal({ open: true, invitation });
  };

  const pendingCount = invitations.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-6 lg:px-10 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Pending Requests</h1>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">
              Review and respond to patient care invitations sent by hospitals.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold">
              <Clock size={15} />
              Pending Invitations
              <span className="ml-1 w-6 h-6 rounded-lg bg-amber-200 flex items-center justify-center text-xs font-bold">
                {pendingCount}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SEARCH & FILTER */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-6 lg:px-10 pb-8">
        <div className="bg-white rounded-[20px] border border-slate-200 p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Filter */}
            <div className="relative min-w-[160px]">
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                className="w-full sm:w-44 px-4 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none bg-white cursor-pointer font-medium"
              >
                <option value="all">All</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CARDS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-6 lg:px-10 pb-10">
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredInvitations.length === 0 ? (
          <EmptyState onNavigate={() => window.location.href = "/dashboard"} />
        ) : (
          <div className="space-y-4">
            {filteredInvitations.map((invitation, index) => (
              <div
                key={invitation._id}
                style={{ animationDelay: `${index * 80}ms` }}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <RequestCard
                  invitation={invitation}
                  onAccept={handleAcceptClick}
                  onReject={handleRejectClick}
                  onView={handleView}
                  acceptLoading={acceptLoading}
                  rejectLoading={rejectLoading}
                  removing={removingIds.has(invitation._id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CONFIRMATION MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <ConfirmModal
        isOpen={confirmModal.open && confirmModal.type === "accept"}
        onClose={() => setConfirmModal({ open: false, type: null, invitation: null })}
        onConfirm={handleConfirmAccept}
        title="Accept Invitation?"
        message="You will become the official guardian for this patient and gain access to medications, reports, vitals, and prescriptions."
        confirmText="Accept"
        confirmColor="blue"
        icon={Check}
        loading={!!acceptLoading}
      />

      <ConfirmModal
        isOpen={confirmModal.open && confirmModal.type === "reject"}
        onClose={() => setConfirmModal({ open: false, type: null, invitation: null })}
        onConfirm={handleConfirmReject}
        title="Reject Invitation?"
        message="This action cannot be undone. The hospital will be notified that you have declined this invitation."
        confirmText="Reject"
        confirmColor="red"
        icon={AlertCircle}
        loading={!!rejectLoading}
      />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* VIEW MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <ViewModal
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, invitation: null })}
        invitation={viewModal.invitation}
        onAccept={handleAcceptClick}
        onReject={handleRejectClick}
        acceptLoading={!!acceptLoading}
        rejectLoading={!!rejectLoading}
      />
    </div>
  );
};

export default PendingRequests;