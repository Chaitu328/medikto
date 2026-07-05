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
} from "lucide-react";
import axios from "axios";
// import { toast } from "react-toastify";

// ─── AXIOS INSTANCE ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const isVerified = status === "Verified" || status === "active" || status === true;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isVerified
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      {isVerified ? (
        <CheckCircle2 size={12} className="text-emerald-500" />
      ) : (
        <XCircle size={12} className="text-red-500" />
      )}
      {isVerified ? "Verified" : "Not Verified"}
    </span>
  );
};

// ─── SUBSCRIPTION BADGE ─────────────────────────────────────────────────────────
const SubscriptionBadge = ({ subscription }) => {
  const configs = {
    Premium: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    Basic: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    Free: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
  };
  const cfg = configs[subscription] || configs.Free;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {subscription || "Free"}
    </span>
  );
};

// ─── AVATAR ─────────────────────────────────────────────────────────────────────
const Avatar = ({ name, src, size = 36 }) => {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "A";
  return (
    <div
      className="rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB] font-semibold text-xs overflow-hidden flex-shrink-0 border border-gray-100"
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

// ─── SKELETON TABLE ROW ───────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b border-gray-100">
    <td className="px-5 py-4"><div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="w-24 h-4 rounded bg-gray-100 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="w-28 h-4 rounded bg-gray-100 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="w-16 h-5 rounded-full bg-gray-100 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="w-20 h-5 rounded-full bg-gray-100 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="w-24 h-4 rounded bg-gray-100 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="w-6 h-4 rounded bg-gray-100 animate-pulse" /></td>
  </tr>
);

// ─── ACTION MENU ──────────────────────────────────────────────────────────────
const ActionMenu = ({
  admin,
  onView,
  onEdit,
  onDisable,
  onDelete,
}) => {  const [open, setOpen] = useState(false);
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
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 py-1.5 z-50">
          <button onClick={() => { onView(); setOpen(false); }} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
            <Eye size={14} className="text-gray-400" /> View Details
          </button>
          <button onClick={() => { onEdit(); setOpen(false); }} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
            <Edit3 size={14} className="text-gray-400" /> Edit Admin
          </button>
          <button
  onClick={() => {
    onDisable();
    setOpen(false);
  }}
  className={`w-full px-4 py-2 text-sm flex items-center gap-2.5 transition-colors ${
    admin.isVerified
      ? "text-amber-700 hover:bg-amber-50"
      : "text-emerald-700 hover:bg-emerald-50"
  }`}
>
  <Ban
    size={14}
    className={
      admin.isVerified
        ? "text-amber-500"
        : "text-emerald-500"
    }
  />

  {admin.isVerified ? "Disable Admin" : "Enable Admin"}
</button>
          <div className="mx-3 my-1 h-px bg-gray-100" />
          <button onClick={() => { onDelete(); setOpen(false); }} className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
            <Trash2 size={14} /> Delete Admin
          </button>
        </div>
      )}
    </div>
  );
};

// ─── INFO ROW (for drawer) ───────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
      <Icon size={14} className="text-gray-400" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value || "N/A"}</p>
    </div>
  </div>
);

// ─── ADMIN DETAILS DRAWER ─────────────────────────────────────────────────────
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
      <div className="fixed inset-0 bg-gray-900/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl shadow-gray-900/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Admin Details</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar name={admin.name || admin.firstName} src={admin.profilePic || admin.avatar} size={64} />
              <div className="min-w-0">
                <h4 className="text-lg font-semibold text-gray-900">{admin.name || admin.firstName || "N/A"}</h4>
                <p className="text-sm text-gray-500">{admin.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <StatusBadge status={admin.status || admin.isVerified} />
                  <SubscriptionBadge subscription={admin.subscription || admin.plan} />
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="space-y-4">
              <InfoRow icon={Phone} label="Phone Number" value={admin.phone} />
              <InfoRow icon={Mail} label="Email" value={admin.email} />
              <InfoRow icon={Shield} label="Role" value={admin.role} />
              <InfoRow icon={User} label="Age" value={admin.age} />
              <InfoRow icon={User} label="Gender" value={admin.gender} />
              <InfoRow icon={HeartPulse} label="Blood Group" value={admin.bloodGroup} />
              <InfoRow icon={Ruler} label="Height" value={admin.height} />
              <InfoRow icon={Weight} label="Weight" value={admin.weight} />
              <InfoRow icon={Clock} label="Timezone" value={admin.timezone} />
              <InfoRow icon={Calendar} label="Created" value={formatDateTime(admin.createdAt)} />
              <InfoRow icon={Calendar} label="Updated" value={formatDateTime(admin.updatedAt)} />
              <InfoRow icon={Users} label="Family Members" value={admin.familyMembersCount || admin.familyMembers?.length || 0} />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 border-t border-gray-100 space-y-3">
          <button onClick={() => onEdit(admin)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            <Edit3 size={16} /> Edit Admin
          </button>
          <button onClick={() => onDisable(admin)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-amber-600 border border-amber-200 rounded-xl text-sm font-medium hover:bg-amber-50 transition-colors">
            <Ban size={16} /> Disable Admin
          </button>
          <button onClick={() => onDelete(admin)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
            <Trash2 size={16} /> Delete Admin
          </button>
        </div>
      </div>
    </>
  );
};

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
const EmptyState = ({ onCreate }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-5">
      <User size={28} className="text-gray-300" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900">No Admins Found</h3>
    <p className="text-sm text-gray-500 mt-1.5 text-center max-w-sm">
      There are currently no administrator accounts.
    </p>
    <button
      onClick={onCreate}
      className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      <Plus size={16} /> Create Admin
    </button>
  </div>
);

// ─── PAGINATION ───────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  const start = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
      <p className="text-xs text-gray-500 font-medium">
        Showing {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-gray-600 px-2">
          {currentPage} / {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────
const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // ─── FETCH ADMINS ───────────────────────────────────────────────────────────
 const fetchAdmins = async () => {
  try {
    setLoading(true);

    const response = await api.get("/users");

    console.log(response.data);

    const allUsers = response.data.users || [];

    const adminUsers = allUsers.filter(
      (user) => user.role === "admin" || user.role === "hospital_admin"
    );

    console.log("Admins:", adminUsers);

    setAdmins(adminUsers);
  } catch (error) {
    console.error(error);
    setAdmins([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ─── FILTER & SORT ──────────────────────────────────────────────────────────
  const filteredAdmins = useMemo(() => {
    let result = [...admins];

    // Search
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

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((a) => {
        const status = a.status || a.isVerified;
        if (statusFilter === "active") return status === "Verified" || status === "active" || status === true;
        if (statusFilter === "inactive") return status === "Not Verified" || status === "inactive" || status === false;
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
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
    toast.info("Edit admin — implement modal");
    console.log("Edit admin:", admin);
  };

  const handleDisable = async (admin) => {
  try {
    const enable = !admin.isVerified;

    await api.patch(`/admins/${admin._id}/status`, {
      isVerified: enable,
    });

    await fetchAdmins();

    alert(
      `Admin ${enable ? "enabled" : "disabled"} successfully`
    );
  } catch (error) {
    alert(error.response?.data?.message || "Something went wrong");
  }
};

  const handleDelete = async (admin) => {
    if (!window.confirm(`Are you sure you want to delete ${admin.name || admin.firstName}?`)) return;
    try {
      await api.delete(`/admins/${admin._id || admin.id}`);
      toast.success("Admin deleted");
      setDrawerOpen(false);
      await fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete admin");
    }
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ─── PAGE HEADER ────────────────────────────────────────────────────── */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admins</h1>
            <p className="text-sm text-gray-500 mt-1">Manage all administrator accounts.</p>
          </div>
          <button
            onClick={() => toast.info("Add admin — implement modal")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Admin
          </button>
        </div>
      </div>

      {/* ─── STATS ──────────────────────────────────────────────────────────── */}
      <div className="px-8 pb-6">
        <p className="text-sm font-medium text-gray-600">
          Total Admins: <span className="text-gray-900 font-semibold">{admins.length}</span>
        </p>
      </div>

      {/* ─── SEARCH & FILTERS ─────────────────────────────────────────────── */}
      <div className="px-8 pb-6">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name or Phone"
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 pl-4 pr-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer font-medium"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 pl-4 pr-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer font-medium"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ─── TABLE ──────────────────────────────────────────────────────────── */}
      <div className="px-8 pb-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm">
                  {["Profile", "Name", "Phone", "Subscription", "Status", "Created", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
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
                      <EmptyState onCreate={() => toast.info("Add admin — implement modal")} />
                    </td>
                  </tr>
                ) : (
                  paginatedAdmins.map((admin) => (
                    <tr
                      key={admin._id || admin.id}
                      onClick={() => handleView(admin)}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer"
                      style={{ height: 58 }}
                    >
                      <td className="px-5 py-3">
                        <Avatar name={admin.name || admin.firstName} src={admin.profilePic || admin.avatar} />
                      </td>
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{admin.name || admin.firstName || "N/A"}</p>
                          <p className="text-xs text-gray-500">{admin.role || "Admin"}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-gray-700 font-medium">{admin.phone || "N/A"}</span>
                      </td>
                      <td className="px-5 py-3">
                        <SubscriptionBadge subscription={admin.subscription || admin.plan} />
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={admin.status || admin.isVerified} />
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-gray-500">{formatDate(admin.createdAt)}</span>
                      </td>
                      <td className="px-5 py-3">
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