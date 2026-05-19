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
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuItems = [
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
    icon: Trash2,
    label: "DeletedSelfie",
    path:"/deletedselfie",
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
    label: "Compliance Tracking",
    path: "/compliance",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-[260px] h-screen bg-white border-r border-gray-200 flex flex-col px-4 py-6 fixed left-0 top-0">
      {/* LOGO */}
      <div className="flex items-center gap-3 px-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <Activity className="text-white w-5 h-5" />
        </div>

        <div>
          <h1 className="text-[22px] font-bold text-blue-600">
            Medikto
          </h1>

          <p className="text-sm text-gray-500">
            Clinician Portal
          </p>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5" />

                  {item.label}

                  {isActive && (
                    <div className="absolute right-0 top-2 bottom-2 w-1 rounded-full bg-blue-600"></div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* SETTINGS */}
      <div className="mt-auto">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 w-full">
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
    </aside>
  );
}