import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  LogOut,
  Shield,
  Clock,
  User,
  Menu,
  X,
  Heart
} from "lucide-react";

export default function GuardianLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    navigate("/guardian/login", { replace: true });
  };

  const navItems = [
    {
      to: "/guardian",
      label: "Today's Schedule",
      icon: LayoutDashboard,
    },
    {
      to: "/guardian/history",
      label: "Medication History",
      icon: CalendarCheck,
    },
  ];

  const guardianName = guardianUser
    ? `${guardianUser.firstName || ""} ${guardianUser.lastName || ""}`.trim() || guardianUser.email || "Guardian"
    : "Guardian";

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
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* FIXED SIDEBAR (DESKTOP) & DRAWER (MOBILE) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-[260px] bg-white border-r border-gray-200 flex flex-col justify-between p-5 transition-transform duration-200 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div>
          {/* LOGO & BRANDING */}
          <div className="flex items-center gap-3 px-2 mb-8 pt-2">
            <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center shadow-sm">
              <img
                src="/medikto_icon.png"
                alt="Medikto Healthcare"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-600 tracking-tight">Medikto</h1>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Guardian Portal
              </p>
            </div>
          </div>

          {/* MONITORING BADGE */}
          <div className="mb-6 px-3 py-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-2 text-xs text-blue-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium">Live Medication Monitor</span>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="flex flex-col gap-1.5">
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
                    flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon size={19} className={isActive ? "text-white" : "text-gray-500"} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* GUARDIAN USER PROFILE & LOGOUT */}
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex items-center gap-3 px-2 py-2 mb-3 rounded-xl bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              {guardianName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {guardianName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {guardianUser?.email || "Family Guardian"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut size={16} />
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
        <header className="bg-white border-b border-gray-200 px-6 py-4 hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-800">
              {location.pathname === "/guardian/history"
                ? "Medication Adherence History"
                : "Today's Medication Schedule"}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700">
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
        <main className="p-4 md:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
