import React, { useEffect, useRef } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from "lucide-react";

/**
 * ToastItem matches the approved Medikto mockup specifications:
 * - 12-16px rounded corners (rounded-2xl)
 * - Subtle shadow + soft colored background + colored border
 * - Circular status icon with dedicated tinted background
 * - Clear title and explanatory description
 * - Upper-right close icon
 * - Accessible roles and live regions
 * - Reduced-motion friendly animations
 */
export default function ToastItem({ toast, onDismiss }) {
  const { id, type = "info", title, description, duration } = toast;
  const timerRef = useRef(null);

  useEffect(() => {
    if (duration && duration > 0) {
      timerRef.current = setTimeout(() => {
        onDismiss(id);
      }, duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, duration, onDismiss]);

  const configMap = {
    success: {
      cardBg: "bg-[#ECFDF5]",
      border: "border-emerald-200",
      accentBorder: "border-l-4 border-l-emerald-500",
      iconBg: "bg-emerald-100 text-emerald-600",
      titleColor: "text-slate-900",
      descColor: "text-slate-600",
      closeHover: "hover:bg-emerald-200/50 text-slate-400 hover:text-slate-700",
      role: "status",
      ariaLive: "polite",
      Icon: CheckCircle2,
    },
    error: {
      cardBg: "bg-[#FFF1F2]",
      border: "border-rose-200",
      accentBorder: "border-l-4 border-l-rose-500",
      iconBg: "bg-rose-100 text-rose-600",
      titleColor: "text-slate-900",
      descColor: "text-slate-600",
      closeHover: "hover:bg-rose-200/50 text-slate-400 hover:text-slate-700",
      role: "alert",
      ariaLive: "assertive",
      Icon: XCircle,
    },
    loading: {
      cardBg: "bg-[#EFF6FF]",
      border: "border-blue-200",
      accentBorder: "border-l-4 border-l-blue-500",
      iconBg: "bg-blue-100 text-blue-600",
      titleColor: "text-slate-900",
      descColor: "text-slate-600",
      closeHover: "hover:bg-blue-200/50 text-slate-400 hover:text-slate-700",
      role: "status",
      ariaLive: "polite",
      Icon: Loader2,
      isSpinner: true,
    },
    warn: {
      cardBg: "bg-[#FFFBEB]",
      border: "border-amber-200",
      accentBorder: "border-l-4 border-l-amber-500",
      iconBg: "bg-amber-100 text-amber-600",
      titleColor: "text-slate-900",
      descColor: "text-slate-600",
      closeHover: "hover:bg-amber-200/50 text-slate-400 hover:text-slate-700",
      role: "status",
      ariaLive: "polite",
      Icon: AlertTriangle,
    },
    info: {
      cardBg: "bg-[#F0F9FF]",
      border: "border-sky-200",
      accentBorder: "border-l-4 border-l-sky-500",
      iconBg: "bg-sky-100 text-sky-600",
      titleColor: "text-slate-900",
      descColor: "text-slate-600",
      closeHover: "hover:bg-sky-200/50 text-slate-400 hover:text-slate-700",
      role: "status",
      ariaLive: "polite",
      Icon: Info,
    },
  };

  const cfg = configMap[type] || configMap.info;
  const IconComponent = cfg.Icon;

  return (
    <div
      role={cfg.role}
      aria-live={cfg.ariaLive}
      className={`pointer-events-auto w-full rounded-2xl border ${cfg.border} ${cfg.cardBg} ${cfg.accentBorder} p-4 shadow-xl shadow-slate-900/10 backdrop-blur-sm transition-all duration-300 transform-gpu motion-safe:animate-in motion-safe:slide-in-from-right motion-safe:fade-in flex items-start gap-3.5 focus-within:ring-2 focus-within:ring-blue-500/20`}
    >
      {/* Status Icon */}
      <div
        className={`w-9 h-9 rounded-full ${cfg.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm`}
        aria-hidden="true"
      >
        <IconComponent
          size={18}
          className={cfg.isSpinner ? "animate-spin" : ""}
          strokeWidth={2.2}
        />
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 pr-1">
        {title && (
          <h4 className={`text-sm font-bold tracking-tight ${cfg.titleColor} leading-snug break-words`}>
            {title}
          </h4>
        )}
        {description && (
          <p className={`text-xs ${cfg.descColor} ${title ? "mt-1" : ""} leading-relaxed break-words font-normal`}>
            {description}
          </p>
        )}
      </div>

      {/* Dismiss / Close Button */}
      {type !== "loading" && (
        <button
          type="button"
          onClick={() => onDismiss(id)}
          aria-label="Close notification"
          className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${cfg.closeHover} focus:outline-none focus:ring-2 focus:ring-slate-400`}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
