import {
  Bell,
  HelpCircle,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  User,
  X,
  Shield,
  HeartPulse,
  Building2,
  Users,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

export default function Header({
  patients = [],
  medications = [],
  reports = [],
  currentUser: propUser = null,
}) {
  const navigate = useNavigate();

  // ═══════════════════════════════════════════════════════════════════════════
  // DYNAMIC USER STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Listen for storage changes (login from another tab)
  useEffect(() => {
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem("user");
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Use prop user if provided, otherwise fall back to localStorage
  const currentUser = propUser || user || {};
  const userRole = currentUser?.role || localStorage.getItem("role") || "";

  // ═══════════════════════════════════════════════════════════════════════════
  // DYNAMIC PROFILE DATA BASED ON ROLE
  // ═══════════════════════════════════════════════════════════════════════════
  const getProfileData = () => {
    const base = {
      name: currentUser?.name || currentUser?.firstName || currentUser?.displayName || "User",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      profilePic: currentUser?.profilePic || currentUser?.avatar || currentUser?.photoURL || "",
      role: userRole,
    };

    switch (userRole) {
      case "superadmin":
      case "super_admin":
        return {
          ...base,
          displayRole: "Super Admin",
          badge: { text: "Super Admin", icon: Shield, color: "bg-amber-50 text-amber-700 border-amber-200" },
          subtitle: base.email,
          showSearch: true,
          showNotifications: true,
          showSettings: true,
          showHelp: true,
        };

      case "hospital_admin":
      case "hospitaladmin":
        return {
          ...base,
          displayRole: "Hospital Admin",
          hospitalName: currentUser?.hospitalName || currentUser?.hospital?.name || "",
          badge: { text: "Hospital Admin", icon: Building2, color: "bg-blue-50 text-blue-700 border-blue-200" },
          subtitle: base.hospitalName || base.email,
          showSearch: true,
          showNotifications: true,
          showSettings: true,
          showHelp: true,
        };

      case "guardian":
        return {
          ...base,
          displayRole: "Guardian",
          linkedPatientsCount: currentUser?.linkedPatients?.length || currentUser?.patients?.length || 0,
          badge: { text: "Guardian", icon: Users, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
          subtitle: `${base.linkedPatientsCount || 0} Linked Patient${(base.linkedPatientsCount || 0) !== 1 ? "s" : ""}`,
          showSearch: true,
          showNotifications: true,
          showSettings: false,
          showHelp: true,
        };

      case "patient":
      case "user":
        return {
          ...base,
          displayRole: "Patient",
          subscription: currentUser?.subscription || currentUser?.plan || "Basic",
          badge: { text: currentUser?.subscription || "Patient", icon: HeartPulse, color: "bg-purple-50 text-purple-700 border-purple-200" },
          subtitle: base.email,
          showSearch: true,
          showNotifications: true,
          showSettings: true,
          showHelp: true,
        };

      default:
        return {
          ...base,
          displayRole: "User",
          badge: null,
          subtitle: base.email,
          showSearch: true,
          showNotifications: true,
          showSettings: true,
          showHelp: true,
        };
    }
  };

  const profile = getProfileData();

  // ═══════════════════════════════════════════════════════════════════════════
  // SEARCH STATE
  // ═══════════════════════════════════════════════════════════════════════════
  const [search, setSearch] = useState("");

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const helpRef = useRef(null);

  // ================= CLOSE DROPDOWNS =================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        helpRef.current &&
        !helpRef.current.contains(event.target)
      ) {
        setShowHelp(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ================= ROLE-AWARE GLOBAL SEARCH =================

  const globalResults = useMemo(() => {
    if (!search.trim()) return [];

    const lower = search.toLowerCase();
    const results = [];

    // Super Admin: Search everything
    if (userRole === "superadmin" || userRole === "super_admin") {
      const patientResults = patients
        .filter(
          (item) =>
            item?.firstName?.toLowerCase().includes(lower) ||
            item?.phone?.toLowerCase().includes(lower) ||
            item?.email?.toLowerCase().includes(lower)
        )
        .map((item) => ({
          type: "Patient",
          title: item?.firstName || item?.name || item?.phone,
          subtitle: item?.email || item?.phone,
        }));

      const medicationResults = medications
        .filter((item) => item?.name?.toLowerCase().includes(lower))
        .map((item) => ({
          type: "Medication",
          title: item?.name,
          subtitle: item?.dosage || item?.frequency,
        }));

      const reportResults = reports
        .filter((item) => item?.title?.toLowerCase().includes(lower))
        .map((item) => ({
          type: "Report",
          title: item?.title,
          subtitle: item?.category || "Medical Report",
        }));

      results.push(...patientResults, ...medicationResults, ...reportResults);
    }

    // Hospital Admin: Search hospital patients only
    else if (userRole === "hospital_admin" || userRole === "hospitaladmin") {
      const hospitalPatients = patients
        .filter(
          (item) =>
            item?.hospitalId === currentUser?.hospitalId ||
            item?.hospital === currentUser?.hospitalName
        )
        .filter(
          (item) =>
            item?.firstName?.toLowerCase().includes(lower) ||
            item?.phone?.toLowerCase().includes(lower)
        )
        .map((item) => ({
          type: "Patient",
          title: item?.firstName || item?.name || item?.phone,
          subtitle: item?.email || item?.phone,
        }));

      results.push(...hospitalPatients);
    }

    // Guardian: Search linked patients only
    else if (userRole === "guardian") {
      const linkedPatientIds = currentUser?.linkedPatients || currentUser?.patients || [];
      const guardianPatients = patients
        .filter((item) => linkedPatientIds.includes(item?._id || item?.id))
        .filter(
          (item) =>
            item?.firstName?.toLowerCase().includes(lower) ||
            item?.phone?.toLowerCase().includes(lower)
        )
        .map((item) => ({
          type: "Patient",
          title: item?.firstName || item?.name || item?.phone,
          subtitle: item?.email || item?.phone,
        }));

      results.push(...guardianPatients);
    }

    // Patient: Search own medications, reports, vitals
    else if (userRole === "patient" || userRole === "user") {
      const patientId = currentUser?._id || currentUser?.id;

      const ownMedications = medications
        .filter((item) => item?.patientId === patientId || item?.patient === patientId)
        .filter((item) => item?.name?.toLowerCase().includes(lower))
        .map((item) => ({
          type: "Medication",
          title: item?.name,
          subtitle: item?.dosage || item?.frequency,
        }));

      const ownReports = reports
        .filter((item) => item?.patientId === patientId || item?.patient === patientId)
        .filter((item) => item?.title?.toLowerCase().includes(lower))
        .map((item) => ({
          type: "Report",
          title: item?.title,
          subtitle: item?.category || "Medical Report",
        }));

      results.push(...ownMedications, ...ownReports);
    }

    return results.slice(0, 8);
  }, [search, patients, medications, reports, userRole, currentUser]);

  // ================= COMPLETE LOGOUT =================

 const handleLogout = () => {
  // Clear all localStorage
  localStorage.clear();

  // Clear all sessionStorage
  sessionStorage.clear();

  // Reset state
  setUser(null);
  setShowProfileMenu(false);
  setShowNotifications(false);
  setShowHelp(false);

  // Redirect to login
  navigate("/login", { replace: true });
};

  // ================= ROLE-AWARE NOTIFICATIONS =================

  const getNotifications = () => {
    switch (userRole) {
      case "superadmin":
      case "super_admin":
        return [
          { title: "New hospital registered", time: "2 mins ago", type: "platform" },
          { title: "System backup completed", time: "1 hour ago", type: "platform" },
          { title: "New super admin login detected", time: "3 hours ago", type: "security" },
        ];

      case "hospital_admin":
      case "hospitaladmin":
        return [
          { title: "New patient admitted", time: "5 mins ago", type: "hospital" },
          { title: "Medication schedule updated", time: "20 mins ago", type: "hospital" },
          { title: "Doctor assignment pending", time: "1 hour ago", type: "hospital" },
        ];

      case "guardian":
        return [
          { title: "Patient vitals abnormal", time: "10 mins ago", type: "alert" },
          { title: "Medication missed", time: "30 mins ago", type: "alert" },
          { title: "New health report available", time: "2 hours ago", type: "info" },
        ];

      case "patient":
      case "user":
        return [
          { title: "Time to take your medication", time: "Just now", type: "reminder" },
          { title: "Upcoming doctor appointment", time: "30 mins ago", type: "reminder" },
          { title: "New prescription added", time: "2 hours ago", type: "info" },
        ];

      default:
        return [
          { title: "Welcome to Medikto", time: "Just now", type: "info" },
        ];
    }
  };

  const notifications = getNotifications();

  // ================= HELP MENU =================

  const getHelpOptions = () => {
    switch (userRole) {
      case "superadmin":
      case "super_admin":
        return ["Platform Dashboard", "User Management Guide", "System Settings", "Contact Engineering"];
      case "hospital_admin":
      case "hospitaladmin":
        return ["Hospital Dashboard", "Patient Management", "Staff Guide", "Contact Support"];
      case "guardian":
        return ["Guardian Guide", "Patient Monitoring", "Alert Settings", "Contact Support"];
      case "patient":
      case "user":
        return ["Patient Guide", "Medication Tracker", "Report History", "Contact Support"];
      default:
        return ["Dashboard Guide", "Contact Support", "System Documentation"];
    }
  };

  const helpOptions = getHelpOptions();

  // ================= RENDER =================

  return (
    <header className="h-[70px] bg-white border-b border-gray-200 px-8 flex items-center justify-between relative">

      {/* SEARCH */}

      {profile.showSearch && (
        <div className="relative w-[380px]">

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder={
              userRole === "superadmin"
                ? "Search patients, medications, reports..."
                : userRole === "hospital_admin" || userRole === "hospitaladmin"
                ? "Search hospital patients..."
                : userRole === "guardian"
                ? "Search linked patients..."
                : "Search your medications & reports..."
            }
            className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-10 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
          />

          {search && (
            <button
              onClick={() =>
                setSearch("")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {/* SEARCH RESULTS */}

          {search &&
            globalResults.length > 0 && (
              <div className="absolute top-14 left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">

                {globalResults.map(
                  (item, index) => (
                    <button
                      key={index}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-none transition"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {item.title}
                        </h4>

                        <span className="text-[10px] uppercase font-bold text-blue-600">
                          {item.type}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        {item.subtitle}
                      </p>
                    </button>
                  )
                )}
              </div>
            )}
        </div>
      )}

      {/* Spacer when search is hidden */}
      {!profile.showSearch && <div />}

      {/* RIGHT */}

      <div className="flex items-center gap-6">

        {/* NOTIFICATION */}

        {profile.showNotifications && (
          <div
            className="relative"
            ref={notificationRef}
          >
            <button
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
              className="relative text-gray-500 hover:text-black transition"
            >
              <Bell className="w-5 h-5" />

              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">

                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">
                    Notifications
                  </h3>
                </div>

                <div className="max-h-[320px] overflow-y-auto">

                  {notifications.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={index}
                        className="px-5 py-4 hover:bg-gray-50 border-b border-gray-100 last:border-none"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.title}
                          </h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            item.type === "alert" ? "bg-red-50 text-red-600" :
                            item.type === "reminder" ? "bg-blue-50 text-blue-600" :
                            item.type === "security" ? "bg-amber-50 text-amber-600" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {item.type}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          {item.time}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* HELP */}

        {profile.showHelp && (
          <div
            className="relative"
            ref={helpRef}
          >
            <button
              onClick={() =>
                setShowHelp(!showHelp)
              }
              className="text-gray-500 hover:text-black transition"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {showHelp && (
              <div className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">

                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">
                    Help Center
                  </h3>
                </div>

                <div className="py-2">

                  {helpOptions.map(
                    (
                      item,
                      index
                    ) => (
                      <button
                        key={index}
                        className="w-full text-left px-5 py-3 hover:bg-gray-50 text-sm text-gray-700 transition"
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROFILE */}

        <div
          className="relative"
          ref={profileRef}
        >
          <button
            onClick={() =>
              setShowProfileMenu(
                !showProfileMenu
              )
            }
            className="flex items-center gap-3 cursor-pointer"
          >

            <div className="relative">
              <img
                src={
                  profile.profilePic ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=2563EB&color=fff&size=100`
                }
                alt={profile.name}
                className="w-10 h-10 rounded-full object-cover border"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=2563EB&color=fff&size=100`;
                }}
              />
              {profile.badge && (
                <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${profile.badge.color.split(" ")[0]}`}>
                  <profile.badge.icon size={8} className={profile.badge.color.split(" ")[1]} />
                </span>
              )}
            </div>

            <div className="leading-tight text-left">
              <h4 className="text-sm font-semibold text-gray-900">
                {profile.name}
              </h4>

              <p className="text-xs text-gray-500">
                {profile.subtitle}
              </p>
            </div>

            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* PROFILE MENU */}

          {showProfileMenu && (
            <div className="absolute right-0 top-14 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">

              <div className="px-5 py-5 border-b border-gray-100">

                <div className="flex items-center gap-3">

                  <div className="relative">
                    <img
                      src={
                        profile.profilePic ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=2563EB&color=fff&size=100`
                      }
                      alt={profile.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=2563EB&color=fff&size=100`;
                      }}
                    />
                    {/* {profile.badge && (
                      <span className={`absolute -bottom-0.5 -right-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold border-2 border-white ${profile.badge.color}`}>
                        {profile.badge.text}
                      </span>
                    )} */}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {profile.name}
                    </h4>

                    <p className="text-sm text-gray-500 truncate">
                      {profile.email}
                    </p>

                    {userRole === "hospital_admin" && profile.hospitalName && (
                      <p className="text-xs text-blue-600 font-medium mt-0.5 truncate">
                        {profile.hospitalName}
                      </p>
                    )}

                    {userRole === "patient" && profile.subscription && (
                      <p className="text-xs text-purple-600 font-medium mt-0.5">
                        {profile.subscription} Plan
                      </p>
                    )}

                    {userRole === "guardian" && (
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">
                        {profile.linkedPatientsCount || 0} Linked Patient{(profile.linkedPatientsCount || 0) !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="py-2">

                {/* <button className="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-50 text-sm text-gray-700 transition">
                  <User className="w-4 h-4" />
                  My Profile
                </button> */}

                {profile.showSettings && (
  <button
    onClick={() => navigate("/settings")}
    className="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-50 text-sm text-gray-700 transition"
  >
    <Settings className="w-4 h-4" />
    Settings
  </button>
)}

                <button
                  onClick={handleLogout}
                  className="w-full px-5 py-3 flex items-center gap-3 hover:bg-red-50 text-sm text-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}