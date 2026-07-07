import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Hospital,
  User,
  Filter,
} from "lucide-react";
import api from "../Api/axios.js";
import { toast } from "react-toastify";

// ─── STATUS BADGE ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const configs = {
    active: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      label: "Active",
    },
    inactive: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
      icon: XCircle,
      iconColor: "text-slate-400",
      label: "Inactive",
    },
    suspended: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: AlertCircle,
      iconColor: "text-red-500",
      label: "Suspended",
    },
  };

  const cfg = configs[status] || configs.inactive;
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon size={12} className={cfg.iconColor} />
      {cfg.label}
    </span>
  );
};

// ─── SKELETON COMPONENTS ──────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-[16px] border border-slate-200 p-5 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="w-10 h-10 rounded-xl bg-slate-200" />
      <div className="w-16 h-6 rounded-full bg-slate-200" />
    </div>
    <div className="mt-4 w-24 h-8 rounded bg-slate-200" />
    <div className="mt-2 w-32 h-4 rounded bg-slate-200" />
  </div>
);

const SkeletonTableRow = () => (
  <tr className="border-b border-slate-100">
    <td className="px-5 py-4"><div className="w-36 h-4 rounded bg-slate-200 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="w-40 h-4 rounded bg-slate-200 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="w-28 h-4 rounded bg-slate-200 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="w-28 h-4 rounded bg-slate-200 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="w-32 h-4 rounded bg-slate-200 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="w-20 h-6 rounded-full bg-slate-200 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="w-24 h-4 rounded bg-slate-200 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="w-20 h-4 rounded bg-slate-200 animate-pulse" /></td>
  </tr>
);

const SkeletonDrawer = () => (
  <div className="space-y-6">
    <div className="w-full h-28 rounded-[16px] bg-slate-200 animate-pulse" />
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="space-y-2">
        <div className="w-24 h-3 rounded bg-slate-200 animate-pulse" />
        <div className="w-full h-4 rounded bg-slate-200 animate-pulse" />
      </div>
    ))}
  </div>
);

// ─── STATS CARD ───────────────────────────────────────────────────────────────
const StatsCard = ({ icon: Icon, label, value, subLabel, color }) => {
  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-[#2563EB]" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "text-emerald-600" },
    slate: { bg: "bg-slate-100", text: "text-slate-600", icon: "text-slate-500" },
    red: { bg: "bg-red-50", text: "text-red-600", icon: "text-red-500" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-[16px] border border-slate-200 p-5 hover:shadow-md hover:shadow-slate-200/40 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={18} className={c.icon} strokeWidth={2} />
        </div>
        {subLabel && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
            {subLabel}
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

// ─── INFO FIELD (for drawer) ─────────────────────────────────────────────────
const InfoField = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={14} className="text-slate-400" />
    </div>
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-slate-800 mt-0.5 leading-relaxed">{value || "N/A"}</p>
    </div>
  </div>
);

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="w-20 h-20 rounded-[20px] bg-slate-50 flex items-center justify-center mb-6">
      <Building2 size={36} className="text-slate-300" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900">No Hospitals Found</h3>
    <p className="text-sm text-slate-500 mt-2 text-center max-w-sm">
      Create your first hospital to start managing healthcare facilities.
    </p>
    <button
      onClick={onAdd}
      className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      <Plus size={16} /> Add Hospital
    </button>
  </div>
);

// ─── ADD/EDIT HOSPITAL MODAL ──────────────────────────────────────────────────
const HospitalFormModal = ({ isOpen, onClose, onSubmit, hospital, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    adminName: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (hospital) {
      setFormData({
        name: hospital.name || "",
        address: hospital.address || "",
        adminName: "",
        phone: "",
        email: "",
      });
    } else {
      setFormData({ name: "", address: "", adminName: "", phone: "", email: "" });
    }
  }, [hospital, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEdit = !!hospital;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 z-50" onClick={!loading ? onClose : undefined} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[20px] shadow-2xl shadow-slate-900/10 z-50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">
            {isEdit ? "Edit Hospital" : "Add New Hospital"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Hospital Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter hospital name"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter hospital address"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
              required
              disabled={loading}
            />
          </div>

          {!isEdit && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Admin Information</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Admin Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    placeholder="Admin full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    required={!isEdit}
                    disabled={loading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      required={!isEdit}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admin@hospital.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                      required={!isEdit}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Create Hospital"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

// ─── STATUS CHANGE MODAL ──────────────────────────────────────────────────────
const StatusModal = ({ isOpen, onClose, onSubmit, hospital, loading }) => {
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (hospital) setStatus(hospital.status || "active");
  }, [hospital, isOpen]);

  if (!isOpen || !hospital) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(status);
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 z-50" onClick={!loading ? onClose : undefined} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[20px] shadow-2xl shadow-slate-900/10 z-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Change Status</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none bg-white"
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Update Status
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

// ─── DELETE CONFIRMATION MODAL ────────────────────────────────────────────────
const DeleteDialog = ({ isOpen, onClose, onConfirm, hospitalName, loading }) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 z-50" onClick={!loading ? onClose : undefined} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[20px] shadow-2xl shadow-slate-900/10 z-50 p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Delete Hospital</h3>
        <p className="text-sm text-slate-500 mt-2">
          Are you sure you want to delete <span className="font-medium text-slate-700">{hospitalName}</span>? This action cannot be undone.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

// ─── HOSPITAL DETAILS DRAWER ──────────────────────────────────────────────────
const HospitalDetailsDrawer = ({ hospital, onClose, onEdit, onStatus, onDelete, loading }) => {
  if (!hospital) return null;

  const createdDate = hospital.createdAt
    ? new Date(hospital.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl shadow-slate-900/10 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Hospital Details</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <SkeletonDrawer />
          ) : (
            <div className="space-y-6">
              <div className="bg-[#2563EB] rounded-[16px] p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">{hospital.name}</h4>
                    <p className="text-blue-100 text-sm mt-0.5">{hospital.address}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <StatusBadge status={hospital.status} />
                </div>
              </div>

              <div className="space-y-5">
                <InfoField icon={MapPin} label="Address" value={hospital.address} />
                <InfoField icon={User} label="Admin Name" value={hospital.adminId?.firstName || hospital.adminName} />
                <InfoField icon={Phone} label="Phone" value={hospital.adminId?.phone} />
                <InfoField icon={Mail} label="Email" value={hospital.adminId?.email} />
                <InfoField icon={Calendar} label="Created Date" value={createdDate} />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-5 border-t border-slate-100 space-y-3">
          <button
            onClick={() => onEdit(hospital)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Pencil size={16} /> Edit Hospital
          </button>
          <button
            onClick={() => onStatus(hospital)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Activity size={16} /> Change Status
          </button>
          <button
            onClick={() => onDelete(hospital)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} /> Delete Hospital
          </button>
        </div>
      </div>
    </>
  );
};

// ─── ACTION MENU ──────────────────────────────────────────────────────────────
const ActionMenu = ({ onView, onEdit, onStatus, onDelete }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

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
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 py-1.5 z-50">
          <button onClick={() => { onView(); setOpen(false); }} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
            <Eye size={14} className="text-slate-400" /> View Details
          </button>
          <button onClick={() => { onEdit(); setOpen(false); }} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
            <Pencil size={14} className="text-slate-400" /> Edit
          </button>
          <button onClick={() => { onStatus(); setOpen(false); }} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
            <Activity size={14} className="text-slate-400" /> Change Status
          </button>
          <div className="mx-3 my-1 h-px bg-slate-100" />
          <button onClick={() => { onDelete(); setOpen(false); }} className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const HospitalManagement = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusHospital, setStatusHospital] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingHospital, setDeletingHospital] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── FETCH HOSPITALS ─────────────────────────────────────────────────────────
  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await api.get("/hospitals");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.hospitals || [];
      setHospitals(data);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      toast.error(error.response?.data?.message || "Failed to load hospitals");
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  // ─── FILTER & PAGINATE ───────────────────────────────────────────────────────
  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch =
      !searchQuery ||
      h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || h.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage) || 1;
  const paginatedHospitals = filteredHospitals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // ─── STATS ───────────────────────────────────────────────────────────────────
  const totalHospitals = hospitals.length;
  const activeCount = hospitals.filter((h) => h.status === "active").length;
  const inactiveCount = hospitals.filter((h) => h.status === "inactive").length;
  const suspendedCount = hospitals.filter((h) => h.status === "suspended").length;

  // ─── VIEW ────────────────────────────────────────────────────────────────────
  const handleView = async (hospital) => {
    setDrawerLoading(true);
    setDrawerOpen(true);
    try {
      const response = await api.get(`/hospitals/${hospital._id || hospital.id}`);
      setSelectedHospital(response.data?.data || response.data.hospital);
    } catch (error) {
      console.error("Error fetching hospital:", error);
      toast.error(error.response?.data?.message || "Failed to load details");
      setSelectedHospital(hospital);
    } finally {
      setDrawerLoading(false);
    }
  };

  // ─── ADD ─────────────────────────────────────────────────────────────────────
  const handleAdd = () => {
    setEditingHospital(null);
    setFormModalOpen(true);
  };

  // ─── EDIT ────────────────────────────────────────────────────────────────────
  const handleEdit = (hospital) => {
    setDrawerOpen(false);
    setEditingHospital(hospital);
    setFormModalOpen(true);
  };

  // ─── SAVE (CREATE / UPDATE) ──────────────────────────────────────────────────
  const handleSave = async (formData) => {
    setFormLoading(true);
    try {
      if (editingHospital) {
        const id = editingHospital._id || editingHospital.id;
        await api.put(`/hospitals/${id}`, {
          name: formData.name,
          address: formData.address,
        });
        toast.success("Hospital updated successfully");
      } else {
      const res = await api.post("/hospitals/create-with-admin", {
  hospitalName: formData.name,
  hospitalAddress: formData.address,
  adminFirstName: formData.adminName,
  adminPhone: formData.phone,
  adminEmail: formData.email,
});

toast.success("Hospital created successfully");

alert(`
Hospital Created Successfully

Email:
${res.data.admin.email}

Temporary Password:
${res.data.temporaryPassword}
`);
      }
      setFormModalOpen(false);
      setEditingHospital(null);
      await fetchHospitals();
    } catch (error) {
      console.error("Error saving hospital:", error);
      toast.error(error.response?.data?.message || "Failed to save hospital");
    } finally {
      setFormLoading(false);
    }
  };

  // ─── STATUS ────────────────────────────────────────────────────────────────────
  const handleStatusClick = (hospital) => {
    setDrawerOpen(false);
    setStatusHospital(hospital);
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!statusHospital) return;
    setStatusLoading(true);
    try {
      const id = statusHospital._id || statusHospital.id;
      await api.patch(`/hospitals/${id}/status`, { status: newStatus });
      toast.success("Status updated successfully");
      setStatusModalOpen(false);
      setStatusHospital(null);
      await fetchHospitals();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  // ─── DELETE ──────────────────────────────────────────────────────────────────
  const handleDeleteClick = (hospital) => {
    setDrawerOpen(false);
    setDeletingHospital(hospital);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingHospital) return;
    setDeleteLoading(true);
    try {
      const id = deletingHospital._id || deletingHospital.id;
      await api.delete(`/hospitals/${id}`);
      toast.success("Hospital deleted successfully");
      setDeleteModalOpen(false);
      setDeletingHospital(null);
      await fetchHospitals();
    } catch (error) {
      console.error("Error deleting hospital:", error);
      toast.error(error.response?.data?.message || "Failed to delete hospital");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ─── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="px-6 lg:px-10 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Hospital Management
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">
              Manage hospitals in the Medikto ecosystem.
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] self-start sm:self-auto"
          >
            <Plus size={16} strokeWidth={2.5} /> Add Hospital
          </button>
        </div>
      </div>

      {/* ─── STATS CARDS ────────────────────────────────────────────────────── */}
      <div className="px-6 lg:px-10 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <StatsCard
                icon={Hospital}
                label="Total Hospitals"
                value={totalHospitals}
                subLabel={totalHospitals > 0 ? `${Math.round((activeCount / totalHospitals) * 100)}% active` : "0%"}
                color="blue"
              />
              <StatsCard
                icon={CheckCircle2}
                label="Active Hospitals"
                value={activeCount}
                color="emerald"
              />
              <StatsCard
                icon={XCircle}
                label="Inactive Hospitals"
                value={inactiveCount}
                color="slate"
              />
              <StatsCard
                icon={AlertCircle}
                label="Suspended Hospitals"
                value={suspendedCount}
                color="red"
              />
            </>
          )}
        </div>
      </div>

      {/* ─── SEARCH & FILTER ──────────────────────────────────────────────────── */}
      <div className="px-6 lg:px-10 pb-6">
        <div className="bg-white rounded-[16px] border border-slate-200 p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by hospital name or address..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
            <div className="relative sm:w-48">
              <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none bg-white cursor-pointer font-medium"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── TABLE ────────────────────────────────────────────────────────────── */}
      <div className="px-6 lg:px-10 pb-10">
        <div className="bg-white rounded-[16px] border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {["Hospital Name", "Address", "Admin", "Phone", "Email", "Status", "Created", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SkeletonTableRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : paginatedHospitals.length === 0 ? (
            <EmptyState onAdd={handleAdd} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      {["Hospital Name", "Address", "Admin", "Phone", "Email", "Status", "Created", "Actions"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHospitals.map((hospital) => {
                      const createdDate = hospital.createdAt
                        ? new Date(hospital.createdAt).toISOString().split("T")[0]
                        : "N/A";
                      const admin = hospital.adminId || {};

                      return (
                        <tr
                          key={hospital._id || hospital.id}
                          className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Building2 size={16} className="text-[#2563EB]" />
                              </div>
                              <span className="text-sm font-semibold text-slate-900">{hospital.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 max-w-xs">
                              <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                              <span className="text-sm text-slate-600 truncate">{hospital.address || "N/A"}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-700 font-medium">{admin.firstName || "N/A"}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-600">{admin.phone || "N/A"}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-600">{admin.email || "N/A"}</span>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={hospital.status} />
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-500">{createdDate}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleView(hospital)}
                                className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-[#2563EB] transition-colors"
                                title="View"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => handleEdit(hospital)}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                              <ActionMenu
                                onView={() => handleView(hospital)}
                                onEdit={() => handleEdit(hospital)}
                                onStatus={() => handleStatusClick(hospital)}
                                onDelete={() => handleDeleteClick(hospital)}
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
              {filteredHospitals.length > itemsPerPage && (
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500 font-medium">
                    Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredHospitals.length)} of {filteredHospitals.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-medium text-slate-600 px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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

      {/* ─── DRAWER ───────────────────────────────────────────────────────────── */}
      {drawerOpen && (
        <HospitalDetailsDrawer
          hospital={selectedHospital}
          onClose={() => setDrawerOpen(false)}
          onEdit={handleEdit}
          onStatus={handleStatusClick}
          onDelete={handleDeleteClick}
          loading={drawerLoading}
        />
      )}

      {/* ─── FORM MODAL ───────────────────────────────────────────────────────── */}
      <HospitalFormModal
        isOpen={formModalOpen}
        onClose={() => { setFormModalOpen(false); setEditingHospital(null); }}
        onSubmit={handleSave}
        hospital={editingHospital}
        loading={formLoading}
      />

      {/* ─── STATUS MODAL ───────────────────────────────────────────────────── */}
      <StatusModal
        isOpen={statusModalOpen}
        onClose={() => { setStatusModalOpen(false); setStatusHospital(null); }}
        onSubmit={handleStatusUpdate}
        hospital={statusHospital}
        loading={statusLoading}
      />

      {/* ─── DELETE MODAL ─────────────────────────────────────────────────────── */}
      <DeleteDialog
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingHospital(null); }}
        onConfirm={handleConfirmDelete}
        hospitalName={deletingHospital?.name}
        loading={deleteLoading}
      />
    </div>
  );
};

export default HospitalManagement;
