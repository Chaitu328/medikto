import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  User,
  Pill,
  Heart,
  FileText,
  FileSpreadsheet,
  Activity,
  Key,
  LogOut,
  Clock,
  Menu,
  X,
  ChevronDown,
  Users,
  ShieldCheck
} from "lucide-react";
import {
  GuardianPatientProvider,
  useGuardianPatient,
} from "./GuardianPatientContext";

function GuardianLayoutInner({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    patients,
    selectedPatientId,
    setSelectedPatientId,
    selectedPatient,
    loadingPatients,
  } = useGuardianPatient();

  const [guardianUser, setGuardianUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    sessionStorage.removeItem("guardian_selected_patient_id");
    navigate("/guardian/login", { replace: true });
  };

  const navItems = [
    {
      to: "/guardian",
      label: "Today's Schedule",
      icon: LayoutDashboard,
    },
    {
      to: "/guardian/profile",
      label: "Patient Profile",
      icon: User,
    },
    {
      to: "/guardian/medications",
      label: "Medications",
      icon: Pill,
    },
    {
      to: "/guardian/history",
      label: "Dose History",
      icon: CalendarCheck,
    },
    {
      to: "/guardian/vitals",
      label: "Vitals",
      icon: Heart,
    },
    {
      to: "/guardian/reports",
      label: "Reports",
      icon: FileText,
    },
    {
      to: "/guardian/prescriptions",
      label: "Prescriptions",
      icon: FileSpreadsheet,
    },
    {
      to: "/guardian/compliance",
      label: "Compliance",
      icon: Activity,
    },
    {
      to: "/guardian/change-password",
      label: "Change Password",
      icon: Key,
    },
  ];

  const guardianName = guardianUser
    ? `${guardianUser.firstName || ""} ${guardianUser.lastName || ""}`.trim() ||
      guardianUser.email ||
      "Guardian"
    : "Guardian";

  const patientDisplayName = selectedPatient
    ? `${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`.trim() ||
      selectedPatient.phone ||
      "Linked Patient"
    : "Select Patient";

  // Dynamic header title according to route
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/guardian":
        return "Today's Medication Schedule";
      case "/guardian/profile":
        return "Patient Profile & Emergency Contacts";
      case "/guardian/medications":
        return "Medication Regimens";
      case "/guardian/history":
        return "Medication Adherence History";
      case "/guardian/vitals":
        return "Patient Vitals & Telemetry";
      case "/guardian/reports":
        return "Lab & Diagnostic Reports";
      case "/guardian/prescriptions":
        return "Prescriptions & Dosage Orders";
      case "/guardian/compliance":
        return "Patient Compliance & Adherence";
      case "/guardian/change-password":
        return "Security & Password Management";
      default:
        return "Guardian Portal";
    }
  };

  return (
    <div className="bg-[#F5F7FB] min-h-screen flex flex-col md:flex-row">
      {/* MOBILE TOP BAR */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center">
            <img
              src="/medikto_icon.png"
              alt="Medikto"
              className="w-5 h-5 object-contain"
            />
          </div>
          <div>
            <span className="font-bold text-blue-600 text-lg">Medikto</span>
            <span className="ml-1 text-xs text-gray-500 font-medium">Guardian</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {patients.length > 1 && (
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 font-semibold text-gray-800 focus:outline-none"
            >
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {`${p.firstName || ""} ${p.lastName || ""}`.trim() || p.phone || "Patient"}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* FIXED SIDEBAR (DESKTOP) & DRAWER (MOBILE) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-[260px] bg-white border-r border-gray-200 flex flex-col justify-between p-5 transition-transform duration-200 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="overflow-y-auto pr-1">
          {/* LOGO & BRANDING */}
          <div className="flex items-center gap-3 px-2 mb-6 pt-2">
            <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center shadow-sm">
              <img
                src="/medikto_icon.png"
                alt="Medikto Healthcare"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-600 tracking-tight">Medikto</h1>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-600" />
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Guardian Portal
                </p>
              </div>
            </div>
          </div>

          {/* PATIENT SELECTOR IN SIDEBAR */}
          <div className="mb-5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Users size={12} /> Active Patient
              </span>
              {patients.length > 1 && (
                <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                  {patients.length} linked
                </span>
              )}
            </div>

            {loadingPatients ? (
              <div className="h-8 bg-slate-200 animate-pulse rounded-lg" />
            ) : patients.length > 1 ? (
              <div className="relative">
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-xl py-2 pl-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                >
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {`${p.firstName || ""} ${p.lastName || ""}`.trim() || p.phone || "Patient"}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none"
                />
              </div>
            ) : (
              <div className="font-bold text-xs text-slate-800 truncate px-1">
                {patientDisplayName}
              </div>
            )}
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === "/guardian"
                  ? location.pathname === "/guardian"
                  : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/guardian"}
                  className={`
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon size={17} className={isActive ? "text-white" : "text-gray-400"} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* GUARDIAN USER PROFILE & LOGOUT */}
        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {guardianName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-800 truncate">
                {guardianName}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {guardianUser?.email || "Family Guardian"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* BACKDROP FOR MOBILE */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen">
        {/* TOP HEADER */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 hidden md:flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {getPageTitle()}
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Read-Only Caretaker & Family View
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            {/* Global Patient Switcher Badge */}
            {patients.length > 1 && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-medium text-slate-500">Patient:</span>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {`${p.firstName || ""} ${p.lastName || ""}`.trim() || p.phone || "Patient"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700">
              <Clock size={14} className="text-blue-500" />
              <span>
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}{" "}
                •{" "}
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          </div>
        </header>

        {/* MAIN PAGE BODY */}
        <main className="p-4 md:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function GuardianLayout({ children }) {
  return (
    <GuardianPatientProvider>
      <GuardianLayoutInner>{children}</GuardianLayoutInner>
    </GuardianPatientProvider>
  );
}
