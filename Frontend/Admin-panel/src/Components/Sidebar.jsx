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
  // {
  //   icon: UserPlus,
  //   label: "Hospital Requests",
  //   path: "/hospital-requests",
  // },
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
  // {
  //   icon: UserPlus,
  //   label: "Hospital Requests",
  //   path: "/hospital-requests",
  // },
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
    path: "/",
  },
  {
    icon: Users,
    label: "My Patients",
    path: "/patients",
  },
   {
    icon: ClipboardList,
    label: "Pending Requests",
    path: "/pendingrequests"
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
    icon: Settings,
    label: "Settings",
    path: "/settings",
  },
];

// const role = (localStorage.getItem("role") || "").toLowerCase();

export default function Sidebar() {
  const role = localStorage.getItem("role");

  const menuItems =
    role === "superadmin"
      ? superAdminMenu
      : role === "guardian"
      ? guardianMenu
      : adminMenu;
  return (
    <aside className="w-[260px] h-screen bg-white border-r border-gray-200 flex flex-col px-4 py-6 fixed left-0 top-0">
      {/* LOGO */}
      <div className="flex items-center gap-3 px-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-black backdrop-blur flex items-center justify-center">
  <img
    src="/Medikto.logo.png"
    alt="Medikto Healthcare"
    className="w-full max-w-md xl:max-w-lg object-contain drop-shadow-2xl"
  />          </div>

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
      <nav
  className="flex-1 flex flex-col gap-2 overflow-y-auto scrollbar-hide pr-1"
>
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
      {/* <div className="mt-auto">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 w-full">
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div> */}
    </aside>
  );
}