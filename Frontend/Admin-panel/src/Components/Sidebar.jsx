import {
  LayoutDashboard,
  Users,
  Pill,
  Calendar,
  FileText,
  ClipboardList,
  HeartPulse,
  CheckCircle2,
  Settings,
  Activity,
  Delete,
  Trash2,
  Building2,
  UserPlus,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const superAdminMenu = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/",
  },
  {
    icon: Users,
    label: "Admins",
    path: "/admins",
  },
  {
    icon: Building2,
    label: "Hospitals",
    path: "/hospitals",
  },
  {
    icon: ShieldCheck,
    label: "Caretakers",
    path: "/caretakers",
  },
  {
    icon: Users,
    label: "Patients",
    path: "/patients",
  },
  {
    icon: Pill,
    label: "Medications",
    path: "/medications",
  },
  {
    icon: Calendar,
    label: "Schedule",
    path: "/today-schedule",
  },
  {
    icon: FileText,
    label: "Prescriptions",
    path: "/prescriptions",
  },
  {
    icon: ClipboardList,
    label: "Reports",
    path: "/reports",
  },
  {
    icon: HeartPulse,
    label: "Vitals",
    path: "/vitals",
  },
  {
    icon: CheckCircle2,
    label: "Compliance",
    path: "/compliance",
  },
  {
    icon: Trash2,
    label: "Deleted Selfies",
    path: "/deletedselfie",
  },
  {
    icon: User,
    label: "User Management",
    path: "/users",
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/settings",
  },
];

const adminMenu = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/",
  },
  {
    icon: Users,
    label: "Patients",
    path: "/patients",
  },
  {
    icon: ShieldCheck,
    label: "Caretakers",
    path: "/caretakers",
  },
  {
    icon: Pill,
    label: "Medications",
    path: "/medications",
  },
  {
    icon: Calendar,
    label: "Schedule",
    path: "/today-schedule",
  },
  {
    icon: FileText,
    label: "Prescriptions",
    path: "/prescriptions",
  },
  {
    icon: ClipboardList,
    label: "Reports",
    path: "/reports",
  },
  {
    icon: HeartPulse,
    label: "Vitals",
    path: "/vitals",
  },
  {
    icon: CheckCircle2,
    label: "Compliance",
    path: "/compliance",
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/settings",
  },
];

const guardianMenu = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/guardian",
  },
  {
    icon: Calendar,
    label: "Medication History",
    path: "/guardian/history",
  },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const role = localStorage.getItem("role");

  const menuItems =
    role === "superadmin"
      ? superAdminMenu
      : role === "guardian"
      ? guardianMenu
      : adminMenu;

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`
          w-[270px] md:w-[260px] h-screen bg-white border-r border-gray-200 flex flex-col px-4 py-5 fixed left-0 top-0 z-50
          transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0 shadow-2xl md:shadow-none" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* LOGO & CLOSE BUTTON */}
        <div className="flex items-center justify-between px-2 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-black flex items-center justify-center shadow-xs flex-shrink-0">
              <img
                src="/medikto_icon.png"
                alt="Medikto Healthcare"
                className="w-6 h-6 object-contain"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-blue-600 tracking-tight leading-none">
                Medikto
              </h1>

              <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">
                {role === "guardian"
                  ? "Guardian Portal"
                  : role === "superadmin"
                  ? "Super Admin"
                  : "Clinician Portal"}
              </p>
            </div>
          </div>

          {/* Close button visible only on mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MENU LINKS */}
        <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto scrollbar-hide pr-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={index}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all relative
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-600 shadow-xs"
                      : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />

                    <span className="truncate">{item.label}</span>

                    {isActive && (
                      <div className="absolute right-0 top-2 bottom-2 w-1 rounded-full bg-blue-600" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}