import { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  Calendar,
  HeartPulse,
  Droplets,
  Ruler,
  Weight,
  Building2,
  Crown,
  ShieldCheck,
  Activity,
  Users,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useGuardianPatient } from "./GuardianPatientContext";
import api from "../../Api/axios";

export default function GuardianProfile() {
  const { selectedPatientId, selectedPatient, loading: patientLoading } = useGuardianPatient();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPatientProfile = async () => {
    if (!selectedPatientId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      // Fetch full patient data from /users?patientId=...
      const res = await api.get(`/users?patientId=${selectedPatientId}`);
      const usersList = Array.isArray(res.data?.users)
        ? res.data.users
        : Array.isArray(res.data)
        ? res.data
        : [];
      
      const found = usersList.find((u) => u._id === selectedPatientId) || usersList[0] || selectedPatient;
      setProfileData(found);
    } catch (err) {
      console.error("[GuardianProfile] Error loading profile:", err);
      // Fallback to selectedPatient from context if /users endpoint encounters an issue
      if (selectedPatient) {
        setProfileData(selectedPatient);
      } else {
        setError("Unable to load patient profile information.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientProfile();
  }, [selectedPatientId, selectedPatient]);

  if (patientLoading || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-gray-500">Loading patient profile...</p>
        </div>
      </div>
    );
  }

  if (!selectedPatientId || (!profileData && !selectedPatient)) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto border border-gray-200/80 shadow-sm mt-8">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Patient Selected</h3>
        <p className="text-sm text-gray-500">
          Please select a linked family member or patient from the selector above to view their medical profile.
        </p>
      </div>
    );
  }

  const p = profileData || selectedPatient || {};
  const patientName = `${p.firstName || ""} ${p.lastName || ""}`.trim() || p.name || "Patient";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER BANNER */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-blue-200">
            {p.profilePic ? (
              <img
                src={p.profilePic}
                alt={patientName}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              patientName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{patientName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Patient
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <span>Patient ID: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono">{p._id}</code></span>
              {p.relation && (
                <span className="text-indigo-600 font-medium">• Relation: {p.relation}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck size={14} />
            Read-Only Guardian Access
          </span>
          <button
            onClick={fetchPatientProfile}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Refresh Profile"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* CORE VITALS & DEMOGRAPHICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* AGE */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Age</span>
            <Calendar size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{p.age ? `${p.age} yrs` : "—"}</p>
          <span className="text-xs text-gray-400 mt-1 block">Demographics</span>
        </div>

        {/* GENDER */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Gender</span>
            <User size={18} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 capitalize">{p.gender || "—"}</p>
          <span className="text-xs text-gray-400 mt-1 block">Biological Info</span>
        </div>

        {/* BLOOD GROUP */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Blood Group</span>
            <Droplets size={18} className="text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600">{p.bloodGroup || "—"}</p>
          <span className="text-xs text-gray-400 mt-1 block">Medical Marker</span>
        </div>

        {/* BMI / MEASUREMENTS */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Height & Weight</span>
            <HeartPulse size={18} className="text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-gray-900">
            {p.height ? `${p.height} cm` : "—"} • {p.weight ? `${p.weight} kg` : "—"}
          </p>
          <span className="text-xs text-gray-400 mt-1 block">Physical Vitals</span>
        </div>
      </div>

      {/* DETAILED INFORMATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CONTACT & ACCOUNT DETAILS */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            Contact & Account Details
          </h2>

          <div className="divide-y divide-gray-100 text-sm">
            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <Phone size={15} className="text-gray-400" />
                Phone Number
              </span>
              <span className="font-semibold text-gray-900">{p.phone || "—"}</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <Mail size={15} className="text-gray-400" />
                Email Address
              </span>
              <span className="font-semibold text-gray-900">{p.email || "—"}</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <Clock size={15} className="text-gray-400" />
                Timezone
              </span>
              <span className="font-mono text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                {p.timezone || "Asia/Kolkata (IST)"}
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <ShieldCheck size={15} className="text-gray-400" />
                Account Status
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                {p.accountStatus || "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* SUBSCRIPTION & HOSPITAL LINKS */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Crown size={18} className="text-amber-500" />
            Plan & Clinical Connections
          </h2>

          <div className="divide-y divide-gray-100 text-sm">
            <div className="py-3 flex items-center justify-between">
              <span className="text-gray-500 flex items-center gap-2">
                <Sparkles size={15} className="text-amber-500" />
                Medikto Plan
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                {p.subscription || "Basic"}
              </span>
            </div>

            <div className="py-3 flex items-start justify-between gap-4">
              <span className="text-gray-500 flex items-center gap-2 mt-0.5">
                <Building2 size={15} className="text-blue-500" />
                Connected Hospitals
              </span>
              <div className="text-right">
                {Array.isArray(p.hospitals) && p.hospitals.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {p.hospitals.map((h, i) => (
                      <span key={i} className="font-semibold text-gray-900 text-xs">
                        {typeof h === "object" ? h.name : `Hospital #${i + 1}`}
                      </span>
                    ))}
                  </div>
                ) : p.hospital ? (
                  <span className="font-semibold text-gray-900 text-xs">
                    {typeof p.hospital === "object" ? p.hospital.name : "Connected Clinic"}
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">None linked</span>
                )}
              </div>
            </div>

            {/* FAMILY MEMBERS / EMERGENCY */}
            {Array.isArray(p.familyMembers) && p.familyMembers.length > 0 && (
              <div className="py-3">
                <span className="text-gray-500 flex items-center gap-2 mb-2">
                  <Users size={15} className="text-purple-500" />
                  Family Members
                </span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {p.familyMembers.map((fm, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                      <p className="font-bold text-gray-800">{fm.name}</p>
                      <p className="text-gray-500">{fm.relation} {fm.age ? `(${fm.age}y)` : ""}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
