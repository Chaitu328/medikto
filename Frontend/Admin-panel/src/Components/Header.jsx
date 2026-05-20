import {
  Bell,
  HelpCircle,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  User,
  X,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

export default function Header({
  patients = [],
  medications = [],
  reports = [],
  currentUser = {},
}) {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [showProfileMenu, setShowProfileMenu] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showHelp, setShowHelp] =
    useState(false);

  const profileRef = useRef(null);

  const notificationRef = useRef(null);

  const helpRef = useRef(null);

  // ================= CLOSE DROPDOWNS =================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setShowProfileMenu(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setShowNotifications(false);
      }

      if (
        helpRef.current &&
        !helpRef.current.contains(
          event.target
        )
      ) {
        setShowHelp(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ================= GLOBAL SEARCH =================

  const globalResults = useMemo(() => {
    if (!search.trim()) return [];

    const lower = search.toLowerCase();

    const patientResults = patients
      .filter(
        (item) =>
          item?.firstName
            ?.toLowerCase()
            .includes(lower) ||
          item?.phone
            ?.toLowerCase()
            .includes(lower)
      )
      .map((item) => ({
        type: "Patient",
        title:
          item?.firstName ||
          item?.phone,
        subtitle:
          item?.email ||
          item?.phone,
      }));

    const medicationResults = medications
      .filter((item) =>
        item?.name
          ?.toLowerCase()
          .includes(lower)
      )
      .map((item) => ({
        type: "Medication",
        title: item?.name,
        subtitle: item?.dosage,
      }));

    const reportResults = reports
      .filter((item) =>
        item?.title
          ?.toLowerCase()
          .includes(lower)
      )
      .map((item) => ({
        type: "Report",
        title: item?.title,
        subtitle:
          item?.category ||
          "Medical Report",
      }));

    return [
      ...patientResults,
      ...medicationResults,
      ...reportResults,
    ].slice(0, 8);
  }, [
    search,
    patients,
    medications,
    reports,
  ]);

  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };

  // ================= MOCK NOTIFICATIONS =================

  const notifications = [
    {
      title:
        "New patient registered",
      time: "2 mins ago",
    },
    {
      title:
        "Medication reminder pending",
      time: "10 mins ago",
    },
    {
      title:
        "Vitals report uploaded",
      time: "30 mins ago",
    },
  ];

  // ================= HELP MENU =================

  const helpOptions = [
    "Dashboard Guide",
    "Contact Support",
    "System Documentation",
  ];

  return (
    <header className="h-[70px] bg-white border-b border-gray-200 px-8 flex items-center justify-between relative">

      {/* SEARCH */}

      <div className="relative w-[380px]">

        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search patients, medications, reports..."
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
          globalResults.length >
            0 && (
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

      {/* RIGHT */}

      <div className="flex items-center gap-6">

        {/* NOTIFICATION */}

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

            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">
              {
                notifications.length
              }
            </span>
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
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.title}
                      </h4>

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

        {/* HELP */}

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

            <img
              src={
                currentUser?.profilePic ||
                "https://i.pravatar.cc/100"
              }
              alt="Doctor"
              className="w-10 h-10 rounded-full object-cover border"
            />

            <div className="leading-tight text-left">
              <h4 className="text-sm font-semibold text-gray-900">
                {currentUser?.name ||
                  "Dr. Medikto"}
              </h4>

              <p className="text-xs text-gray-500">
                {currentUser?.role ||
                  "Cardiologist"}
              </p>
            </div>

            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* PROFILE MENU */}

          {showProfileMenu && (
            <div className="absolute right-0 top-14 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">

              <div className="px-5 py-5 border-b border-gray-100">

                <div className="flex items-center gap-3">

                  <img
                    src={
                      currentUser?.profilePic ||
                      "https://i.pravatar.cc/100"
                    }
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {currentUser?.name ||
                        "Dr. Medikto"}
                    </h4>

                    <p className="text-sm text-gray-500">
                      {currentUser?.email ||
                        "medikto@example.com"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="py-2">

                <button className="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-50 text-sm text-gray-700 transition">
                  <User className="w-4 h-4" />
                  My Profile
                </button>

                <button className="w-full px-5 py-3 flex items-center gap-3 hover:bg-gray-50 text-sm text-gray-700 transition">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>

                <button
                  onClick={
                    handleLogout
                  }
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