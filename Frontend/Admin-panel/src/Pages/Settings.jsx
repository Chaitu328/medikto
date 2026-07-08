// =====================================================
// Medikto Healthcare Platform - Settings Page
// File: Settings.jsx
// =====================================================

import React, { useState, useEffect, useCallback } from "react";
import {
  Settings,
  ShieldCheck,
  Lock,
  KeyRound,
  Bell,
  Moon,
  Sun,
  Monitor,
  UserCircle,
  Hospital,
  Users,
  HeartHandshake,
  Info,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Mail,
  Phone,
  Building2,
  Stethoscope,
  Activity,
  FileText,
  HelpCircle,
  LogOut,
  Save,
  Check,
} from "lucide-react";
import api from "../Api/axios.js";


// =====================================================
// CONSTANTS & CONFIG
// =====================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.medikto.com/api";

const TABS = [
  { id: "account", label: "Account", icon: UserCircle },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Moon },
  { id: "about", label: "About", icon: Info },
];

const PASSWORD_REQUIREMENTS = [
  { id: "minLength", label: "Minimum 8 characters", regex: /.{8,}/ },
  { id: "uppercase", label: "Uppercase letter", regex: /[A-Z]/ },
  { id: "lowercase", label: "Lowercase letter", regex: /[a-z]/ },
  { id: "number", label: "Number", regex: /[0-9]/ },
  { id: "special", label: "Special character", regex: /[!@#$%^&*(),.?":{}|<>]/ },
];

// =====================================================
// UTILITY COMPONENTS
// =====================================================

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  };

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-lg animate-in slide-in-from-top-2 fade-in duration-300 ${styles[type]}`}
    >
      {icons[type]}
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const ToggleSwitch = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex-1 pr-4">
      <p className="font-semibold text-gray-900 text-sm">{label}</p>
      {description && <p className="text-gray-500 text-xs mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-14 h-8 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
        checked ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

const RoleBadge = ({ role }) => {
  const configs = {
    superadmin: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Super Admin" },
    admin: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Hospital Admin" },
    guardian: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Guardian" },
  };

  const config = configs[role] || configs.admin;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}>
      {role === "superadmin" && <ShieldCheck className="w-3 h-3" />}
      {role === "admin" && <Building2 className="w-3 h-3" />}
      {role === "guardian" && <HeartHandshake className="w-3 h-3" />}
      {config.label}
    </span>
  );
};

// =====================================================
// SECTION COMPONENTS
// =====================================================

const AccountSection = ({
  user,
  loading,
 platformStats,
  pendingInvitations,
}) => {  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-3 flex-1">
              <Skeleton className="w-48 h-6" />
              <Skeleton className="w-64 h-4" />
              <Skeleton className="w-32 h-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  const getAvatarColor = (role) => {
    const colors = {
      superadmin: "bg-amber-100 text-amber-700",
      admin: "bg-blue-100 text-blue-700",
      guardian: "bg-emerald-100 text-emerald-700",
    };
    return colors[role] || colors.admin;
  };
   console.log("AccountSection User:", user);
  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 transition-all duration-300 hover:shadow-md">
        <div className="flex items-start gap-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold ${getAvatarColor(user?.role)}`}>
            {getInitials(user?.firstName || user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{user?.firstName || user?.name || "User"}</h2>
              <RoleBadge role={user?.role} />
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{user?.email || "Not available"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{user?.phoneNumber || user?.phone || "Not available"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Specific Cards */}
      {user?.role === "superadmin" && <SuperAdminInfoCard
  user={user}
  stats={platformStats}
/>}
      {user?.role === "admin" && <HospitalAdminInfoCard user={user} />}
{user?.role === "guardian" && (
  <GuardianInfoCard
    user={user}
    pendingInvitations={pendingInvitations}
  />
)}    </div>
  );
};

const SuperAdminInfoCard = ({ user, stats }) => (  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 transition-all duration-300 hover:shadow-md">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
        <ShieldCheck className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900">Platform Information</h3>
        <p className="text-sm text-gray-500">Overview of the Medikto platform</p>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Hospitals", value: stats?.hospitals || 0, icon: Hospital, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Admins", value: stats?.admins || 0, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Guardians", value: stats?.guardians || 0, icon: HeartHandshake, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Patients", value: stats?.patients || 0, icon: Stethoscope, color: "text-red-600", bg: "bg-red-50" },
      ].map((stat) => (
        <div key={stat.label} className="bg-gray-50 rounded-2xl p-5 text-center transition-transform duration-200 hover:scale-[1.02]">
          <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-3`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
        </div>
      ))}
    </div>

    <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-gray-500">Version</span>
        <span className="text-sm font-semibold text-gray-900">{user?.version || "1.0.0"}</span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-gray-500">Environment</span>
        <span className="text-sm font-semibold text-gray-900">{user?.environment || "Production"}</span>
      </div>
    </div>
  </div>
);

const HospitalAdminInfoCard = ({ user }) => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 transition-all duration-300 hover:shadow-md">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
        <Hospital className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900">Hospital Information</h3>
        <p className="text-sm text-gray-500">Details about your hospital</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { label: "Hospital Name", value: user?.hospitalName || user?.hospital?.name || "Not available", icon: Hospital },
        { label: "Email", value: user?.hospitalEmail || user?.email || "Not available", icon: Mail },
        { label: "Phone", value: user?.hospitalPhone || user?.phone || "Not available", icon: Phone },
        { label: "Address", value: user?.hospitalAddress || user?.hospital?.address || "Not available", icon: Building2 },
        { label: "Admin Name", value: user?.firstName || user?.name || "Not available", icon: UserCircle },
      ].map((field) => (
        <div key={field.label} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 transition-colors hover:bg-gray-100">
          <field.icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{field.label}</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{field.value}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const GuardianInfoCard = ({ user, pendingInvitations }) => (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 transition-all duration-300 hover:shadow-md">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
        <HeartHandshake className="w-5 h-5 text-emerald-600" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900">Guardian Information</h3>
        <p className="text-sm text-gray-500">Your guardian profile details</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { label: "Guardian Name", value: user?.firstName || user?.name || "Not available", icon: UserCircle },
        { label: "Email", value: user?.email || "Not available", icon: Mail },
        { label: "Phone", value: user?.phoneNumber || user?.phone || "Not available", icon: Phone },
        { label: "Status", value: user?.status || "Active", icon: Activity, isStatus: true },
      ].map((field) => (
        <div key={field.label} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 transition-colors hover:bg-gray-100">
          <field.icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{field.label}</p>
            {field.isStatus ? (
              <span className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                field.value === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${field.value === "Active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                {field.value}
              </span>
            ) : (
              <p className="text-sm font-semibold text-gray-900 mt-1">{field.value}</p>
            )}
          </div>
        </div>
      ))}
    </div>

    <div className="mt-6 grid grid-cols-1 sm:grid-cols-1 gap-4">
      <div className="bg-emerald-50 rounded-2xl p-5 text-center transition-transform duration-200 hover:scale-[1.02]">
        <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900">{user?.guardianFor?.length || 0}</p>
        <p className="text-xs text-gray-500 mt-1 font-medium">Patients Assigned</p>
      </div>
      {/* <div className="bg-amber-50 rounded-2xl p-5 text-center transition-transform duration-200 hover:scale-[1.02]">
        <Bell className="w-6 h-6 text-amber-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900">{pendingInvitations || 0}</p>
        <p className="text-xs text-gray-500 mt-1 font-medium">Pending Invitations</p>
      </div> */}
    </div>
  </div>
);

const SecuritySection = ({ user, onToast }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });


  const checkRequirements = (password) => {
    setRequirements({
      minLength: /.{8,}/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleNewPasswordChange = (e) => {
    const val = e.target.value;
    setNewPassword(val);
    checkRequirements(val);
  };

  const getStrength = () => {
    const passed = Object.values(requirements).filter(Boolean).length;
    if (passed <= 1) return { label: "Weak", color: "bg-red-500", width: "20%" };
    if (passed <= 3) return { label: "Fair", color: "bg-amber-500", width: "50%" };
    if (passed <= 4) return { label: "Good", color: "bg-blue-500", width: "75%" };
    return { label: "Strong", color: "bg-emerald-500", width: "100%" };
  };

  const strength = getStrength();
  const allMet = Object.values(requirements).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allMet) {
      onToast("Please meet all password requirements", "error");
      return;
    }
    if (!passwordsMatch) {
      onToast("Passwords do not match", "error");
      return;
    }
    if (!currentPassword) {
      onToast("Please enter your current password", "error");
      return;
    }

    setLoading(true);
    try {
      const endpoint =
  user?.role === "admin"
    ? "/admin/change-password"
    : "/guardian/change-password";

await api.put(endpoint, {
  oldPassword: currentPassword,
  newPassword,
});

      onToast("Password updated successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setRequirements({
        minLength: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });
    } catch (error) {
      onToast(error?.response?.data?.message || "Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  // Super Admin - Google Auth
  if (user?.role === "superadmin") {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Lock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Security</h3>
            <p className="text-sm text-gray-500">Account authentication settings</p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Google Authentication</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                This account uses Google Authentication. You can manage your password from your Google Account.
              </p>
              <button
                onClick={() => window.open("https://myaccount.google.com/security", "_blank")}
                className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                <KeyRound className="w-4 h-4" />
                Manage Google Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Lock className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Security</h3>
          <p className="text-sm text-gray-500">Protect your account with a strong password</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={handleNewPasswordChange}
              className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Strength Indicator */}
          {newPassword.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-500">Password Strength</span>
                <span className={`text-xs font-bold ${
                  strength.label === "Weak" ? "text-red-500" :
                  strength.label === "Fair" ? "text-amber-500" :
                  strength.label === "Good" ? "text-blue-500" : "text-emerald-500"
                }`}>{strength.label}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
            </div>
          )}

          {/* Requirements */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PASSWORD_REQUIREMENTS.map((req) => (
              <div
                key={req.id}
                className={`flex items-center gap-2 text-xs transition-colors duration-300 ${
                  requirements[req.id] ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {requirements[req.id] ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
                )}
                <span className={requirements[req.id] ? "font-semibold" : ""}>{req.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 pr-12 rounded-2xl border bg-gray-50 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                confirmPassword.length > 0
                  ? passwordsMatch
                    ? "border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-500"
                    : "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                  : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
              }`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-xs text-red-500 mt-1.5 font-medium">Passwords do not match</p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !allMet || !passwordsMatch || !currentPassword}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white text-sm font-semibold rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const NotificationsSection = ({ user }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    medicationAlerts: true,
    appointmentAlerts: true,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationItems = [
    {
      key: "emailNotifications",
      label: "Email Notifications",
      description: "Receive important updates via email",
      icon: Mail,
    },
    {
      key: "pushNotifications",
      label: "Push Notifications",
      description: "Get real-time alerts on your device",
      icon: Bell,
    },
    {
      key: "medicationAlerts",
      label: "Medication Alerts",
      description: "Reminders for medication schedules",
      icon: Activity,
    },
    {
      key: "appointmentAlerts",
      label: "Appointment Alerts",
      description: "Notifications for upcoming appointments",
      icon: CalendarIcon,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
          <p className="text-sm text-gray-500">Manage your notification preferences</p>
        </div>
      </div>

      <div className="mt-6 divide-y divide-gray-100">
        {notificationItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between py-4 group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <item.icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.description}</p>
              </div>
            </div>
            <ToggleSwitch
              checked={settings[item.key]}
              onChange={() => handleToggle(item.key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Calendar icon component
const CalendarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const AppearanceSection = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    // Apply theme logic here
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      prefersDark ? document.documentElement.classList.add("dark") : document.documentElement.classList.remove("dark");
    }
  };

  const themes = [
    { id: "light", label: "Light Mode", description: "Clean and bright interface", icon: Sun },
    { id: "dark", label: "Dark Mode", description: "Easy on the eyes", icon: Moon },
    { id: "system", label: "System Default", description: "Follows your device", icon: Monitor },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Moon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Appearance</h3>
          <p className="text-sm text-gray-500">Customize your visual experience</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => handleThemeChange(t.id)}
            className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
              theme === t.id
                ? "border-blue-500 bg-blue-50/50 shadow-md"
                : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
            }`}
          >
            {theme === t.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              theme === t.id ? "bg-blue-100" : "bg-gray-100"
            }`}>
              <t.icon className={`w-6 h-6 ${theme === t.id ? "text-blue-600" : "text-gray-500"}`} />
            </div>
            <p className={`font-bold text-sm ${theme === t.id ? "text-blue-900" : "text-gray-900"}`}>{t.label}</p>
            <p className="text-xs text-gray-500 mt-1">{t.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

const AboutSection = () => {
  const links = [
    { label: "Privacy Policy", icon: FileText, href: "/privacy" },
    { label: "Terms of Service", icon: FileText, href: "/terms" },
    { label: "Support", icon: HelpCircle, href: "/support" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">About Medikto</h3>
            <p className="text-sm text-gray-500">Information about the platform</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-600">Version</span>
          <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">1.0.0</span>
        </div>

        <div className="mt-6 space-y-2">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <link.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{link.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// MAIN SETTINGS COMPONENT
// =====================================================

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [pendingInvitations, setPendingInvitations] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [platformStats, setPlatformStats] = useState({
  hospitals: 0,
  admins: 0,
  guardians: 0,
  patients: 0,
});


  useEffect(() => {
  const fetchPlatformStats = async () => {
    if (user?.role !== "superadmin") return;

    try {
     const [hospitalsRes, guardiansRes, usersRes] = await Promise.all([
  api.get("/hospitals"),
  api.get("/guardians"),
  api.get("/users"),
]);

const users = usersRes.data.users || [];

setPlatformStats({
  hospitals: hospitalsRes.data.count || 0,
  guardians: guardiansRes.data.guardians?.length || 0,
  admins: users.filter((u) => u.role === "admin").length,
  patients: users.filter((u) => u.role === "patient").length,
});
    } catch (err) {
      console.error(err);
    }
  };

  fetchPlatformStats();
}, [user]);

  // Detect role from localStorage or auth context
  const detectUserRole = useCallback(() => {
    try {
      // Try localStorage first
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed;
      }

      // Fallback: try auth token payload
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return { role: payload.role || payload.userType || "admin", ...payload };
      }

      // Default fallback for demo
      return { role: "admin", fullName: "Dr. Sarah Johnson", email: "sarah.johnson@medikto.com", phoneNumber: "+1 (555) 123-4567" };
    } catch (e) {
      return { role: "admin", fullName: "Dr. Sarah Johnson", email: "sarah.johnson@medikto.com", phoneNumber: "+1 (555) 123-4567" };
    }
  }, []);

  // useEffect(() => {
  //   const userData = detectUserRole();
  //   // Simulate API fetch for full user data
  //   setTimeout(() => {
  //     setUser(userData);
  //     setLoading(false);
  //   }, 800);
  // }, [detectUserRole]);

  useEffect(() => {
    const localUser = detectUserRole();
    if (localUser && localUser.role === "superadmin") {
      setUser({
        role: "superadmin",
        firstName: "Super",
        name: "Admin",
        email: "admin@medikto.com",
        phone: "Not available",
        version: "1.0.0",
        environment: "Production",
      });
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [detectUserRole]);

useEffect(() => {
  const fetchInvitations = async () => {
    try {
      const res = await api.get("/guardian/invitations");
      setPendingInvitations(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
    }
  };

  if (user?.role === "guardian") {
    fetchInvitations();
  }
}, [user]);
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return <AccountSection
  user={user}
  loading={loading}
  platformStats={platformStats}
  pendingInvitations={pendingInvitations}
/>
      case "security":
        return <SecuritySection user={user} onToast={showToast} />;
      case "notifications":
        return <NotificationsSection user={user} />;
      case "appearance":
        return <AppearanceSection />;
      case "about":
        return <AboutSection />;
      default:
        return <AccountSection user={user} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your account preferences and security</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-3 sticky top-8">
              <nav className="space-y-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                      {tab.label}
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Mobile Tab Selector */}
          <div className="lg:hidden">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 overflow-x-auto">
              <div className="flex gap-1 min-w-max">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage