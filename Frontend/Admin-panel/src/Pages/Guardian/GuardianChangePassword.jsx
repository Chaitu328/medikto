import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, KeyRound, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import api from "../../Api/axios";

export default function GuardianChangePassword() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.put("/guardian/change-password", {
        oldPassword,
        newPassword,
      });

      if (res.data?.success !== false) {
        setSuccess(true);
        // Update local user object
        try {
          const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
          storedUser.mustChangePassword = false;
          storedUser.isFirstLogin = false;
          localStorage.setItem("user", JSON.stringify(storedUser));
        } catch (e) {
          console.error("Failed to update stored user:", e);
        }

        setTimeout(() => {
          navigate("/guardian", { replace: true });
        }, 1500);
      } else {
        setError(res.data?.message || "Failed to update password.");
      }
    } catch (err) {
      console.error("Change password error:", err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to change password. Please verify your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      {/* BRAND HEADER */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-black/10 mb-3">
          <img
            src="/medikto_icon.png"
            alt="Medikto"
            className="w-9 h-9 object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Medikto Guardian</h1>
        <p className="text-sm text-gray-500 mt-0.5">Secure Password Setup</p>
      </div>

      {/* CARD */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <KeyRound size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Set New Password</h2>
            <p className="text-xs text-gray-500">
              Please change your temporary password to continue
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>Password updated successfully! Redirecting to Dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Current / Temporary Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter temporary password"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all text-gray-800 placeholder:text-gray-400"
              />
              <Lock size={16} className="absolute left-3.5 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter at least 6 characters"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all text-gray-800 placeholder:text-gray-400"
              />
              <KeyRound size={16} className="absolute left-3.5 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all text-gray-800 placeholder:text-gray-400"
              />
              <KeyRound size={16} className="absolute left-3.5 top-3 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Updating Password...</span>
            ) : (
              <>
                <span>Save Password & Continue</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Encrypted and secured by Medikto</span>
        </div>
      </div>
    </div>
  );
}
