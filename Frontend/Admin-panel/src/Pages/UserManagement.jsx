
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCw,
  Download,
  Plus,
  Users,
  Crown,
  Hospital,
  UserCheck,
  Stethoscope,
  MoreVertical,
  Eye,
  Edit2,
  Key,
  UserCog,
  Building2,
  Ban,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  ArrowUpDown,
  ChevronDown,
  Shield,
  Activity,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

// ─── Utility Components ────────────────────────────────────────────────────

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    gold: "bg-amber-50 text-amber-700 border-amber-200",
    dark: "bg-slate-800 text-white border-slate-700",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-sm",
    icon: "p-2.5",
  };
  const variants = {
    primary:
      "bg-[#2563EB] text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-400 shadow-sm",
    outline:
      "bg-transparent text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger:
      "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 focus:ring-red-400",
    success:
      "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100",
  };
  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};

const Input = ({ className = "", icon: Icon, ...props }) => (
  <div className="relative">
    {Icon && (
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
    )}
    <input
      className={`w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${Icon ? "pl-10" : ""} ${className}`}
      {...props}
    />
  </div>
);

const Select = ({ options, className = "", ...props }) => (
  <div className="relative">
    <select
      className={`w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
  </div>
);

// ─── Skeleton Components ───────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white rounded-[20px] border border-slate-200 p-6 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200" />
        <div className="w-24 h-3 rounded bg-slate-200" />
        <div className="w-16 h-8 rounded bg-slate-200" />
      </div>
      <div className="w-16 h-6 rounded-full bg-slate-200" />
    </div>
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b border-slate-100 animate-pulse">
    <td className="px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200" />
        <div className="space-y-2">
          <div className="w-28 h-3 rounded bg-slate-200" />
          <div className="w-20 h-2 rounded bg-slate-200" />
        </div>
      </div>
    </td>
    <td className="px-4 py-4"><div className="w-32 h-3 rounded bg-slate-200" /></td>
    <td className="px-4 py-4"><div className="w-24 h-3 rounded bg-slate-200" /></td>
    <td className="px-4 py-4"><div className="w-20 h-6 rounded-full bg-slate-200" /></td>
    <td className="px-4 py-4"><div className="w-24 h-3 rounded bg-slate-200" /></td>
    <td className="px-4 py-4"><div className="w-16 h-6 rounded-full bg-slate-200" /></td>
    <td className="px-4 py-4"><div className="w-16 h-6 rounded-full bg-slate-200" /></td>
    <td className="px-4 py-4"><div className="w-20 h-3 rounded bg-slate-200" /></td>
    <td className="px-4 py-4"><div className="w-20 h-3 rounded bg-slate-200" /></td>
    <td className="px-4 py-4"><div className="w-8 h-8 rounded-lg bg-slate-200 ml-auto" /></td>
  </tr>
);

// ─── Analytics Card ─────────────────────────────────────────────────────────

const AnalyticsCard = ({ title, count, icon: Icon, color, description, trend, trendValue, isLoading }) => {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      border: "border-blue-100",
      trend: "text-blue-600",
    },
    emerald: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      border: "border-emerald-100",
      trend: "text-emerald-600",
    },
    orange: {
      bg: "bg-orange-50",
      icon: "text-orange-600",
      border: "border-orange-100",
      trend: "text-orange-600",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      border: "border-purple-100",
      trend: "text-purple-600",
    },
  };
  const theme = colorMap[color] || colorMap.blue;

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  if (isLoading) return <SkeletonCard />;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 30px -8px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-[20px] border ${theme.border} p-6 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${theme.bg} p-3 rounded-xl`}>
          <Icon className={`w-6 h-6 ${theme.icon}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${theme.trend} bg-white border border-slate-100 rounded-full px-2.5 py-1`}>
            <TrendIcon className="w-3 h-3" />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{count?.toLocaleString() || 0}</h3>
        <p className="text-xs text-slate-400 mt-1.5">{description}</p>
      </div>
    </motion.div>
  );
};

// ─── User Drawer ──────────────────────────────────────────────────────────

const UserDrawer = ({ user, isOpen, onClose, onEdit, onResetPassword, onDeactivate, onDelete, onAssignHospital, onAssignGuardian }) => {
  if (!user) return null;

 const getRoleVariant = (role) => {
  switch (role?.toLowerCase()) {
    case "superadmin":
      return "dark";

    case "admin":
      return "blue";

    case "guardian":
      return "orange";

    case "patient":
      return "emerald";

    default:
      return "default";
  }
};

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "active": case "verified": return "success";
      case "pending": return "warning";
      case "inactive": case "suspended": return "danger";
      default: return "default";
    }
  };

  const getSubscriptionVariant = (sub) => {
    switch (sub?.toLowerCase()) {
      case "premium": return "gold";
      case "basic": return "blue";
      case "free": return "gray";
      default: return "default";
    }
  };

  const activityItems = [
    { icon: CheckCircle2, label: "Account Verified", date: user.verifiedAt || user.createdAt, color: "text-emerald-500" },
    { icon: Calendar, label: "Account Created", date: user.createdAt, color: "text-blue-500" },
    { icon: Clock, label: "Last Login", date: user.lastLogin, color: "text-slate-500" },
  ].filter(item => item.date);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-slate-900">User Details</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-white shadow-lg flex items-center justify-center mx-auto">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-blue-600">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${user.status === "active" ? "bg-emerald-500" : user.status === "pending" ? "bg-amber-500" : "bg-red-500"}`}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">{user.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                  <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
                </div>
              </div>

              {/* Info Grid */}
              <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem icon={Phone} label="Phone" value={user.phone || "N/A"} />
                  <InfoItem icon={Mail} label="Email" value={user.email || "N/A"} />
                  <InfoItem icon={Building2} label="Hospital" value={user.hospital || "N/A"} />
                  <InfoItem icon={Shield} label="Subscription" value={
                    <Badge variant={getSubscriptionVariant(user.subscription)}>{user.subscription || "Free"}</Badge>
                  } />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <StatBox label="Guardians" value={user.guardianCount || 0} />
                <StatBox label="Patients" value={user.patientCount || 0} />
                <StatBox label="Sessions" value={user.sessionCount || 0} />
              </div>

              {/* Dates */}
              <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Timeline</h4>
                {activityItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`mt-0.5 ${item.color}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{item.label}</p>
                      <p className="text-xs text-slate-400">
                        {item.date ? format(new Date(item.date), "MMM dd, yyyy • hh:mm a") : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button variant="primary" className="w-full" icon={Edit2} onClick={() => onEdit(user)}>
                  Edit User
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" icon={Key} onClick={() => onResetPassword(user)}>
                    Reset Password
                  </Button>
                  <Button variant="secondary" icon={Building2} onClick={() => onAssignHospital(user)}>
                    Assign Hospital
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="danger" icon={Ban} onClick={() => onDeactivate(user)}>
                    {user.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="danger" icon={Trash2} onClick={() => onDelete(user)}>
                    Delete User
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
    <p className="text-sm font-medium text-slate-700">{value}</p>
  </div>
);

const StatBox = ({ label, value }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
    <p className="text-lg font-bold text-slate-900">{value}</p>
    <p className="text-xs text-slate-500">{label}</p>
  </div>
);

// ─── Dropdown Menu ────────────────────────────────────────────────────────

const ActionMenu = ({ user, onView, onEdit, onResetPassword, onChangeRole, onAssignHospital, onSuspend, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { icon: Eye, label: "View", action: () => { onView(user); setIsOpen(false); }, variant: "default" },
    { icon: Edit2, label: "Edit", action: () => { onEdit(user); setIsOpen(false); }, variant: "default" },
    { icon: Key, label: "Reset Password", action: () => { onResetPassword(user); setIsOpen(false); }, variant: "default" },
    { icon: UserCog, label: "Change Role", action: () => { onChangeRole(user); setIsOpen(false); }, variant: "default" },
    { icon: Building2, label: "Assign Hospital", action: () => { onAssignHospital(user); setIsOpen(false); }, variant: "default" },
    { icon: Ban, label: user.status === "active" ? "Suspend" : "Activate", action: () => { onSuspend(user); setIsOpen(false); }, variant: "danger" },
    { icon: Trash2, label: "Delete", action: () => { onDelete(user); setIsOpen(false); }, variant: "danger" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-slate-500" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1"
          >
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 ${
                  item.variant === "danger" ? "text-red-600 hover:text-red-700" : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────

const EmptyState = ({ onAddUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
      <Users className="w-10 h-10 text-slate-300" />
    </div>
    <h3 className="text-xl font-semibold text-slate-900 mb-2">No Users Found</h3>
    <p className="text-sm text-slate-500 max-w-sm mb-6">
      There are no users matching your current filters. Try adjusting your search or add a new user to get started.
    </p>
    <Button variant="primary" icon={Plus} onClick={onAddUser}>
      Add First User
    </Button>
  </motion.div>
);

// ─── Pagination ─────────────────────────────────────────────────────────────

const Pagination = ({ currentPage, totalPages, pageSize, onPageChange, onPageSizeChange, totalItems }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100">
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-500">Rows per page</span>
      <Select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        options={[
          { value: 10, label: "10" },
          { value: 25, label: "25" },
          { value: 50, label: "50" },
          { value: 100, label: "100" },
        ]}
        className="w-20"
      />
      <span className="text-sm text-slate-500">
        Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
      </span>
    </div>

    <div className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let pageNum;
        if (totalPages <= 5) {
          pageNum = i + 1;
        } else if (currentPage <= 3) {
          pageNum = i + 1;
        } else if (currentPage >= totalPages - 2) {
          pageNum = totalPages - 4 + i;
        } else {
          pageNum = currentPage - 2 + i;
        }

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
              currentPage === pageNum
                ? "bg-[#2563EB] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState("firstName");
  const [roleFilter, setRoleFilter] = useState("all");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");

  // Hospitals list for dropdown
  const [hospitals, setHospitals] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // ─── Fetch Users ─────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
setUsers(response.data?.users || []);    } catch (error) {
      toast.error("Failed to fetch users");
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // ─── Fetch Hospitals ─────────────────────────────────────────────────────
  const fetchHospitals = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE}/api/hospitals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
setHospitals(response.data?.hospitals || []);
    } catch (error) {
      console.error("Failed to fetch hospitals:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchHospitals();
  }, []);

  // ─── Filtered & Sorted Users ─────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((user) => {
        const field = user[searchBy]?.toString().toLowerCase() || "";
        return field.includes(query);
      });
    }

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role?.toLowerCase() === roleFilter.toLowerCase());
    }

    if (hospitalFilter !== "all") {
      result = result.filter((u) => u.hospitalId === hospitalFilter || u.hospital?._id === hospitalFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((u) => u.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    if (subscriptionFilter !== "all") {
      result = result.filter((u) => u.subscription?.toLowerCase() === subscriptionFilter.toLowerCase());
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, searchQuery, searchBy, roleFilter, hospitalFilter, statusFilter, subscriptionFilter, sortConfig]);

  // ─── Pagination ──────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ─── Analytics ───────────────────────────────────────────────────────────
  const analytics = useMemo(() => {
  return {
    total: users.length,
    superAdmins: users.filter((u) => u.role === "superadmin").length,
    hospitalAdmins: users.filter((u) => u.role === "admin").length,
    guardians: users.filter((u) => u.role === "guardian").length,
    patients: users.filter((u) => u.role === "patient").length,
  };
}, [users]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSearchBy("name");
    setRoleFilter("all");
    setHospitalFilter("all");
    setStatusFilter("all");
    setSubscriptionFilter("all");
    setCurrentPage(1);
  };

  const handleExport = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Role", "Hospital", "Subscription", "Status", "Created Date", "Last Login"],
      ...filteredUsers.map((u) => [
        u.name,
        u.email,
        u.phone,
        u.role,
        u.hospital || "N/A",
        u.subscription || "Free",
        u.status,
        u.createdAt ? format(new Date(u.createdAt), "yyyy-MM-dd") : "N/A",
        u.lastLogin ? format(new Date(u.lastLogin), "yyyy-MM-dd HH:mm") : "N/A",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Users exported successfully");
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleEditUser = (user) => {
    navigate(`/users/edit/${user._id || user.id}`);
  };

  const handleResetPassword = async (user) => {
    if (!window.confirm(`Reset password for ${user.name}?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/api/users/${user._id || user.id}/reset-password`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Password reset email sent to ${user.email}`);
    } catch (error) {
      toast.error("Failed to reset password");
    }
  };

  const handleChangeRole = async (user) => {
    const roles = ["Super Admin", "Hospital Admin", "Guardian", "Patient"];
    const newRole = window.prompt(`Change role for ${user.name}?\nAvailable roles: ${roles.join(", ")}\nCurrent: ${user.role}`);
    if (!newRole || !roles.includes(newRole)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE}/api/users/${user._id || user.id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleAssignHospital = async (user) => {
    const hospitalId = window.prompt(`Assign hospital to ${user.name}?\nEnter Hospital ID:`);
    if (!hospitalId) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE}/api/users/${user._id || user.id}/hospital`,
        { hospitalId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Hospital assigned successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to assign hospital");
    }
  };

  const handleSuspend = async (user) => {
    const action = user.status === "active" ? "suspend" : "activate";
    if (!window.confirm(`${action === "suspend" ? "Suspend" : "Activate"} user ${user.name}?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE}/api/users/${user._id || user.id}/status`,
        { status: action === "suspend" ? "inactive" : "active" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`User ${action === "suspend" ? "suspended" : "activated"} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/users/${user._id || user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted successfully");
      fetchUsers();
      if (selectedUser?._id === user._id || selectedUser?.id === user.id) {
        setDrawerOpen(false);
        setSelectedUser(null);
      }
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // ─── Table Column Config ─────────────────────────────────────────────────
  const columns = [
    { key: "name", label: "Profile", sortable: false },
    // { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone", sortable: true },
    { key: "role", label: "Role", sortable: true },
    // { key: "hospital", label: "Hospital", sortable: true },
    { key: "subscription", label: "Subscription", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "createdAt", label: "Created", sortable: true },
    // { key: "lastLogin", label: "Last Login", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  const getRoleVariant = (role) => {
  switch (role?.toLowerCase()) {
    case "superadmin":
      return "dark";

    case "admin":
      return "blue";

    case "guardian":
      return "orange";

    case "patient":
      return "emerald";

    default:
      return "default";
  }
};

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "active": case "verified": return "success";
      case "pending": return "warning";
      case "inactive": case "suspended": return "danger";
      default: return "default";
    }
  };

  const getSubscriptionVariant = (sub) => {
    switch (sub?.toLowerCase()) {
      case "premium": return "gold";
      case "basic": return "blue";
      case "free": return "gray";
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "active": case "verified": return <CheckCircle2 className="w-3 h-3" />;
      case "pending": return <AlertCircle className="w-3 h-3" />;
      case "inactive": case "suspended": return <XCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ─── Header ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Users className="w-6 h-6 text-[#2563EB]" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
            </div>
            <p className="text-sm text-slate-500 ml-[52px]">
              Manage all platform users including Super Admins, Hospital Admins, Guardians, and Patients.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={isRefreshing}
              onClick={fetchUsers}
            >
              Refresh
            </Button>
            <Button variant="secondary" icon={Download} onClick={handleExport}>
              Export Users
            </Button>
            {/* <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate("/superadmin/users/add")}
            >
              Add New User
            </Button> */}
          </div>
        </motion.div>

        {/* ─── Analytics Cards ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
        >
          <AnalyticsCard
            title="Super Admins"
            count={analytics.superAdmins}
            icon={Crown}
            color="blue"
            description="Platform administrators"
            trend="up"
            trendValue="12%"
            isLoading={isLoading}
          />
          <AnalyticsCard
            title="Hospital Admins"
            count={analytics.hospitalAdmins}
            icon={Hospital}
            color="emerald"
            description="Hospital managers"
            trend="up"
            trendValue="8%"
            isLoading={isLoading}
          />
          <AnalyticsCard
            title="Guardians"
            count={analytics.guardians}
            icon={UserCheck}
            color="orange"
            description="Patient guardians"
            trend="up"
            trendValue="24%"
            isLoading={isLoading}
          />
          <AnalyticsCard
            title="Patients"
            count={analytics.patients}
            icon={Stethoscope}
            color="purple"
            description="Registered patients"
            trend="up"
            trendValue="18%"
            isLoading={isLoading}
          />
        </motion.div>

        {/* ─── Filters Section ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-[20px] border border-slate-200 shadow-sm p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">Filters</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2">
              <div className="flex gap-2">
                <Select
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value)}
                  options={[
                    { value: "firstName", label: "Name" },
                    { value: "email", label: "Email" },
                    { value: "phone", label: "Phone" },
                  ]}
                  className="w-32 shrink-0"
                />
                <Input
                  placeholder={`Search by ${searchBy}...`}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  icon={Search}
                  className="flex-1"
                />
              </div>
            </div>
            <Select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              options={[
                { value: "all", label: "All Roles" },
                { value: "superadmin", label: "Super Admin" },
{ value: "admin", label: "Hospital Admin" },
                { value: "guardian", label: "Guardian" },
                { value: "patient", label: "Patient" },
              ]}
            />
            <Select
              value={hospitalFilter}
              onChange={(e) => { setHospitalFilter(e.target.value); setCurrentPage(1); }}
              options={[
                { value: "all", label: "All Hospitals" },
                ...hospitals.map((h) => ({ value: h._id || h.id, label: h.name })),
              ]}
            />
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              options={[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "pending", label: "Pending" },
                { value: "verified", label: "Verified" },
              ]}
            />
            <Select
              value={subscriptionFilter}
              onChange={(e) => { setSubscriptionFilter(e.target.value); setCurrentPage(1); }}
              options={[
                { value: "all", label: "All Subscriptions" },
                { value: "free", label: "Free" },
                { value: "basic", label: "Basic" },
                { value: "premium", label: "Premium" },
              ]}
            />
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
            </p>
            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>
        </motion.div>

        {/* ─── User Table ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                        col.sortable ? "cursor-pointer hover:text-slate-700 select-none" : ""
                      }`}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1.5">
                        {col.label}
                        {col.sortable && (
                          <ArrowUpDown className={`w-3.5 h-3.5 transition-colors ${
                            sortConfig.key === col.key ? "text-[#2563EB]" : "text-slate-300"
                          }`} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length}>
                      <EmptyState onAddUser={() => navigate("/superadmin/users/add")} />
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user, idx) => (
                    <motion.tr
                      key={user._id || user.id || idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => handleViewUser(user)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt={user.firstName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span className="text-sm font-bold text-blue-600">
                                {user.firstName?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-[#2563EB] transition-colors">
                              {user.firstName}
                            </p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* <td className="px-4 py-3.5">
                        <span className="text-sm text-slate-600">{user.email}</span>
                      </td> */}
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-slate-600">{user.phone || "—"}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={getRoleVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      {/* <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-600">
  {user.hospitals?.length
    ? user.hospitals
        .map((id) => {
          const hospital = hospitals.find(
            (h) => h._id === (id._id || id)
          );
          return hospital?.name || "Unknown";
        })
        .join(", ")
    : "—"}
</span>
                      </td> */}
                      <td className="px-4 py-3.5">
                        <Badge variant={getSubscriptionVariant(user.subscription)}>
                          {user.subscription || "Free"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={getStatusVariant(user.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(user.status)}
                            {user.accountStatus}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-slate-500">
                          {user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy") : "—"}
                        </span>
                      </td>
                      {/* <td className="px-4 py-3.5">
                        <span className="text-sm text-slate-500">
                          {user.lastLogin ? format(new Date(user.lastLogin), "MMM dd, HH:mm") : "—"}
                        </span>
                      </td> */}
                      <td className="px-4 py-3.5">
                        <div onClick={(e) => e.stopPropagation()}>
                          <ActionMenu
                            user={user}
                            onView={handleViewUser}
                            onEdit={handleEditUser}
                            onResetPassword={handleResetPassword}
                            onChangeRole={handleChangeRole}
                            onAssignHospital={handleAssignHospital}
                            onSuspend={handleSuspend}
                            onDelete={handleDelete}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ─── Pagination ──────────────────────────────────────────────── */}
          {!isLoading && paginatedUsers.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredUsers.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />
          )}
        </motion.div>
      </div>

      {/* ─── User Drawer ───────────────────────────────────────────────── */}
      <UserDrawer
        user={selectedUser}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEdit={handleEditUser}
        onResetPassword={handleResetPassword}
        onDeactivate={handleSuspend}
        onDelete={handleDelete}
        onAssignHospital={handleAssignHospital}
        onAssignGuardian={() => {}}
      />
    </div>
  );
};

export default UserManagement;
