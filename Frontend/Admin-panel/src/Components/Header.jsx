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
  import api from "../Api/axios";

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
    name:
      currentUser?.name ||
      currentUser?.firstName ||
      currentUser?.displayName ||
      currentUser?.email?.split("@")[0] ||
      localStorage.getItem("name") ||
      "Super Admin",
    email:
      currentUser?.email ||
      localStorage.getItem("email") ||
      "",
    phone:
      currentUser?.phone || "",
    profilePic:
      currentUser?.profilePic ||
      currentUser?.avatar ||
      localStorage.getItem("avatar") ||
      "",
    role:
      userRole,
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
  linkedPatientsCount: Array.isArray(currentUser?.guardianFor)
    ? currentUser.guardianFor.length
    : 0,
    badge: { text: "Guardian", icon: Users, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  subtitle: `Linked Patients`,          showSearch: true,
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
            displayrole: "patient",
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
  const linkedPatientIds =
  currentUser?.guardianFor ||
  currentUser?.linkedPatients ||
  currentUser?.patients ||
  [];      const guardianPatients = patients
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
      else if (userRole === "patient" || userrole === "patient") {
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
    const role = localStorage.getItem("role");

    localStorage.clear();
    sessionStorage.clear();

    setUser(null);
    setShowProfileMenu(false);
    setShowNotifications(false);
    setShowHelp(false);

    if (role === "superadmin") {
      navigate("/superadmin/login", { replace: true });
    } else if (role === "guardian") {
      navigate("/guardian/login", { replace: true });
    } else {
      navigate("/admin/login", { replace: true });
    }
  };

    // ================= LIVE & ROLE-AWARE NOTIFICATIONS =================
    const [liveNotifications, setLiveNotifications] = useState([]);

    const fetchLiveNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        if (Array.isArray(res.data)) {
          setLiveNotifications(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    useEffect(() => {
      fetchLiveNotifications();
      const interval = setInterval(fetchLiveNotifications, 15000);
      const handleLinkSync = () => fetchLiveNotifications();
      window.addEventListener("hospital_link_updated", handleLinkSync);
      return () => {
        clearInterval(interval);
        window.removeEventListener("hospital_link_updated", handleLinkSync);
      };
    }, []);

    const formatRelativeTime = (isoString) => {
      if (!isoString) return "Just now";
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    };

    const displayNotifications = useMemo(() => {
      if (liveNotifications.length > 0) {
        return liveNotifications.map((n) => ({
          id: n._id,
          title: n.title,
          body: n.body,
          time: formatRelativeTime(n.createdAt),
          type: n.type || "alert",
          isRead: n.isRead,
          data: n.data || {},           // ← carry machine-readable payload
        }));
      }

      switch (userRole) {
        case "superadmin":
        case "super_admin":
          return [
            { title: "System Active", body: "All platform services operating normally", time: "Just now", type: "platform", data: {} },
          ];
        case "hospital_admin":
        case "hospitaladmin":
          return [
            { title: "Clinic Ready", body: "Patient connection service is active", time: "Just now", type: "hospital", data: {} },
          ];
        default:
          return [
            { title: "Welcome to Medikto", body: "Your account is active", time: "Just now", type: "info", data: {} },
          ];
      }
    }, [liveNotifications, userRole]);

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

    // ================= HOSPITAL LINK APPROVAL MODAL =================
    const [linkApprovalModal, setLinkApprovalModal] = useState({
      open: false,
      phone: "",
      patientName: "",
      hospitalName: "",
      notificationId: null,
      approving: false,
      approved: false,
      error: "",
    });

    const handleNotificationClick = (item) => {
      if (item?.data?.requestType === "hospital_link_request") {
        setShowNotifications(false);
        setLinkApprovalModal({
          open: true,
          phone: item.data.phone || "",
          patientName: item.data.patientName || "Patient",
          hospitalName: item.data.hospitalName || "Clinic",
          notificationId: item.id || null,
          approving: false,
          approved: false,
          error: "",
        });
      }
    };

    const handleApproveLink = async () => {
      setLinkApprovalModal((prev) => ({ ...prev, approving: true, error: "" }));
      try {
        await api.post("/hospitals/approve-link", { phone: linkApprovalModal.phone });
        setLinkApprovalModal((prev) => ({ ...prev, approving: false, approved: true }));
        fetchLiveNotifications(); // Refresh notification list
        window.dispatchEvent(new Event("hospital_link_updated"));
        setTimeout(() => {
          setLinkApprovalModal((prev) => ({ ...prev, open: false }));
        }, 2500);
      } catch (err) {
        const msg = err?.response?.data?.message || "Failed to approve connection. Please try again.";
        setLinkApprovalModal((prev) => ({ ...prev, approving: false, error: msg }));
      }
    };

    // ================= RENDER =================

    return (
      <>
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

                {displayNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">
                    {displayNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-88 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">

                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                    {liveNotifications.length > 0 && (
                      <button
                        onClick={async () => {
                          try {
                            await api.put("/notifications/read-all");
                            fetchLiveNotifications();
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100">

                    {displayNotifications.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={item.id || index}
                          onClick={() => handleNotificationClick(item)}
                          className={`px-5 py-3.5 transition border-l-2 ${
                            item?.data?.requestType === "hospital_link_request"
                              ? "border-blue-400 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                              : "border-transparent hover:bg-gray-50 cursor-default"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              {item?.data?.requestType === "hospital_link_request" && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 animate-pulse">
                                  Action Required
                                </span>
                              )}
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                item.type === "alert" ? "bg-red-50 text-red-600" :
                                item.type === "hospital_link" ? "bg-blue-50 text-blue-600" :
                                item.type === "reminder" ? "bg-blue-50 text-blue-600" :
                                item.type === "security" ? "bg-amber-50 text-amber-600" :
                                "bg-gray-100 text-gray-600"
                              }`}>
                                {item.type === "hospital_link" ? "Connection" : item.type}
                              </span>
                            </div>
                          </div>

                          {item.body && (
                            <p className="text-xs text-gray-700 mt-1 leading-relaxed break-words">
                              {item.body}
                            </p>
                          )}

                          <p className="text-[11px] text-gray-400 mt-1.5">
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
                          Linked Patient
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

      {/* ══════════════════════════════════════════════════════════
          HOSPITAL LINK APPROVAL MODAL
          Shown when admin clicks a 'hospital_link_request' notification
      ══════════════════════════════════════════════════════════ */}
      {linkApprovalModal.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          {/* Blurred backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !linkApprovalModal.approving && setLinkApprovalModal((p) => ({ ...p, open: false }))}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Patient Connection Request</h3>
                  <p className="text-blue-100 text-xs mt-0.5">{linkApprovalModal.hospitalName}</p>
                </div>
              </div>
              {!linkApprovalModal.approving && (
                <button
                  onClick={() => setLinkApprovalModal((p) => ({ ...p, open: false }))}
                  className="text-white/70 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              {linkApprovalModal.approved ? (
                /* Success state */
                <div className="flex flex-col items-center py-4 gap-3">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <p className="text-base font-semibold text-gray-900 text-center">
                    {linkApprovalModal.patientName} linked successfully!
                  </p>
                  <p className="text-sm text-gray-500 text-center">
                    They are now connected to {linkApprovalModal.hospitalName}.
                  </p>
                </div>
              ) : (
                /* Approval state */
                <>
                  <p className="text-sm text-gray-500 mb-5">
                    Review the patient's request and approve to link their Medikto profile to your clinic.
                  </p>

                  {/* Patient Info Card */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-base">
                        {linkApprovalModal.patientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{linkApprovalModal.patientName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{linkApprovalModal.phone}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Wants to connect to: <span className="font-semibold text-gray-800">{linkApprovalModal.hospitalName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Error */}
                  {linkApprovalModal.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                      <p className="text-xs text-red-600">{linkApprovalModal.error}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setLinkApprovalModal((p) => ({ ...p, open: false }))}
                      disabled={linkApprovalModal.approving}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={handleApproveLink}
                      disabled={linkApprovalModal.approving}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {linkApprovalModal.approving ? (
                        <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Approving...</>
                      ) : (
                        "Approve & Link"
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}