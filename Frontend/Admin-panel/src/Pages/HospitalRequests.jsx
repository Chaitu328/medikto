import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Search,
  RefreshCcw,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Hospital,
  Users,
  Phone,
  Mail,
  Calendar,
  Hash,
  Eye,
  Check,
  X,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  Timer,
  Bell,
  Filter,
  ArrowUpDown,
  Loader2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// AXIOS INSTANCE
// ─────────────────────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor – attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || ""}/api/refresh-token`,
          { refreshToken }
        );
        const { token } = res.data;
        localStorage.setItem("token", token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
const formatDate = (isoString) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (isoString) => {
  if (!isoString) return "—";
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const formatDateTime = (isoString) => {
  return `${formatDate(isoString)} at ${formatTime(isoString)}`;
};

const getTimeRemaining = (expiryIso) => {
  if (!expiryIso) return { text: "—", expired: false };
  const now = new Date();
  const expiry = new Date(expiryIso);
  const diff = expiry - now;
  if (diff <= 0) return { text: "Expired", expired: true };
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (mins > 0) return { text: `${mins}m ${secs}s left`, expired: false };
  return { text: `${secs}s left`, expired: false };
};

const maskOtp = (otp) => {
  if (!otp || otp.length < 4) return "****";
  return "***" + otp.slice(-3);
};

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
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
    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse" /><div className="w-32 h-4 rounded bg-slate-200 animate-pulse" /></div></td>
    <td className="px-6 py-4"><div className="w-28 h-4 rounded bg-slate-200 animate-pulse" /></td>
    <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-slate-200 animate-pulse" /><div className="w-36 h-4 rounded bg-slate-200 animate-pulse" /></div></td>
    <td className="px-6 py-4"><div className="w-16 h-4 rounded bg-slate-200 animate-pulse" /></td>
    <td className="px-6 py-4"><div className="w-28 h-4 rounded bg-slate-200 animate-pulse" /></td>
    <td className="px-6 py-4"><div className="w-20 h-4 rounded bg-slate-200 animate-pulse" /></td>
    <td className="px-6 py-4"><div className="w-16 h-6 rounded-full bg-slate-200 animate-pulse" /></td>
    <td className="px-6 py-4"><div className="w-24 h-4 rounded bg-slate-200 animate-pulse" /></td>
  </tr>
);

const SkeletonDrawer = () => (
  <div className="space-y-6">
    <div className="w-full h-28 rounded-[16px] bg-slate-200 animate-pulse" />
    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
      <div key={i} className="space-y-2">
        <div className="w-24 h-3 rounded bg-slate-200 animate-pulse" />
        <div className="w-full h-4 rounded bg-slate-200 animate-pulse" />
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────
const StatusBadge = ({ status, size = "md" }) => {
  const configs = {
    pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock, iconColor: "text-amber-500" },
    approved: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2, iconColor: "text-emerald-500" },
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

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY CARD
// ─────────────────────────────────────────────────────────────────────────────
const SummaryCard = ({ icon: Icon, label, value, subValue, color, delay }) => {
  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-[#2563EB]" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    red: { bg: "bg-red-50", text: "text-red-600" },
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

// ─────────────────────────────────────────────────────────────────────────────
// ACTION MENU
// ─────────────────────────────────────────────────────────────────────────────
const ActionMenu = ({ request, onView, onApprove, onReject, onDelete }) => {
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
        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 py-1.5 z-50">
          <button onClick={() => { onView(request); setOpen(false); }} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
            <Eye size={14} className="text-slate-400" /> View Details
          </button>
          {request.status === "pending" && (
            <>
              <button onClick={() => { onApprove(request); setOpen(false); }} className="w-full px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors">
                <Check size={14} className="text-emerald-500" /> Approve
              </button>
              <button onClick={() => { onReject(request); setOpen(false); }} className="w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
                <X size={14} className="text-red-500" /> Reject
              </button>
            </>
          )}
          <div className="mx-3 my-1 h-px bg-slate-100" />
          <button onClick={() => { onDelete(request); setOpen(false); }} className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RIGHT DRAWER
// ─────────────────────────────────────────────────────────────────────────────
const RequestDrawer = ({ request, onClose, onApprove, onReject, onDelete, loading }) => {
  if (!request) return null;
  const timeRemaining = getTimeRemaining(request.expiryTime);

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[440px] bg-white z-50 shadow-2xl shadow-slate-900/10 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Request Details</h3>
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
              {/* Status Banner */}
              <div className={`rounded-[16px] p-5 ${
                request.status === "pending" ? "bg-amber-50 border border-amber-100" :
                request.status === "approved" ? "bg-emerald-50 border border-emerald-100" :
                "bg-red-50 border border-red-100"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    request.status === "pending" ? "bg-amber-100 text-amber-600" :
                    request.status === "approved" ? "bg-emerald-100 text-emerald-600" :
                    "bg-red-100 text-red-600"
                  }`}>
                    {request.status === "pending" ? <Clock size={22} /> :
                     request.status === "approved" ? <CheckCircle2 size={22} /> :
                     <XCircle size={22} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Status</p>
                    <p className={`text-base font-semibold capitalize ${
                      request.status === "pending" ? "text-amber-700" :
                      request.status === "approved" ? "text-emerald-700" :
                      "text-red-700"
                    }`}>{request.status}</p>
                  </div>
                </div>
              </div>

              {/* Patient Info */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Patient Information</h4>
                <div className="space-y-4">
                  <DrawerInfo icon={User} label="Patient Name" value={request.patientName} />
                  <DrawerInfo icon={Phone} label="Phone Number" value={request.phone} />
                  <DrawerInfo icon={Mail} label="Email" value={request.email} />
                  <DrawerInfo icon={Hash} label="OTP" value={maskOtp(request.otp)} />
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Hospital Info */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Hospital Information</h4>
                <div className="space-y-4">
                  <DrawerInfo icon={Building2} label="Hospital Name" value={request.hospitalName} />
                  <DrawerInfo icon={MapPinIcon} label="Address" value={request.hospitalAddress} />
                  <DrawerInfo icon={User} label="Hospital Admin" value={request.hospitalAdmin} />
                  <DrawerInfo icon={Phone} label="Admin Phone" value={request.hospitalPhone} />
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Request Info */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Request Details</h4>
                <div className="space-y-4">
                  <DrawerInfo icon={Calendar} label="Request Time" value={formatDateTime(request.requestTime)} />
                  <DrawerInfo icon={Timer} label="Expiry Time" value={formatDateTime(request.expiryTime)} />
                  <DrawerInfo icon={Clock} label="Time Remaining" value={timeRemaining.text} isExpired={timeRemaining.expired} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 border-t border-slate-100 space-y-3">
          {request.status === "pending" && (
            <>
              <button
                onClick={() => { onApprove(request); onClose(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                <Check size={16} /> Approve Request
              </button>
              <button
                onClick={() => { onReject(request); onClose(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
              >
                <X size={16} /> Reject Request
              </button>
            </>
          )}
          <button
            onClick={() => { onDelete(request); onClose(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Trash2 size={16} /> Delete Request
          </button>
        </div>
      </div>
    </>
  );
};

const DrawerInfo = ({ icon: Icon, label, value, isExpired }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={14} className="text-slate-400" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-medium mt-0.5 leading-relaxed ${isExpired ? "text-red-500" : "text-slate-800"}`}>
        {value}
      </p>
    </div>
  </div>
);

const MapPinIcon = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────
const EmptyState = ({ onRefresh }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="w-20 h-20 rounded-[20px] bg-slate-50 flex items-center justify-center mb-6">
      <Bell size={36} className="text-slate-300" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900">No Hospital Requests</h3>
    <p className="text-sm text-slate-500 mt-2 text-center max-w-sm">
      No pending requests available. New patient requests will appear here.
    </p>
    <button
      onClick={onRefresh}
      className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      <RefreshCcw size={16} /> Refresh
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRMATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
const DeleteModal = ({ isOpen, onClose, onConfirm, itemName, loading }) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[20px] shadow-2xl shadow-slate-900/10 z-50 p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Delete Request</h3>
        <p className="text-sm text-slate-500 mt-2">
          Are you sure you want to delete the request from <span className="font-medium text-slate-700">{itemName}</span>? This action cannot be undone.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TOAST NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const configs = {
    success: { bg: "bg-emerald-500", icon: CheckCircle2 },
    error: { bg: "bg-red-500", icon: XCircle },
    info: { bg: "bg-blue-500", icon: AlertCircle },
  };
  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl ${config.bg} text-white shadow-lg shadow-slate-900/20 animate-in slide-in-from-bottom-2 duration-300`}>
      <Icon size={18} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={14} /></button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const HospitalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [sortField, setSortField] = useState("requestTime");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);

  const ITEMS_PER_PAGE = 10;

  // ── Fetch all hospitals ──
  const fetchHospitals = useCallback(async () => {
    try {
      const res = await api.get("/api/hospitals");

setHospitals(
  Array.isArray(res.data?.hospitals)
    ? res.data.hospitals
    : []
);
    } catch (err) {
      console.error("Failed to fetch hospitals:", err);
      setToast({ message: "Failed to load hospitals", type: "error" });
    }
  }, []);

  // ── Fetch hospital requests ──
  const fetchRequests = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get("/api/profile/hospitals");
      const rawData = res.data?.data || res.data || [];

      // Normalize API response to match component shape
      const normalized = rawData.map((item) => {
        const hospital = hospitals.find((h) => h._id === item.hospitalId) || {};
        const firstName = item.patientName?.split(" ")[0] || "Patient";
        const lastName = item.patientName?.split(" ").slice(1).join(" ") || "";

        return {
          id: item._id,
          patientName: item.patientName || "Unknown Patient",
          email: item.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
          phone: item.phone || "",
          hospitalId: item.hospitalId,
          hospitalName: hospital.name || "Unknown Hospital",
          hospitalAddress: hospital.address || "",
          hospitalAdmin: hospital.adminId || "",
          hospitalPhone: hospital.phone || "",
          otp: item.otp || "",
          requestTime: item.createdAt || new Date().toISOString(),
          expiryTime: item.expiresAt || new Date(Date.now() + 30 * 60000).toISOString(),
          status: item.status || "pending",
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.patientName || "Patient")}&background=2563EB&color=fff&size=128`,
        };
      });

      setRequests(normalized);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setToast({ message: err.response?.data?.message || "Failed to load requests", type: "error" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [hospitals]);

  // ── Initial load ──
  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  useEffect(() => {
    if (hospitals.length > 0) {
      fetchRequests();
    }
  }, [hospitals, fetchRequests]);

  // ── Unique hospitals for filter (from API) ──
  const uniqueHospitals = useMemo(() => {
  const list = Array.isArray(hospitals) ? hospitals : [];

  const map = new Map();

  list.forEach((h) => {
    map.set(h._id, h.name);
  });

  return Array.from(map.entries()).map(([id, name]) => ({
    id,
    name,
  }));
}, [hospitals]);

  // ── Filter & Sort ──
  const filteredRequests = useMemo(() => {
    let result = [...requests];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.patientName.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.hospitalName.toLowerCase().includes(q) ||
          r.otp.includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      result = result.filter((r) => {
        const reqDate = new Date(r.requestTime);
        if (dateFilter === "today") return reqDate.toDateString() === now.toDateString();
        if (dateFilter === "week") return now - reqDate <= 7 * 24 * 60 * 60 * 1000;
        if (dateFilter === "month") return now - reqDate <= 30 * 24 * 60 * 60 * 1000;
        return true;
      });
    }

    // Hospital filter
    if (hospitalFilter !== "all") {
      result = result.filter((r) => r.hospitalId === hospitalFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal, bVal;
      if (sortField === "requestTime") { aVal = new Date(a.requestTime); bVal = new Date(b.requestTime); }
      else if (sortField === "patientName") { aVal = a.patientName.toLowerCase(); bVal = b.patientName.toLowerCase(); }
      else if (sortField === "hospitalName") { aVal = a.hospitalName.toLowerCase(); bVal = b.hospitalName.toLowerCase(); }
      else if (sortField === "status") { aVal = a.status; bVal = b.status; }
      else { aVal = a[sortField]; bVal = b[sortField]; }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [requests, searchQuery, statusFilter, dateFilter, hospitalFilter, sortField, sortDir]);

  // ── Pagination ──
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter, hospitalFilter, sortField, sortDir]);

  // ── Stats ──
  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === "pending").length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const rejected = requests.filter((r) => r.status === "rejected").length;
    const today = new Date().toDateString();
    const todayCount = requests.filter((r) => new Date(r.requestTime).toDateString() === today).length;
    return { pending, approved, rejected, today: todayCount };
  }, [requests]);

  // ── Handlers ──
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const handleView = (request) => {
    setDrawerLoading(true);
    setDrawerOpen(true);
    setTimeout(() => {
      setSelectedRequest(request);
      setDrawerLoading(false);
    }, 300);
  };

  const handleApprove = async (request) => {
    setActionLoading((prev) => ({ ...prev, [request.id]: "approve" }));
    try {
      await api.patch(`/api/hospitals/${request.id}/status`, { status: "approved" });
      setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, status: "approved" } : r)));
      setToast({ message: "Request approved successfully", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to approve request", type: "error" });
    } finally {
      setActionLoading((prev) => ({ ...prev, [request.id]: null }));
    }
  };

  const handleReject = async (request) => {
    setActionLoading((prev) => ({ ...prev, [request.id]: "reject" }));
    try {
      await api.patch(`/api/hospitals/${request.id}/status`, { status: "rejected" });
      setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, status: "rejected" } : r)));
      setToast({ message: "Request rejected", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to reject request", type: "error" });
    } finally {
      setActionLoading((prev) => ({ ...prev, [request.id]: null }));
    }
  };

  const handleDeleteClick = (request) => {
    setDeletingRequest(request);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/api/hospitals/${deletingRequest.id}`);
      setRequests((prev) => prev.filter((r) => r.id !== deletingRequest.id));
      setToast({ message: "Request deleted successfully", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to delete request", type: "error" });
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setDeletingRequest(null);
    }
  };

  const handleExport = () => {
    const csv = [
      ["Patient Name", "Phone", "Email", "Hospital", "OTP", "Request Time", "Expiry Time", "Status"],
      ...filteredRequests.map((r) => [
        r.patientName, r.phone, r.email, r.hospitalName, r.otp,
        formatDateTime(r.requestTime), formatDateTime(r.expiryTime), r.status
      ])
    ].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hospital-requests-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-slate-300" />;
    return sortDir === "asc" ? <ChevronDown size={12} className="text-[#2563EB] rotate-180" /> : <ChevronDown size={12} className="text-[#2563EB]" />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-6 lg:px-10 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Hospital Requests
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">
              Manage patient requests to connect with hospitals.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => fetchRequests(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCcw size={15} className={refreshing ? "animate-spin" : ""} />
              Refresh Requests
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
            >
              <Download size={15} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SUMMARY CARDS */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-6 lg:px-10 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              <SummaryCard icon={Clock} label="Pending Requests" value={stats.pending} subValue={stats.pending > 0 ? "Needs action" : "All clear"} color="amber" delay={0} />
              <SummaryCard icon={CheckCircle2} label="Approved Requests" value={stats.approved} subValue={`${Math.round((stats.approved / (requests.length || 1)) * 100)}% rate`} color="emerald" delay={100} />
              <SummaryCard icon={XCircle} label="Rejected Requests" value={stats.rejected} subValue={`${Math.round((stats.rejected / (requests.length || 1)) * 100)}% rate`} color="red" delay={200} />
              <SummaryCard icon={Hospital} label="Today's Requests" value={stats.today} subValue="New today" color="blue" delay={300} />
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FILTER BAR */}
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
                placeholder="Search by patient name, phone, hospital, or OTP..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Status Filter */}
              <div className="relative">
                <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-40 pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none bg-white cursor-pointer font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Date Filter */}
              <div className="relative">
                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full sm:w-40 pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none bg-white cursor-pointer font-medium"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Hospital Filter */}
              <div className="relative">
                <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={hospitalFilter}
                  onChange={(e) => setHospitalFilter(e.target.value)}
                  className="w-full sm:w-48 pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none bg-white cursor-pointer font-medium"
                >
                  <option value="all">All Hospitals</option>
                  {uniqueHospitals.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || statusFilter !== "all" || dateFilter !== "all" || hospitalFilter !== "all") && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-400">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                  Search: "{searchQuery}" <button onClick={() => setSearchQuery("")} className="hover:text-blue-900"><X size={10} /></button>
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium capitalize">
                  Status: {statusFilter} <button onClick={() => setStatusFilter("all")} className="hover:text-blue-900"><X size={10} /></button>
                </span>
              )}
              {dateFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium capitalize">
                  Date: {dateFilter} <button onClick={() => setDateFilter("all")} className="hover:text-blue-900"><X size={10} /></button>
                </span>
              )}
              {hospitalFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                  {uniqueHospitals.find((h) => h.id === hospitalFilter)?.name}
                  <button onClick={() => setHospitalFilter("all")} className="hover:text-blue-900"><X size={10} /></button>
                </span>
              )}
              <button
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); setDateFilter("all"); setHospitalFilter("all"); }}
                className="text-xs font-medium text-red-500 hover:text-red-600 ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TABLE */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-6 lg:px-10 pb-10">
        <div className="bg-white rounded-[20px] border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {["Patient", "Phone", "Hospital", "OTP", "Requested", "Expires", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>{[1, 2, 3, 4, 5].map((i) => <SkeletonTableRow key={i} />)}</tbody>
              </table>
            </div>
          ) : filteredRequests.length === 0 ? (
            <EmptyState onRefresh={() => fetchRequests(true)} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
                      {[
                        { key: "patientName", label: "Patient" },
                        { key: "phone", label: "Phone Number" },
                        { key: "hospitalName", label: "Hospital" },
                        { key: "otp", label: "OTP" },
                        { key: "requestTime", label: "Requested Time" },
                        { key: "expiryTime", label: "Expires" },
                        { key: "status", label: "Status" },
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
                    {paginatedRequests.map((request) => {
                      const timeRemaining = getTimeRemaining(request.expiryTime);
                      const isActionLoading = actionLoading[request.id];

                      return (
                        <tr
                          key={request.id}
                          className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group"
                        >
                          {/* Patient */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={request.avatar}
                                alt={request.patientName}
                                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(request.patientName)}&background=2563EB&color=fff`; }}
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{request.patientName}</p>
                                <p className="text-xs text-slate-400 truncate">{request.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600 font-medium">{request.phone}</span>
                          </td>

                          {/* Hospital */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Building2 size={14} className="text-[#2563EB]" />
                              </div>
                              <span className="text-sm text-slate-700 font-medium truncate max-w-[180px]">{request.hospitalName}</span>
                            </div>
                          </td>

                          {/* OTP */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-mono font-semibold tracking-wider">
                              {maskOtp(request.otp)}
                            </span>
                          </td>

                          {/* Requested Time */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-600">{formatDate(request.requestTime)}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{formatTime(request.requestTime)}</div>
                          </td>

                          {/* Expires */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${timeRemaining.expired ? "text-red-500" : "text-amber-600"}`}>
                              <Timer size={12} />
                              {timeRemaining.text}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <StatusBadge status={request.status} />
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => handleView(request)}
                                className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-[#2563EB] transition-colors"
                                title="View"
                              >
                                <Eye size={15} />
                              </button>
                              {request.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleApprove(request)}
                                    disabled={isActionLoading === "approve"}
                                    className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
                                    title="Approve"
                                  >
                                    {isActionLoading === "approve" ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                  </button>
                                  <button
                                    onClick={() => handleReject(request)}
                                    disabled={isActionLoading === "reject"}
                                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                    title="Reject"
                                  >
                                    {isActionLoading === "reject" ? <Loader2 size={15} className="animate-spin" /> : <X size={15} />}
                                  </button>
                                </>
                              )}
                              <ActionMenu
                                request={request}
                                onView={handleView}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onDelete={handleDeleteClick}
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
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)} of {filteredRequests.length} requests
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
        <RequestDrawer
          request={selectedRequest}
          onClose={() => setDrawerOpen(false)}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDeleteClick}
          loading={drawerLoading}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* DELETE MODAL */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingRequest(null); }}
        onConfirm={handleConfirmDelete}
        itemName={deletingRequest?.patientName}
        loading={deleteLoading}
      />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TOAST */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default HospitalRequests;
