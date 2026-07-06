import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "../Api/axios.js";
import {
  Search,
  RefreshCcw,
  Plus,
  Users,
  UserPlus,
  ShieldCheck,
  HeartHandshake,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Mail,
  Phone,
  Calendar,
  User,
  Bell,
  Send,
  Filter,
  ArrowUpDown,
  Loader2,
  Hash,
  X,
  Lock,
  Building,
} from "lucide-react";

// ═════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════
const formatDate = (isoString) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatDateTime = (isoString) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return `${formatDate(isoString)} at ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
};

// ═════════════════════════════════════════════════════════════════════════════
// SKELETON COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════
const SkeletonCard = () => (
  <div className="bg-white rounded-[20px] border border-slate-200 p-6 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="w-11 h-11 rounded-xl bg-slate-200" />
      <div className="w-16 h-6 rounded-full bg-slate-200" />
    </div>
    <div className="mt-4 w-20 h-8 rounded bg-slate-200" />
    <div className="mt-2 w-32 h-4 rounded bg-slate-200" />
  </div>
);

const SkeletonTableRow = () => (
  <tr className="border-b border-slate-50">
    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse" /><div className="space-y-1.5"><div className="w-28 h-4 rounded bg-slate-200 animate-pulse" /><div className="w-16 h-3 rounded bg-slate-200 animate-pulse" /></div></div></td>
    <td className="px-6 py-4"><div className="w-20 h-5 rounded-full bg-slate-200 animate-pulse" /></td>
    <td className="px-6 py-4"><div className="w-28 h-4 rounded bg-slate-200 animate-pulse" /></td>
    <td className="px-6 py-4"><div className="w-32 h-4 rounded bg-slate-200 animate-pulse" /></td>
    <td className="px-6 py-4"><div className="w-24 h-4 rounded bg-slate-200 animate-pulse" /></td>
    <td className="px-6 py-4"><div className="w-16 h-6 rounded-full bg-slate-200 animate-pulse" /></td>
    <td className="px-6 py-4"><div className="w-24 h-4 rounded bg-slate-200 animate-pulse" /></td>
  </tr>
);

const SkeletonDrawer = () => (
  <div className="space-y-6">
    <div className="w-full h-36 rounded-[16px] bg-slate-200 animate-pulse" />
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="space-y-2">
        <div className="w-24 h-3 rounded bg-slate-200 animate-pulse" />
        <div className="w-full h-4 rounded bg-slate-200 animate-pulse" />
      </div>
    ))}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// ACCOUNT STATUS BADGE
// ═════════════════════════════════════════════════════════════════════════════
const AccountStatusBadge = ({ status }) => {
  const configs = {
    "Pending Password Change": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Lock, iconColor: "text-amber-500" },
    "Pending Invitation": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Clock, iconColor: "text-blue-500" },
    "Active": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2, iconColor: "text-emerald-500" },
    "Rejected": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle, iconColor: "text-red-500" },
    "Disabled": { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", icon: ShieldCheck, iconColor: "text-slate-400" },
  };
  const config = configs[status] || configs["Pending Invitation"];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <Icon size={10} className={config.iconColor} />
      {status}
    </span>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// STATUS BADGE
// ═════════════════════════════════════════════════════════════════════════════
const StatusBadge = ({ status, size = "md" }) => {
  const configs = {
    pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock, iconColor: "text-amber-500" },
    accepted: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2, iconColor: "text-emerald-500" },
    rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle, iconColor: "text-red-500" },
  };
  const config = configs[status] || configs.pending;
  const Icon = config.icon;
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-full font-medium border ${config.bg} ${config.text} ${config.border} capitalize`}>
      <Icon size={size === "sm" ? 10 : 12} className={config.iconColor} />
      {status}
    </span>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// RELATION BADGE
// ═════════════════════════════════════════════════════════════════════════════
const RelationBadge = ({ relation }) => {
  const colors = {
    Father: "bg-blue-50 text-blue-700 border-blue-200",
    Mother: "bg-pink-50 text-pink-700 border-pink-200",
    Brother: "bg-sky-50 text-sky-700 border-sky-200",
    Sister: "bg-rose-50 text-rose-700 border-rose-200",
    Friend: "bg-violet-50 text-violet-700 border-violet-200",
    Doctor: "bg-teal-50 text-teal-700 border-teal-200",
    Guardian: "bg-amber-50 text-amber-700 border-amber-200",
    Other: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${colors[relation] || colors.Other}`}>
      {relation}
    </span>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SUMMARY CARD
// ═════════════════════════════════════════════════════════════════════════════
const SummaryCard = ({ icon: Icon, label, value, subValue, color, delay }) => {
  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-[#2563EB]" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    red: { bg: "bg-red-50", text: "text-red-600" },
    violet: { bg: "bg-violet-50", text: "text-violet-600" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className="bg-white rounded-[20px] border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/40 hover:-translate-y-0.5 transition-all duration-300 cursor-default"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl ${c.bg} ${c.text} flex items-center justify-center`}>
          <Icon size={20} strokeWidth={2} />
        </div>
        {subValue && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
            {subValue}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ACTION MENU
// ═════════════════════════════════════════════════════════════════════════════
const ActionMenu = ({ caretaker, onView, onEdit, onDelete, onResend }) => {
  const [open, setOpen] = useState(false);
  const menuRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 py-1.5 z-50">
          <button onClick={() => { onView(caretaker); setOpen(false); }} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
            <Eye size={14} className="text-slate-400" /> View Details
          </button>
          <button onClick={() => { onEdit(caretaker); setOpen(false); }} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
            <Pencil size={14} className="text-slate-400" /> Edit Guardian
          </button>
          {caretaker.status === "pending" && (
            <button onClick={() => { onResend(caretaker); setOpen(false); }} className="w-full px-4 py-2 text-sm text-[#2563EB] hover:bg-blue-50 flex items-center gap-2.5 transition-colors">
              <Send size={14} /> Resend Credentials
            </button>
          )}
          <div className="mx-3 my-1 h-px bg-slate-100" />
          <button onClick={() => { onDelete(caretaker); setOpen(false); }} className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
            <Trash2 size={14} /> Remove Guardian
          </button>
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// RIGHT DRAWER
// ═════════════════════════════════════════════════════════════════════════════
const CaretakerDrawer = ({ caretaker, onClose, onEdit, onDelete, onResend, onApprove, loading }) => {
  if (!caretaker) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[440px] bg-white z-50 shadow-2xl shadow-slate-900/10 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Guardian Details</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <SkeletonDrawer />
          ) : (
            <div className="space-y-6">
              {/* Caretaker Header Card */}
              <div className="bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] rounded-[16px] p-5 text-white">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={caretaker.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(caretaker.name)}&background=2563EB&color=fff&size=128`}
                      alt={caretaker.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white/30"
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(caretaker.name)}&background=2563EB&color=fff`; }}
                    />
                    {caretaker.isGuardian && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
                        <ShieldCheck size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-base truncate">{caretaker.name}</h4>
                    <p className="text-blue-100 text-sm mt-0.5">{caretaker.email}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <StatusBadge status={caretaker.status} />
                  {caretaker.isGuardian && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-medium">
                      <ShieldCheck size={10} /> Guardian
                    </span>
                  )}
                </div>
              </div>

              {/* Guardian Info */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Guardian Information</h4>
                <div className="space-y-4">
                  <DrawerInfo icon={User} label="Full Name" value={caretaker.name} />
                  <DrawerInfo icon={Mail} label="Email Address" value={caretaker.email} />
                  <DrawerInfo icon={Phone} label="Phone Number" value={caretaker.phone} />
                  <DrawerInfo icon={HeartHandshake} label="Relation" value={caretaker.relation} />
                  <DrawerInfo icon={Calendar} label="Created Date" value={formatDateTime(caretaker.createdAt)} />
                </div>
              </div>

              {/* Guardian Account */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Guardian Account</h4>
                <div className="space-y-4">
                  <DrawerInfo icon={ShieldCheck} label="Invitation Status" value={caretaker.status} />
                  <DrawerInfo icon={Lock} label="Account Status" value={caretaker.accountStatus || "Pending Invitation"} />
                  <DrawerInfo icon={User} label="Patient Name" value={caretaker.patientName || "—"} />
                  <DrawerInfo icon={User} label="Created By" value={caretaker.createdBy || "—"} />
                  <DrawerInfo icon={Building} label="Hospital" value={caretaker.hospital || "—"} />
                  <DrawerInfo icon={CheckCircle2} label="Temporary Password Sent" value={caretaker.tempPasswordSent ? "Yes" : "No"} />
                  <DrawerInfo icon={CheckCircle2} label="Password Changed" value={caretaker.passwordChanged ? "Yes" : "No"} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 border-t border-slate-100 space-y-3">
          {caretaker.accountStatus === "pending" && (
            <button
              onClick={() => { onApprove(caretaker.id, "active"); onClose(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle2 size={16} /> Approve Guardian
            </button>
          )}
          <button
            onClick={() => { onEdit(caretaker); onClose(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Pencil size={16} /> Edit Guardian
          </button>
          {caretaker.status === "pending" && (
            <button
              onClick={() => { onResend(caretaker); onClose(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#2563EB] border border-blue-200 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              <Send size={16} /> Resend Credentials
            </button>
          )}
          <button
            onClick={() => { onDelete(caretaker); onClose(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} /> Remove Guardian
          </button>
        </div>
      </div>
    </>
  );
};

const DrawerInfo = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={14} className="text-slate-400" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-slate-800 mt-0.5 leading-relaxed">{value}</p>
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// INVITE MODAL
// ═════════════════════════════════════════════════════════════════════════════
const InviteModal = ({
  isOpen,
  onClose,
  onSave,
  loading,
  patients,
  selectedPatient,
  setSelectedPatient,
  hospitals,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    relation: "Father",
    hospital: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave(formData);

    setFormData({
      name: "",
      email: "",
      phone: "",
      relation: "Father",
      hospital: "",
    });

    setSelectedPatient("");
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[20px] shadow-2xl shadow-slate-900/10 z-50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Create Guardian</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Guardian Details</h4>
            <FormField label="Patient" required>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                required
              >
                <option value="">Select Patient</option>

                {(patients || []).map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Full Name" required>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" placeholder="Enter guardian name" required />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Email" required>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" placeholder="email@example.com" required />
              </FormField>
              <FormField label="Phone" required>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" placeholder="+1 (555) 000-0000" required />
              </FormField>
            </div>
            <FormField label="Relation" required>
              <select value={formData.relation} onChange={(e) => setFormData({ ...formData, relation: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white">
                {["Father", "Mother", "Brother", "Sister", "Friend", "Doctor", "Guardian", "Other"].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Assigned Hospital" required>
              <select value={formData.hospital} onChange={(e) => setFormData({ ...formData, hospital: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white" required>
                <option value="">Select Hospital</option>
                {(hospitals || []).map((h) => (
                  <option key={h._id} value={h._id}>{h.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading && <Loader2 size={14} className="animate-spin" />}
              <Send size={14} /> Create Guardian
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// EDIT MODAL
// ═════════════════════════════════════════════════════════════════════════════
const EditModal = ({ isOpen, onClose, onSave, caretaker, loading }) => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", relation: "Father" });

  useEffect(() => {
    if (caretaker) {
      setFormData({
        name: caretaker.name,
        email: caretaker.email,
        phone: caretaker.phone,
        relation: caretaker.relation,
      });
    }
  }, [caretaker, isOpen]);

  if (!isOpen || !caretaker) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, id: caretaker.id });
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[20px] shadow-2xl shadow-slate-900/10 z-50">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Edit Guardian</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <FormField label="Full Name" required>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" required />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email" required>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" required />
            </FormField>
            <FormField label="Phone" required>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" required />
            </FormField>
          </div>
          <FormField label="Relation">
            <select value={formData.relation} onChange={(e) => setFormData({ ...formData, relation: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white">
              {["Father", "Mother", "Brother", "Sister", "Friend", "Doctor", "Guardian", "Other"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </FormField>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const FormField = ({ label, children, required }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// DELETE CONFIRMATION MODAL
// ═════════════════════════════════════════════════════════════════════════════
const DeleteModal = ({ isOpen, onClose, onConfirm, itemName, loading }) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[20px] shadow-2xl shadow-slate-900/10 z-50 p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Remove Guardian</h3>
        <p className="text-sm text-slate-500 mt-2">
          Are you sure you want to remove guardian <span className="font-medium text-slate-700">{itemName}</span>? This action cannot be undone.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Remove
          </button>
        </div>
      </div>
    </>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═════════════════════════════════════════════════════════════════════════════
const EmptyState = ({ onInvite }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="w-20 h-20 rounded-[20px] bg-slate-50 flex items-center justify-center mb-6">
      <Users size={36} className="text-slate-300" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900">No Guardians Found</h3>
    <p className="text-sm text-slate-500 mt-2 text-center max-w-sm">
      Create your first guardian to monitor patients and manage their healthcare needs.
    </p>
    <button
      onClick={onInvite}
      className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      <UserPlus size={16} /> Create Guardian
    </button>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const GuardiansManagement = () => {
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [accountStatusFilter, setAccountStatusFilter] = useState("all");
  const [relationFilter, setRelationFilter] = useState("all");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [createdByFilter, setCreatedByFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCaretaker, setSelectedCaretaker] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCaretaker, setEditingCaretaker] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCaretaker, setDeletingCaretaker] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState({});
  const [resetLoading, setResetLoading] = useState({});
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [hospitals, setHospitals] = useState([]);

  const ITEMS_PER_PAGE = 10;

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/guardians");

      const guardians = res.data.guardians || res.data || [];

      const data = guardians.map((item) => ({
        id: item._id,
        name: item.firstName || item.name || "Unnamed",
        email: item.email || "",
        phone: item.phone || "",
        relation: item.relation || "Other",
        isGuardian: item.relation === "Father" || item.relation === "Mother" || item.relation === "Guardian",
        status:
  item.accountStatus === "active"
    ? "accepted"
    : item.status || "pending",
        accountStatus: item.accountStatus || "Pending Invitation",

mustChangePassword: item.mustChangePassword,
isFirstLogin: item.isFirstLogin,

profilePic: item.profilePic || "",
createdAt: item.createdAt,
patientName: item.patientName || "",
createdBy: item.createdBy || "",
hospital: item.hospital || "",
tempPasswordSent: item.tempPasswordSent || false,
passwordChanged: item.passwordChanged || false,
      }));

      setCaretakers(data);
      console.log(data);
    } catch (err) {
      console.error("Failed to fetch guardians:", err);
      setCaretakers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

 
const fetchPatients = async () => {
  try {
    const res = await api.get("/users");

    // Only keep users having role = user
    const patients = (res.data.users || []).filter(
      (user) => user.role === "user"
    );

    setPatients(patients);
  } catch (err) {
    console.log(err);
  }
};

const fetchHospitals = async () => {
  try {
    const res = await api.get("/hospitals");
    setHospitals(res.data.hospitals || res.data || []);
  } catch (err) {
    console.error("Failed to fetch hospitals:", err);
  }
};

 useEffect(() => {
    fetchData();
    fetchPatients();
    fetchHospitals();
  }, []);

  // Unique relations for filter
  const uniqueRelations = useMemo(() => {
    const relations = new Set(caretakers.map((c) => c.relation));
    return Array.from(relations).sort();
  }, [caretakers]);

  const uniqueHospitals = useMemo(() => {
    const hospitals = new Set(caretakers.filter((c) => c.hospital).map((c) => c.hospital));
    return Array.from(hospitals).sort();
  }, [caretakers]);

  const uniqueCreatedBy = useMemo(() => {
    const creators = new Set(caretakers.filter((c) => c.createdBy).map((c) => c.createdBy));
    return Array.from(creators).sort();
  }, [caretakers]);

  // Filter & Sort
  const filteredCaretakers = useMemo(() => {
    let result = [...caretakers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.relation.toLowerCase().includes(q) ||
          (c.patientName && c.patientName.toLowerCase().includes(q)) ||
          (c.hospital && c.hospital.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (accountStatusFilter !== "all") {
      result = result.filter((c) => c.accountStatus === accountStatusFilter);
    }

    if (relationFilter !== "all") {
      result = result.filter((c) => c.relation === relationFilter);
    }

    if (hospitalFilter !== "all") {
      result = result.filter((c) => c.hospital === hospitalFilter);
    }

    if (createdByFilter !== "all") {
      result = result.filter((c) => c.createdBy === createdByFilter);
    }

    result.sort((a, b) => {
      let aVal, bVal;
      if (sortField === "createdAt") { aVal = new Date(a.createdAt); bVal = new Date(b.createdAt); }
      else if (sortField === "name") { aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase(); }
      else if (sortField === "relation") { aVal = a.relation; bVal = b.relation; }
      else if (sortField === "status") { aVal = a.status; bVal = b.status; }
      else { aVal = a[sortField]; bVal = b[sortField]; }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [caretakers, searchQuery, statusFilter, accountStatusFilter, relationFilter, hospitalFilter, createdByFilter, sortField, sortDir]);

  // Pagination
  const totalPages = Math.ceil(filteredCaretakers.length / ITEMS_PER_PAGE);
  const paginatedCaretakers = filteredCaretakers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, accountStatusFilter, relationFilter, hospitalFilter, createdByFilter, sortField, sortDir]);

  // Stats
  const stats = useMemo(() => {
    const total = caretakers.length;
const pendingPassword = caretakers.filter(
    (c) => c.mustChangePassword === true
  ).length;
      const pendingInvite = caretakers.filter((c) => c.status === "pending").length;
const active = caretakers.filter((c) => c.status === "accepted").length;
    const rejected = caretakers.filter((c) => c.status === "rejected").length;
    return { total, pendingPassword, pendingInvite, active, rejected };
  }, [caretakers]);

  // Handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const handleView = (caretaker) => {
    setDrawerLoading(true);
    setDrawerOpen(true);
    setSelectedCaretaker(caretaker);
    setDrawerLoading(false);
  };

  const handleInvite = async (formData) => {
    setInviteLoading(true);
    try {
      await api.post("/guardians/create", {
        patientId: selectedPatient,
        firstName: formData.name,
        email: formData.email,
        phone: formData.phone,
        relation: formData.relation,
        hospital: formData.hospital,
      });
      await fetchData();
      setInviteModalOpen(false);
    } catch (err) {
      console.error("Failed to create guardian:", err);
      alert(err.response?.data?.message || "Failed to create guardian. Please try again.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleEdit = (caretaker) => {
    setDrawerOpen(false);
    setEditingCaretaker(caretaker);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (formData) => {
    setEditLoading(true);
      setCaretakers((prev) =>
        prev.map((c) =>
          c.id === formData.id
            ? {
                ...c,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                relation: formData.relation,
                isGuardian: formData.relation === "Father" || formData.relation === "Mother" || formData.relation === "Guardian",
              }
            : c
        )
      );
      setEditLoading(false);
      setEditModalOpen(false);
      setEditingCaretaker(null);
      setEditLoading(false);
      setEditModalOpen(false);
      setEditingCaretaker(null);
  };

  const handleResendCredentials = async (caretaker) => {
    setResendLoading((prev) => ({ ...prev, [caretaker.id]: true }));
    try {
      await api.post(`/guardians/${caretaker.id}/resend`);
    } catch (err) {
      console.error("Failed to resend credentials:", err);
      alert(err.response?.data?.message || "Failed to resend credentials.");
    } finally {
      setResendLoading((prev) => ({ ...prev, [caretaker.id]: false }));
    }
  };

  // const handleResetPassword = async (caretaker) => {
  //   setResetLoading((prev) => ({ ...prev, [caretaker.id]: true }));
  //   try {
  //     await api.post(`/guardians/${caretaker.id}/reset-password`);
  //   } catch (err) {
  //     console.error("Failed to reset password:", err);
  //     alert(err.response?.data?.message || "Failed to reset password.");
  //   } finally {
  //     setResetLoading((prev) => ({ ...prev, [caretaker.id]: false }));
  //   }
  // };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/guardians/${id}/status`, { status });
      await fetchData();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleDeleteClick = (caretaker) => {
    setDrawerOpen(false);
    setDeletingCaretaker(caretaker);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/guardians/${deletingCaretaker.id}`);
      await fetchData();
      setDeleteModalOpen(false);
      setDeletingCaretaker(null);
    } catch (err) {
      console.error("Failed to delete guardian:", err);
      alert(err.response?.data?.message || "Failed to remove guardian. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-slate-300" />;
    return sortDir === "asc" ? <ChevronUp size={12} className="text-[#2563EB]" /> : <ChevronDown size={12} className="text-[#2563EB]" />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-6 lg:px-10 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Guardians</h1>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">
              Manage patient guardians and invitation requests.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => { setRefreshing(true); fetchData(); }}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCcw size={15} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => setInviteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
            >
              <UserPlus size={16} /> Create Guardian
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SUMMARY CARDS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-6 lg:px-10 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {loading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              <SummaryCard icon={Users} label="Total Guardians" value={stats.total} subValue={`${stats.active} active`} color="blue" delay={0} />
              <SummaryCard icon={Clock} label="Pending Password Changes" value={stats.pendingPassword} subValue={stats.pendingPassword > 0 ? "Action required" : "All caught up"} color="amber" delay={100} />
              <SummaryCard icon={CheckCircle2} label="Active Guardians" value={stats.active} subValue={`${Math.round((stats.active / (stats.total || 1)) * 100)}% rate`} color="emerald" delay={200} />
              <SummaryCard icon={Bell} label="Pending Invitations" value={stats.pendingInvite} subValue={stats.pendingInvite > 0 ? "Awaiting response" : "All caught up"} color="violet" delay={300} />
              <SummaryCard icon={XCircle} label="Rejected Invitations" value={stats.rejected} subValue={stats.rejected > 0 ? "Review needed" : "None rejected"} color="red" delay={400} />
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SEARCH & FILTER SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-6 lg:px-10 pb-6">
        <div className="bg-white rounded-[20px] border border-slate-200 p-5">
          <div className="flex flex-col xl:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone, patient, or hospital..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-44 pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none bg-white cursor-pointer font-medium"
                >
                  <option value="all">All Invitation Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <ShieldCheck size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={accountStatusFilter}
                  onChange={(e) => setAccountStatusFilter(e.target.value)}
                  className="w-full sm:w-44 pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none bg-white cursor-pointer font-medium"
                >
                  <option value="all">All Account Status</option>
                  <option value="Pending Password Change">Pending Password Change</option>
                  <option value="Pending Invitation">Pending Invitation</option>
                  <option value="Active">Active</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Disabled">Disabled</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <HeartHandshake size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={relationFilter}
                  onChange={(e) => setRelationFilter(e.target.value)}
                  className="w-full sm:w-40 pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none bg-white cursor-pointer font-medium"
                >
                  <option value="all">All Relations</option>
                  {uniqueRelations.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={hospitalFilter}
                  onChange={(e) => setHospitalFilter(e.target.value)}
                  className="w-full sm:w-44 pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none bg-white cursor-pointer font-medium"
                >
                  <option value="all">All Hospitals</option>
                  {uniqueHospitals.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={createdByFilter}
                  onChange={(e) => setCreatedByFilter(e.target.value)}
                  className="w-full sm:w-44 pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none bg-white cursor-pointer font-medium"
                >
                  <option value="all">All Created By</option>
                  {uniqueCreatedBy.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || statusFilter !== "all" || accountStatusFilter !== "all" || relationFilter !== "all" || hospitalFilter !== "all" || createdByFilter !== "all") && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-400">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                  Search: &quot;{searchQuery}&quot; <button onClick={() => setSearchQuery("")} className="hover:text-blue-900"><X size={10} /></button>
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium capitalize">
                  Invitation: {statusFilter} <button onClick={() => setStatusFilter("all")} className="hover:text-blue-900"><X size={10} /></button>
                </span>
              )}
              {accountStatusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                  Account: {accountStatusFilter} <button onClick={() => setAccountStatusFilter("all")} className="hover:text-blue-900"><X size={10} /></button>
                </span>
              )}
              {relationFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                  Relation: {relationFilter} <button onClick={() => setRelationFilter("all")} className="hover:text-blue-900"><X size={10} /></button>
                </span>
              )}
              {hospitalFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                  Hospital: {hospitalFilter} <button onClick={() => setHospitalFilter("all")} className="hover:text-blue-900"><X size={10} /></button>
                </span>
              )}
              {createdByFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                  Created By: {createdByFilter} <button onClick={() => setCreatedByFilter("all")} className="hover:text-blue-900"><X size={10} /></button>
                </span>
              )}
              <button
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); setAccountStatusFilter("all"); setRelationFilter("all"); setHospitalFilter("all"); setCreatedByFilter("all"); }}
                className="text-xs font-medium text-red-500 hover:text-red-600 ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MAIN TABLE */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-6 lg:px-10 pb-10">
        <div className="bg-white rounded-[20px] border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {["Guardian", "Relation", "Phone", "Created Date", "Invitation Status", "Account Status", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>{[1, 2, 3, 4, 5].map((i) => <SkeletonTableRow key={i} />)}</tbody>
              </table>
            </div>
          ) : filteredCaretakers.length === 0 ? (
            <EmptyState onInvite={() => setInviteModalOpen(true)} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
                      {[
                        { key: "name", label: "Guardian" },
                        { key: "relation", label: "Relation" },
                        { key: "phone", label: "Phone" },
                        { key: "createdAt", label: "Created Date" },
                        { key: "status", label: "Invitation Status" },
                        { key: "accountStatus", label: "Account Status" },
                        { key: null, label: "Actions" },
                      ].map((col) => (
                        <th
                          key={col.label}
                          onClick={() => col.key && handleSort(col.key)}
                          className={`px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${col.key ? "cursor-pointer hover:text-slate-700 select-none" : ""}`}
                        >
                          <div className="flex items-center gap-1.5">
                            {col.label}
                            {col.key && <SortIcon field={col.key} />}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCaretakers.map((caretaker) => {
                      const isResending = resendLoading[caretaker.id];

                      return (
                        <tr
                          key={caretaker.id}
                          className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group"
                        >
                          {/* Caretaker */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={caretaker.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(caretaker.name)}&background=2563EB&color=fff&size=128`}
                                  alt={caretaker.name}
                                  className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(caretaker.name)}&background=2563EB&color=fff`; }}
                                />
                                {caretaker.isGuardian && (
                                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
                                    <ShieldCheck size={8} className="text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{caretaker.name}</p>
                                {caretaker.isGuardian && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5">
                                    <ShieldCheck size={8} /> Guardian
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Relation */}
                          <td className="px-6 py-4">
                            <RelationBadge relation={caretaker.relation} />
                          </td>

                          {/* Phone */}
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600 font-medium">{caretaker.phone}</span>
                          </td>

                          {/* Invitation Date */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-600">{formatDate(caretaker.createdAt)}</div>
                          </td>

                          {/* Invitation Status */}
                          <td className="px-6 py-4">
                            <StatusBadge status={caretaker.status} />
                          </td>

                          {/* Account Status */}
                          <td className="px-6 py-4">
                            <AccountStatusBadge status={caretaker.accountStatus} />
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => handleView(caretaker)}
                                className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-[#2563EB] transition-colors"
                                title="View"
                              >
                                <Eye size={15} />
                              </button>
                              {caretaker.accountStatus === "pending" && (
                                <button
                                  onClick={() => handleUpdateStatus(caretaker.id, "active")}
                                  className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                                  title="Approve Guardian"
                                >
                                  <CheckCircle2 size={15} />
                                </button>
                              )}
                              {caretaker.status === "pending" && (
                                <button
                                  onClick={() => handleResendCredentials(caretaker)}
                                  disabled={resendLoading[caretaker.id]}
                                  className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-[#2563EB] transition-colors disabled:opacity-50"
                                  title="Resend Credentials"
                                >
                                  {resendLoading[caretaker.id] ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                                </button>
                              )}
                              {caretaker.accountStatus === "Pending Password Change" && (
                                <button
                                  onClick={() => handleResetPassword(caretaker)}
                                  disabled={resetLoading[caretaker.id]}
                                  className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors disabled:opacity-50"
                                  title="Reset Password"
                                >
                                  {resetLoading[caretaker.id] ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteClick(caretaker)}
                                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                              <ActionMenu
                                caretaker={caretaker}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                                onResend={handleResendCredentials}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-500 font-medium">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredCaretakers.length)} of {filteredCaretakers.length} guardians
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? "bg-[#2563EB] text-white"
                            : "text-slate-600 hover:bg-slate-50 border border-slate-200"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* RIGHT DRAWER */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {drawerOpen && (
        <CaretakerDrawer
          caretaker={selectedCaretaker}
          onClose={() => setDrawerOpen(false)}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onResend={handleResendCredentials}
          onApprove={handleUpdateStatus}
          loading={drawerLoading}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* INVITE MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSave={handleInvite}
        loading={inviteLoading}
        patients={patients}
        selectedPatient={selectedPatient}
        setSelectedPatient={setSelectedPatient}
        hospitals={hospitals}
      />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* EDIT MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <EditModal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingCaretaker(null); }}
        onSave={handleSaveEdit}
        caretaker={editingCaretaker}
        loading={editLoading}
      />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* DELETE MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingCaretaker(null); }}
        onConfirm={handleConfirmDelete}
        itemName={deletingCaretaker?.name}
        loading={deleteLoading}
      />
    </div>
  );
};

export default GuardiansManagement;