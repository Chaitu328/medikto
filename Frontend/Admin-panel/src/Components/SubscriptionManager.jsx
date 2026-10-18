import React, { useState } from "react";
import {
  Crown,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import api from "../Api/axios.js";
import { toast } from "react-toastify";

/**
 * SubscriptionManager Component
 * Allows authorized Super Admins to view subscription status and grant/extend/revoke
 * patient-specific Premium access with custom duration and audit confirmation.
 */
export default function SubscriptionManager({ patient, onUpdate, isSuperAdmin }) {
  const [durationDays, setDurationDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!patient) return null;

  const patientId = patient._id || patient.id;
  const subDetails = patient.subscriptionDetails || {};
  const effectiveSub = patient.effectiveSubscription || {};

  // Resolve plan and status
  const plan = (
    effectiveSub.plan ||
    subDetails.plan ||
    patient.subscription ||
    "basic"
  ).toLowerCase();

  const isPremium =
    effectiveSub.isPremium === true ||
    plan === "premium" ||
    (subDetails.plan === "premium" &&
      subDetails.subscriptionEnd &&
      new Date(subDetails.subscriptionEnd) > new Date());

  const status = (
    effectiveSub.status ||
    subDetails.status ||
    (isPremium ? "active" : "inactive")
  ).toLowerCase();

  const isTrial = status === "trial";
  const isExpired = status === "expired";
  const isAdminGrant = subDetails.grantType === "admin_grant";

  const subscriptionEnd = subDetails.subscriptionEnd
    ? new Date(subDetails.subscriptionEnd)
    : null;

  const subscriptionStart = subDetails.subscriptionStart
    ? new Date(subDetails.subscriptionStart)
    : null;

  const trialEnd = subDetails.trialEnd ? new Date(subDetails.trialEnd) : null;

  // Calculate days remaining
  const activeEndDate = subscriptionEnd || (isTrial ? trialEnd : null);
  let daysRemaining = null;
  if (activeEndDate && !isNaN(activeEndDate.getTime())) {
    const diff = activeEndDate.getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Handle Grant / Extend
  const handleGrant = async () => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admin is authorized to grant Premium access.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await api.post("/subscription/admin-grant", {
        patientId,
        durationDays: Number(durationDays),
        action: "grant",
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Premium access granted successfully!");
        if (onUpdate) {
          onUpdate({
            ...patient,
            subscription: "premium",
            subscriptionDetails: res.data.patient?.subscriptionDetails || {
              plan: "premium",
              status: "active",
              subscriptionEnd: new Date(Date.now() + durationDays * 86400000).toISOString(),
              grantType: "admin_grant",
            },
            effectiveSubscription: res.data.subscription,
          });
        }
      } else {
        setErrorMessage(res.data?.message || "Failed to grant Premium access.");
      }
    } catch (err) {
      console.error("Grant Premium error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to grant Premium access.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Revoke
  const handleRevoke = async () => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admin is authorized to revoke Premium access.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await api.post("/subscription/admin-grant", {
        patientId,
        action: "revoke",
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Premium access revoked successfully.");
        setConfirmRevoke(false);
        if (onUpdate) {
          onUpdate({
            ...patient,
            subscription: "basic",
            subscriptionDetails: res.data.patient?.subscriptionDetails || {
              plan: "basic",
              status: "active",
              grantType: "admin_revoked",
            },
            effectiveSubscription: res.data.subscription,
          });
        }
      } else {
        setErrorMessage(res.data?.message || "Failed to revoke Premium access.");
      }
    } catch (err) {
      console.error("Revoke Premium error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to revoke Premium access.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isPremium
                ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-500/20"
                : "bg-blue-50 text-blue-600 border border-blue-100"
            }`}
          >
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              Premium Subscription
              {isPremium && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300/60">
                  Active
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500">
              {isAdminGrant
                ? "Administratively granted access"
                : isTrial
                ? "Free Trial period"
                : isPremium
                ? "Active plan"
                : "Standard Basic plan"}
            </p>
          </div>
        </div>

        {/* Current Plan Badge */}
        <div>
          {isPremium ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 text-amber-800 border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Premium
            </span>
          ) : isTrial ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Trial
            </span>
          ) : isExpired ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              Expired
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
              Basic Plan
            </span>
          )}
        </div>
      </div>

      {/* Subscription Timeline & Metadata */}
      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white border border-slate-200/70 text-xs">
        <div>
          <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">
            Start Date
          </span>
          <span className="font-semibold text-slate-700 mt-0.5 block">
            {subscriptionStart
              ? subscriptionStart.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A"}
          </span>
        </div>

        <div>
          <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">
            {isPremium ? "Valid Until" : "Expiry Date"}
          </span>
          <span className="font-semibold text-slate-700 mt-0.5 block">
            {activeEndDate
              ? activeEndDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "No expiry (Basic)"}
          </span>
        </div>

        {daysRemaining !== null && isPremium && (
          <div className="col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Remaining access:</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left
            </span>
          </div>
        )}

        {isAdminGrant && subDetails.grantedAt && (
          <div className="col-span-2 text-[11px] text-slate-400 italic">
            Granted on{" "}
            {new Date(subDetails.grantedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Super Admin Controls */}
      {isSuperAdmin && (
        <div className="pt-2 border-t border-slate-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Administrative Controls
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Super Admin Only</span>
          </div>

          {/* Confirm Revoke State */}
          {confirmRevoke ? (
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-3">
              <div className="flex items-start gap-2 text-rose-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                <p>
                  Are you sure you want to <strong>revoke Premium access</strong> for this patient?
                  Their account will immediately revert to the Basic plan.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRevoke}
                  disabled={loading}
                  className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Confirm Revoke"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRevoke(false)}
                  disabled={loading}
                  className="py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Duration selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-600 whitespace-nowrap">
                  Duration:
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  disabled={loading}
                  className="flex-1 h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={30}>30 Days (1 Month)</option>
                  <option value={90}>90 Days (3 Months)</option>
                  <option value={180}>180 Days (6 Months)</option>
                  <option value={365}>365 Days (1 Year)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGrant}
                  disabled={loading}
                  className={`flex-1 h-9 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                    isPremium
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  } disabled:opacity-60`}
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Crown className="w-3.5 h-3.5" />
                      {isPremium ? "Extend Premium" : "Grant Premium"}
                    </>
                  )}
                </button>

                {isPremium && (
                  <button
                    type="button"
                    onClick={() => setConfirmRevoke(true)}
                    disabled={loading}
                    className="h-9 px-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-700 font-bold text-xs transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
