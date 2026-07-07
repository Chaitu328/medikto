import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  MoreVertical,
  X,
  User,
  Phone,
  Mail,
  Shield,
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Activity,
  Ruler,
  Weight,
  HeartPulse,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Stethoscope,
  UserCheck,
  Crown,
  AlertTriangle,
} from "lucide-react";
import axios from "axios";

// ─── AXIOS INSTANCE ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://161.248.223.165:3028/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── COLORS ─────────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#2563EB",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  secondary: "#64748B",
  muted: "#94A3B8",
};

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const isVerified = status === "Verified" || status === "active" || status === true;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
        isVerified
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-red-50 text-red-700 border-red-200"
      }`}
    >
      {isVerified ? (
        <CheckCircle2 size={12} className="text-emerald-500" />
      ) : (
        <XCircle size={12} className="text-red-500" />
      )}
      {isVerified ? "Active" : "Inactive"}
    </span>
  );
};

// ─── SUBSCRIPTION BADGE ─────────────────────────────────────────────────────────
const SubscriptionBadge = ({ subscription }) => {
  const configs = {
    Premium: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: Crown },
    Basic: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Shield },
    Free: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", icon: Shield },
  };
  const cfg = configs[subscription] || configs.Free;
  const IconComp = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <IconComp size={11} />
      {subscription || "Free"}
    </span>
  );
};

// ─── AVATAR ────────────────────────────────────────────────────────────────────
const Avatar = ({ name, src, size = 40 }) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "A";
  return (
    <div
      className="rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] font-semibold text-xs overflow-hidden flex-shrink-0 border border-slate-100"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
};

// ─── SKELETON TABLE ROW ──────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b border-slate-100">
    <td className="px-6 py-4"><div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" /></td>
    <td className="px-6 py-4"><div className="w-28 h-4 rounded bg-slate-100 animate-pulse" /></td>
    <td className="px-6 py-4"><div className="w-32 h-4 rounded bg-slate-100 animate-pulse" /></td>
    <td className="px-6 py-4"><div className="w-20 h-6 rounded-full bg-slate-100 animate-pulse" /></td>
    <td className="px-6 py-4"><div className="w-20 h-6 rounded-full bg-slate-100 animate-pulse" /></td>
    <td className="px-6 py-4"><div className="w-28 h-4 rounded bg-slate-100 animate-pulse" /></td>
    <td className="px-6 py-4"><div className="w-6 h-4 rounded bg-slate-100 animate-pulse" /></td>
  </tr>
);

// ─── SKELETON STAT CARD ────────────────────────────────────────────────────────
const SkeletonStatCard = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
      <div className="w-14 h-5 rounded-full bg-slate-100 animate-pulse" />
    </div>
    <div className="w-20 h-7 rounded bg-slate-100 animate-pulse mb-2" />
    <div className="w-32 h-3 rounded bg-slate-100 animate-pulse" />
  </div>
);

// ─── ACTION MENU ───────────────────────────────────────────────────────────────
const ActionMenu = ({ admin, onView, onEdit, onDisable, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/40 py-1.5 z-50">
          <button onClick={() => { onView(); setOpen(false); }} className="w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
            <Eye size={14} className="text-slate-400" /> View Details
          </button>
          <button onClick={() => { onEdit(); setOpen(false); }} className="w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
            <Edit3 size={14} className="text-slate-400" /> Edit Admin
          </button>
          <button
            onClick={() => { onDisable(); setOpen(false); }}
            className={`w-full px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
              admin.isVerified
                ? "text-amber-700 hover:bg-amber-50"
                : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <Ban size={14} className={admin.isVerified ? "text-amber-500" : "text-emerald-500"} />
            {admin.isVerified ? "Disable Admin" : "Enable Admin"}
          </button>
          <div className="mx-3 my-1 h-px bg-slate-100" />
          <button onClick={() => { onDelete(); setOpen(false); }} className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
            <Trash2 size={14} /> Delete Admin
          </button>
        </div>
      )}
    </div>
  );
};

// ─── INFO ROW (for drawer) ────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3.5">
    <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
      <Icon size={15} className="text-slate-400" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-slate-900 mt-0.5">{value || "N/A"}</p>
    </div>
  </div>
);

// ─── STAT CARD ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, title, value, trend, trendUp, subtitle, color = "blue" }) => {
  const colorMap = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-100" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100" },
    red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-100" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.icon} flex items-center justify-center border ${c.border}`}>
          <Icon size={18} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendUp ? "text-emerald-600" : "text-red-500"}`}>
            {trendUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
    </div>
  );
};

// ─── ADMIN DETAILS DRAWER ────────────────────────────────────────────────────
const AdminDrawer = ({ admin, onClose, onEdit, onDisable, onDelete }) => {
  if (!admin) return null;

  const formatDate = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatDateTime = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 z-40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[460px] bg-white z-50 shadow-2xl shadow-slate-900/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <User size={16} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Admin Details</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <Avatar name={admin.name || admin.firstName} src={admin.profilePic || admin.avatar} size={64} />
              <div className="min-w-0 flex-1">
                <h4 className="text-lg font-semibold text-slate-900">{admin.name || admin.firstName || "N/A"}</h4>
                <p className="text-sm text-slate-500">{admin.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <StatusBadge status={admin.status || admin.isVerified} />
                  <SubscriptionBadge subscription={admin.subscription || admin.plan} />
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoRow icon={Phone} label="Phone Number" value={admin.phone} />
                <InfoRow icon={Mail} label="Email" value={admin.email} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow icon={Shield} label="Role" value={admin.role} />
                <InfoRow icon={UserCheck} label="Age" value={admin.age} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow icon={User} label="Gender" value={admin.gender} />
                <InfoRow icon={HeartPulse} label="Blood Group" value={admin.bloodGroup} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow icon={Ruler} label="Height" value={admin.height} />
                <InfoRow icon={Weight} label="Weight" value={admin.weight} />
              </div>
              <div className="h-px bg-slate-100 my-2" />
              <InfoRow icon={Clock} label="Timezone" value={admin.timezone} />
              <InfoRow icon={Calendar} label="Created" value={formatDateTime(admin.createdAt)} />
              <InfoRow icon={Calendar} label="Updated" value={formatDateTime(admin.updatedAt)} />
              <InfoRow icon={Users} label="Family Members" value={admin.familyMembersCount || admin.familyMembers?.length || 0} />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 border-t border-slate-100 space-y-2.5">
          <button onClick={() => onEdit(admin)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Edit3 size={16} /> Edit Admin
          </button>
          <button
            onClick={() => onDisable(admin)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              admin.isVerified
                ? "bg-white text-amber-600 border-amber-200 hover:bg-amber-50"
                : "bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            }`}
          >
            <Ban size={16} /> {admin.isVerified ? "Disable Admin" : "Enable Admin"}
          </button>
          <button onClick={() => onDelete(admin)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
            <Trash2 size={16} /> Delete Admin
          </button>
        </div>
      </div>
    </>
  );
};

// ─── EMPTY STATE ───────────────────────────────────────────────────────────────
const EmptyState = ({ onCreate }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-5 border border-slate-100">
      <Stethoscope size={28} className="text-slate-300" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900">No Admins Found</h3>
    <p className="text-sm text-slate-500 mt-1.5 text-center max-w-sm">
      There are currently no administrator accounts in the system.
    </p>
    <button
      onClick={onCreate}
      className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
    >
      <Plus size={16} /> Add Admin
    </button>
  </div>
);

// ─── PAGINATION ─────────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  const start = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
      <p className="text-xs text-slate-500 font-medium">
        Showing <span className="text-slate-700 font-semibold">{start}</span>–<span className="text-slate-700 font-semibold">{end}</span> of <span className="text-slate-700 font-semibold">{totalItems}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-slate-600 px-2">
          {currentPage} / {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── FILTER CHIP ─────────────────────────────────────────────────────────────────
const FilterChip = ({ label, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
      active
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
    }`}
  >
    {label} {count !== undefined && <span className={`ml-1 ${active ? "text-blue-500" : "text-slate-400"}`}>{count}</span>}
  </button>
);

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────
const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const itemsPerPage = 10;

  // ─── FETCH ADMINS ───────────────────────────────────────────────────────────
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      const allUsers = response.data.users || [];
      const adminUsers = allUsers.filter(
        (user) => user.role === "admin" || user.role === "hospital_admin"
      );
      setAdmins(adminUsers);
    } catch (error) {
      console.error(error);
      setAdmins([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ─── STATS CALCULATION ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = admins.length;
    const active = admins.filter(a => a.isVerified === true || a.status === "active" || a.status === "Verified").length;
    const inactive = total - active;
    const premium = admins.filter(a => (a.subscription || a.plan) === "Premium").length;
    const basic = admins.filter(a => (a.subscription || a.plan) === "Basic").length;
    const free = total - premium - basic;

    return { total, active, inactive, premium, basic, free };
  }, [admins]);

  // ─── FILTER & SORT ──────────────────────────────────────────────────────────
  const filteredAdmins = useMemo(() => {
    let result = [...admins];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name?.toLowerCase().includes(q) ||
          a.firstName?.toLowerCase().includes(q) ||
          a.phone?.includes(q) ||
          a.email?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((a) => {
        const status = a.status || a.isVerified;
        if (statusFilter === "active") return status === "Verified" || status === "active" || status === true;
        if (statusFilter === "inactive") return status === "Not Verified" || status === "inactive" || status === false;
        if (statusFilter === "premium") return (a.subscription || a.plan) === "Premium";
        if (statusFilter === "basic") return (a.subscription || a.plan) === "Basic";
        if (statusFilter === "free") return !(a.subscription || a.plan) || (a.subscription || a.plan) === "Free";
        return true;
      });
    }

    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === "name") return (a.name || a.firstName || "").localeCompare(b.name || b.firstName || "");
      return 0;
    });

    return result;
  }, [admins, searchQuery, statusFilter, sortBy]);

  // ─── PAGINATION ───────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const paginatedAdmins = filteredAdmins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy]);

  // ─── HANDLERS ─────────────────────────────────────────────────────────────────
  const handleView = (admin) => {
    setSelectedAdmin(admin);
    setDrawerOpen(true);
  };

  const handleEdit = (admin) => {
    console.log("Edit admin:", admin);
    // toast.info("Edit admin — implement modal");
  };

  const handleDisable = async (admin) => {
    try {
      const enable = !admin.isVerified;
      await api.patch(`/admins/${admin._id}/status`, { isVerified: enable });
      await fetchAdmins();
      alert(`Admin ${enable ? "enabled" : "disabled"} successfully`);
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`Are you sure you want to delete ${admin.name || admin.firstName}?`)) return;
    try {
      await api.delete(`/admins/${admin._id || admin.id}`);
      // toast.success("Admin deleted");
      setDrawerOpen(false);
      await fetchAdmins();
    } catch (error) {
      // toast.error(error.response?.data?.message || "Failed to delete admin");
      alert(error.response?.data?.message || "Failed to delete admin");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAdmins();
  };

  const handleExport = () => {
    const csv = [
      ["Name", "Phone", "Email", "Role", "Status", "Subscription", "Created"],
      ...filteredAdmins.map(a => [
        a.name || a.firstName || "N/A",
        a.phone || "N/A",
        a.email || "N/A",
        a.role || "Admin",
        a.isVerified ? "Active" : "Inactive",
        a.subscription || a.plan || "Free",
        a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-GB") : "N/A"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admins_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ─── PAGE HEADER ────────────────────────────────────────────────────── */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                <Shield size={20} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admins</h1>
                <p className="text-sm text-slate-500 mt-0.5">Manage all administrator accounts across the hospital system.</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download size={15} /> Export
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
            {/* <button
              onClick={() => console.log("Add admin — implement modal")}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={16} /> Add Admin
            </button> */}
          </div>
        </div>
      </div>

      {/* ─── ANALYTICS CARDS ─────────────────────────────────────────────────── */}
      <div className="px-8 pb-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              title="Total Admins"
              value={stats.total}
              trend={12}
              trendUp={true}
              subtitle="All administrator accounts"
              color="blue"
            />
            <StatCard
              icon={UserCheck}
              title="Active Admins"
              value={stats.active}
              trend={8}
              trendUp={true}
              subtitle="Verified & active accounts"
              color="emerald"
            />
            <StatCard
              icon={AlertTriangle}
              title="Inactive Admins"
              value={stats.inactive}
              trend={5}
              trendUp={false}
              subtitle="Pending verification"
              color="amber"
            />
            <StatCard
              icon={Crown}
              title="Premium Admins"
              value={stats.premium}
              trend={15}
              trendUp={true}
              subtitle="Premium subscription holders"
              color="purple"
            />
          </div>
        )}
      </div>

      {/* ─── SEARCH, FILTERS & TOOLBAR ──────────────────────────────────────── */}
      <div className="px-8 pb-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, or email..."
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <FilterChip label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} count={admins.length} />
              <FilterChip label="Active" active={statusFilter === "active"} onClick={() => setStatusFilter("active")} count={stats.active} />
              <FilterChip label="Inactive" active={statusFilter === "inactive"} onClick={() => setStatusFilter("inactive")} count={stats.inactive} />
              <FilterChip label="Premium" active={statusFilter === "premium"} onClick={() => setStatusFilter("premium")} count={stats.premium} />
              <FilterChip label="Basic" active={statusFilter === "basic"} onClick={() => setStatusFilter("basic")} count={stats.basic} />
              <FilterChip label="Free" active={statusFilter === "free"} onClick={() => setStatusFilter("free")} count={stats.free} />
            </div>

            {/* Sort */}
            <div className="relative min-w-[160px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-11 pl-4 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── TABLE ──────────────────────────────────────────────────────────── */}
      <div className="px-8 pb-10">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
                  {[
                    { label: "Profile", width: "w-16" },
                    { label: "Name", width: "w-48" },
                    { label: "Phone", width: "w-40" },
                    { label: "Subscription", width: "w-32" },
                    { label: "Status", width: "w-28" },
                    { label: "Created", width: "w-36" },
                    { label: "Actions", width: "w-16" },
                  ].map((h) => (
                    <th
                      key={h.label}
                      className={`px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${h.width}`}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : paginatedAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState onCreate={() => console.log("Add admin — implement modal")} />
                    </td>
                  </tr>
                ) : (
                  paginatedAdmins.map((admin) => (
                    <tr
                      key={admin._id || admin.id}
                      onClick={() => handleView(admin)}
                      className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <Avatar name={admin.name || admin.firstName} src={admin.profilePic || admin.avatar} />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{admin.name || admin.firstName || "N/A"}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{admin.role || "Admin"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-700 font-medium">{admin.phone || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <SubscriptionBadge subscription={admin.subscription || admin.plan} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={admin.status || admin.isVerified} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">{formatDate(admin.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div onClick={(e) => e.stopPropagation()}>
                          <ActionMenu
                            admin={admin}
                            onView={() => handleView(admin)}
                            onEdit={() => handleEdit(admin)}
                            onDisable={() => handleDisable(admin)}
                            onDelete={() => handleDelete(admin)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredAdmins.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAdmins.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {/* ─── DRAWER ─────────────────────────────────────────────────────────── */}
      {drawerOpen && (
        <AdminDrawer
          admin={selectedAdmin}
          onClose={() => setDrawerOpen(false)}
          onEdit={handleEdit}
          onDisable={handleDisable}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Admins;