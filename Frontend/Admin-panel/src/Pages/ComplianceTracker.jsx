import {
  Search,
  Bell,
  HelpCircle,
  Download,
  AlertTriangle,
  ShieldCheck,
  UserX,
  Plus,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api/axios";

export default function ComplianceTracker() {
  // ================= STATES =================
  const [users, setUsers] =
    useState([]);

  const [
    medications,
    setMedications,
  ] = useState([]);

  const [today, setToday] =
    useState([]);

  const [reports, setReports] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  // ================= FETCH DATA =================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData =
    async () => {
      try {
        setLoading(true);

        const [
          usersRes,
          medicationsRes,
          todayRes,
          reportsRes,
        ] =
          await Promise.all([
            api.get("/users"),

            api.get(
              "/medications"
            ),

            api.get("/today"),

            api.get(
              "/reports"
            ),
          ]);

        setUsers(
  Array.isArray(
    usersRes.data
  )
    ? usersRes.data
    : usersRes.data
        ?.users || []
);

       setMedications(
  Array.isArray(
    medicationsRes.data
  )
    ? medicationsRes.data
    : medicationsRes.data
        ?.medications || []
);

setToday(
  Array.isArray(
    todayRes.data
  )
    ? todayRes.data
    : todayRes.data
        ?.doses || []
);

setReports(
  Array.isArray(
    reportsRes.data
  )
    ? reportsRes.data
    : reportsRes.data
        ?.reports || []
        );
      } catch (error) {
        console.log(
          error
        );
      } finally {
        setLoading(false);
      }
    };

  // ================= ANALYTICS =================
  const completed =
    today.filter(
      (d) => d?.taken
    ).length;

  const pending =
    today.length -
    completed;

  const compliance =
    today.length > 0
      ? Math.round(
          (completed /
            today.length) *
            100
        )
      : 0;

  const highRisk =
    today.filter(
      (d) => !d?.taken
    ).length;

  // ================= FILTER USERS =================
  const filteredUsers =
    useMemo(() => {
      return users.filter(
        (user) =>
          user?.firstName
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          user?.phone?.includes(
            search
          )
      );
    }, [users, search]);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-8">
      {/* ================= TOPBAR ================= */}
      {/* <div className="flex items-center justify-between mb-8">
        <div className="relative w-[420px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search patients..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white outline-none"
          />
        </div>

        <div className="flex items-center gap-5">
          <Bell className="w-5 h-5 text-gray-600" />

          <HelpCircle className="w-5 h-5 text-gray-600" />
        </div>
      </div> */}

      {/* ================= HEADER ================= */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-[42px] font-bold text-[#111827]">
            Compliance Tracking
          </h1>

          <p className="text-gray-500 text-lg mt-2">
            Monitor medication adherence and patient compliance.
          </p>
        </div>

        <button className="h-14 px-7 rounded-2xl bg-[#2563EB] text-white font-semibold shadow-lg flex items-center gap-3">
          <Download className="w-5 h-5" />

          Export Report
        </button>
      </div>

      {/* ================= ANALYTICS ================= */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {/* CARD */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm text-gray-400">
                Average Compliance
              </p>

              <h2 className="text-4xl font-bold mt-3">
                {compliance}%
              </h2>
            </div>

            <div className="w-16 h-16 rounded-full border-[6px] border-[#2563EB] flex items-center justify-center text-sm font-bold text-[#2563EB]">
              {compliance}%
            </div>
          </div>

          <p className="text-sm text-green-600 font-medium">
            Real-time adherence
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm text-gray-400">
                Missed Doses
              </p>

              <h2 className="text-4xl font-bold mt-3">
                {pending}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>

          <p className="text-sm text-red-600 font-medium">
            Pending medications
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm text-gray-400">
                High-Risk Patients
              </p>

              <h2 className="text-4xl font-bold mt-3">
                {highRisk}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
              <UserX className="w-5 h-5 text-orange-600" />
            </div>
          </div>

          <p className="text-sm text-orange-600 font-medium">
            Needs attention
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm text-gray-400">
                Verification Rate
              </p>

              <h2 className="text-4xl font-bold mt-3">
                {compliance}%
              </h2>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
          </div>

          <p className="text-sm text-green-600 font-medium">
            Secure verification
          </p>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold">
            Patient Compliance Roster
          </h2>
        </div>

        {/* TABLE */}
        <table className="w-full">
          <thead className="bg-[#F9FAFB]">
            <tr className="text-left text-sm text-gray-400">
              <th className="p-5">
                Patient
              </th>

              <th>
                Compliance
              </th>

              <th>
                Medications
              </th>

              <th>
                Missed
              </th>

              <th>
                Risk
              </th>

              <th>
                Activity
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map(
              (
                user,
                index
              ) => {
                const userMeds =
                  medications.filter(
                    (m) =>
                      m?.user
                        ?._id ===
                      user?._id
                  );

                const userToday =
                  today.filter(
                    (t) =>
                      t?.user
                        ?._id ===
                      user?._id
                  );

                const completed =
                  userToday.filter(
                    (
                      t
                    ) =>
                      t?.taken
                  ).length;

                const score =
                  userToday.length >
                  0
                    ? Math.round(
                        (completed /
                          userToday.length) *
                          100
                      )
                    : 0;

                const missed =
                  userToday.length -
                  completed;

                const risk =
                  score >= 80
                    ? "Low"
                    : score >=
                      50
                    ? "High"
                    : "Critical";

                return (
                  <tr
                    key={
                      index
                    }
                    className="border-t border-gray-100 hover:bg-[#F8FAFC]"
                  >
                    {/* PATIENT */}
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            user?.profilePic ||
                            `https://ui-avatars.com/api/?name=${user?.firstName}`
                          }
                          alt=""
                          className="w-11 h-11 rounded-full object-cover"
                        />

                        <div>
                          <h4 className="font-semibold">
                            {user?.firstName ||
                              "Patient"}
                          </h4>

                          <p className="text-sm text-gray-400">
                            {
                              user?.phone
                            }
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SCORE */}
                    <td
                      className={`font-semibold ${
                        score >=
                        80
                          ? "text-green-600"
                          : score >=
                            50
                          ? "text-orange-600"
                          : "text-red-600"
                      }`}
                    >
                      {score}%
                    </td>

                    {/* MEDS */}
                    <td>
                      {
                        userMeds.length
                      }
                    </td>

                    {/* MISSED */}
                    <td>
                      {missed}
                    </td>

                    {/* RISK */}
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          risk ===
                          "Low"
                            ? "bg-green-100 text-green-700"
                            : risk ===
                              "High"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {risk}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td>
                      <span className="text-green-600 font-medium">
                        Active
                      </span>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>

        {/* FOOTER */}
        <div className="flex items-center justify-between p-5 border-t border-gray-100 text-sm text-gray-500">
          <span>
            Total Patients:
            {" "}
            {
              filteredUsers.length
            }
          </span>

          <div className="flex gap-2">
            <button className="px-4 h-9 rounded-lg border border-gray-200">
              Prev
            </button>

            <button className="px-4 h-9 rounded-lg border border-gray-200">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}