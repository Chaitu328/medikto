import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Shield,
  Building2,
  HeartPulse,
  Smartphone,
  Lock,
  ChevronRight,
  Activity,
  Clipboard,
  Users,
  Bell,
  ChevronDown,
  Loader2,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mail,
  Eye,
  EyeOff,
  Hospital,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import api from "../Api/axios";

// ═════════════════════════════════════════════════════════════════════════════
// GOOGLE LOGO SVG COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const GoogleLogo = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// ═════════════════════════════════════════════════════════════════════════════
// FLOATING FEATURE CARD
// ═════════════════════════════════════════════════════════════════════════════
const FloatingCard = ({ icon: Icon, title, description, delay, x, y }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
    className="absolute"
    style={{ left: x, top: y }}
  >
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: delay * 0.5 }}
      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl shadow-blue-900/20 max-w-[200px]"
    >
      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
        <Icon size={18} className="text-white" />
      </div>
      <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
      <p className="text-blue-100 text-xs leading-relaxed">{description}</p>
    </motion.div>
  </motion.div>
);

// ═════════════════════════════════════════════════════════════════════════════
// OTP INPUT BOXES
// ═════════════════════════════════════════════════════════════════════════════
const OtpInput = ({ value, onChange, onComplete }) => {
  const inputRefs = useRef([]);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);

  useEffect(() => {
    if (value) {
      const chars = value.split("").slice(0, 6);
      const newValues = [...otpValues];
      chars.forEach((char, i) => { newValues[i] = char; });
      setOtpValues(newValues);
    }
  }, [value]);

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 1);
    const newValues = [...otpValues];
    newValues[index] = val;
    setOtpValues(newValues);
    onChange(newValues.join(""));

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newValues.every((v) => v !== "") && newValues.join("").length === 6) {
      onComplete(newValues.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newValues = [...otpValues];
    pasted.split("").forEach((char, i) => { if (i < 6) newValues[i] = char; });
    setOtpValues(newValues);
    onChange(newValues.join(""));
    const nextEmpty = newValues.findIndex((v) => v === "");
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {otpValues.map((val, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
        />
      ))}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// COUNTDOWN TIMER
// ═════════════════════════════════════════════════════════════════════════════
const CountdownTimer = ({ seconds, onResend }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 text-sm">
      {timeLeft > 0 ? (
        <>
          <Clock size={14} className="text-slate-400" />
          <span className="text-slate-500 font-medium">Resend in {formatTime(timeLeft)}</span>
        </>
      ) : (
        <button
          onClick={onResend}
          className="text-[#2563EB] font-semibold hover:text-blue-700 transition-colors"
        >
          Resend OTP
        </button>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ROLE SEGMENTED TOGGLE
// ═════════════════════════════════════════════════════════════════════════════
const RoleToggle = ({ activeRole, onChange }) => {
  const roles = [
    {
      id: "superadmin",
      label: "Super Admin",
      icon: Shield,
    },
    {
      id: "hospital",
      label: "Admin",
      icon: Building2,
    },
    {
      id: "guardian",
      label: "Guardian",
      icon: HeartPulse,
    },
  ];

  const activeIndex = roles.findIndex(
    (role) => role.id === activeRole
  );

  return (
    <div className="relative grid grid-cols-3 w-full max-w-lg mx-auto rounded-2xl bg-slate-100 p-1">
      {/* Active Indicator */}
      <motion.div
        className="absolute top-1.5 bottom-1.5 rounded-xl bg-white shadow-md border border-slate-200"
        animate={{
          width: "calc((100% - 8px) / 3)",
          x: `${activeIndex * 100}%`,
        }}
        transition={{
          type: "spring",
          stiffness: 450,
          damping: 35,
        }}
      />

      {roles.map((role) => {
        const Icon = role.icon;
        const active = activeRole === role.id;

        return (
          <button
            key={role.id}
            onClick={() => onChange(role.id)}
            className={`relative z-10 flex items-center justify-center gap-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              active
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{role.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// LEFT SIDE PANEL (Desktop Only)
// ═════════════════════════════════════════════════════════════════════════════
const LeftPanel = () => {
  // const features = [
  //   { icon: HeartPulse, title: "Medication Tracking", description: "Never miss a dose with smart reminders", x: "8%", y: "55%", delay: 0.3 },
  //   { icon: Building2, title: "Hospital Integration", description: "Seamless connectivity with healthcare providers", x: "55%", y: "35%", delay: 0.5 },
  //   { icon: Users, title: "Caretaker Monitoring", description: "Real-time patient health oversight", x: "5%", y: "78%", delay: 0.7 },
  //   { icon: Clipboard, title: "Health Reports", description: "Comprehensive analytics & insights", x: "60%", y: "68%", delay: 0.9 },
  //   { icon: Activity, title: "Realtime Notifications", description: "Instant alerts for critical events", x: "15%", y: "38%", delay: 1.1 },
  //   { icon: Bell, title: "Secure Cloud Storage", description: "HIPAA-compliant data protection", x: "50%", y: "85%", delay: 1.3 },
  // ];

  return (
    <div className="hidden lg:flex lg:w-[42%] xl:w-[40%] relative overflow-hidden bg-gradient-to-br from-[#2563EB] via-[#1d4ed8] to-[#1e40af]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-blue-300 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-white blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center px-10 xl:px-16 py-12 h-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-12 h-12 rounded-2xl bg-black backdrop-blur flex items-center justify-center">
  <img
    src="/Medikto.logo.png"
    alt="Medikto Healthcare"
    className="w-full max-w-md xl:max-w-lg object-contain drop-shadow-2xl"
  />          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Medikto</h1>
            <p className="text-blue-200 text-xs font-medium tracking-wider uppercase">Enterprise Healthcare</p>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4"
        >
          Healthcare,<br />
          <span className="text-blue-200">Simplified.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-blue-100 text-base xl:text-lg mb-12 max-w-sm leading-relaxed"
        >
          A unified platform connecting patients, caretakers, and hospitals with intelligent health management.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex items-center gap-8 mb-12"
        >
          {[
            { value: "50K+", label: "Patients" },
            { value: "200+", label: "Hospitals" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-blue-200 text-xs font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Floating Cards */}
      {/* {features.map((f) => (
        <FloatingCard key={f.title} {...f} />
      ))} */}

      {/* Bottom Trust Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-10 xl:left-16 z-10 flex items-center gap-2"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-blue-200 text-xs font-medium">HIPAA Compliant & SOC 2 Certified</span>
      </motion.div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ERROR TOAST
// ═════════════════════════════════════════════════════════════════════════════
const ErrorToast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
    >
      <AlertCircle size={16} className="flex-shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN LOGIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const MediktoLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  useEffect(() => {
  const token = params.get("token");

  if (token) {
    localStorage.setItem("token", token);
    localStorage.setItem("role", "superadmin");

    localStorage.setItem(
      "user",
      JSON.stringify({
        role: "superadmin",
      })
    );

    navigate("/", { replace: true });
  }
}, []);
  const [activeRole, setActiveRole] = useState("hospital");

  // Hospital Admin states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Caretaker states
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [caretakerStep, setCaretakerStep] = useState("phone"); // "phone" | "otp"
  const [countdown, setCountdown] = useState(30);

  // Common states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const roleConfig = {
    superadmin: {
      title: "Super Administrator",
      subtitle: "Manage the Medikto Platform",
      icon: Shield,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    hospital: {
      title: "Hospital Administrator",
      subtitle: "Manage Hospital & Patients",
      icon: Hospital,
      color: "text-[#2563EB]",
      bg: "bg-blue-50",
    },
    guardian: {
  title: "Guardian Login",
  subtitle: "Monitor Your Assigned Patients",
  icon: HeartPulse,
  color: "text-emerald-600",
  bg: "bg-emerald-50",
},
  };

  useEffect(() => {
  if (params.get("error") === "unauthorized") {
    setApiError(
      "This Google account is not authorized to access the Super Admin portal."
    );
  }
}, [location.search]);

  useEffect(() => {
  if (location.pathname === "/superadmin/login") {
    setActiveRole("superadmin");
  } else if (location.pathname === "/admin/login") {
    setActiveRole("hospital");
  } else if (location.pathname === "/guardian/login") {
    setActiveRole("guardian");
  }
}, [location.pathname]);

  // Reset form when role changes
  useEffect(() => {
    setApiError("");
    setErrors({});
    setCaretakerStep("phone");
    setOtp("");
  }, [activeRole]);

  const validateHospitalForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const validatePhone = (num) => {
  //   const clean = num.replace(/\D/g, "");
  //   if (clean.length < 10) return "Please enter a valid phone number";
  //   if (clean.length > 15) return "Phone number is too long";
  //   return "";
  // };

  const handleHospitalLogin = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validateHospitalForm()) return;

    setLoading(true);
    try {
      const response = await api.post("/admin/login", {
        email: email.trim(),
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role || "admin");
      localStorage.setItem("user", JSON.stringify(user));
      if (rememberMe) localStorage.setItem("rememberEmail", email);
      else localStorage.removeItem("rememberEmail");
      navigate("/");
    } catch (error) {
      setApiError(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // const handleSendOTP = async () => {
  //   const error = validatePhone(phone);
  //   if (error) {
  //     setErrors({ phone: error });
  //     return;
  //   }
  //   setErrors({});
  //   setLoading(true);
  //   try {
  //     await axios.post("/hospitals/send-link-otp", { phone });
  //     setCaretakerStep("otp");
  //     setCountdown(30);
  //   } catch (error) {
  //     setApiError(error.response?.data?.message || "Failed to send OTP");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleVerifyOTP = async () => {
  //   if (otp.length !== 6) {
  //     setErrors({ otp: "Please enter all 6 digits" });
  //     return;
  //   }
  //   setErrors({});
  //   setLoading(true);
  //   try {
  //     const response = await axios.post("/hospitals/verify-link", { phone, otp });
  //     const { token, role, user } = response.data;
  //     localStorage.setItem("token", token);
  //     localStorage.setItem("role", role);
  //     localStorage.setItem("user", JSON.stringify(user));
  //     navigate("/");
  //   } catch (error) {
  //     setApiError(error.response?.data?.message || "Invalid OTP");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleGoogleLogin = async () => {
  //   setLoading(true);
  //   try {
  //     // In production, this would trigger Google OAuth
  //     // For now, simulate a successful superadmin login
  //     await new Promise((r) => setTimeout(r, 1500));
  //     localStorage.setItem("token", "superadmin-token");
  //     localStorage.setItem("role", "superadmin");
  //     localStorage.setItem("user", JSON.stringify({ name: "Super Admin", role: "superadmin" }));
  //     navigate("/");
  //   } catch (error) {
  //     setApiError("Google login failed. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleGoogleLogin = () => {
  window.location.href =
    "http://localhost:4000/api/superadmin/google";
};

  const handleGuardianLogin = async (e) => {
  e.preventDefault();

  setLoading(true);

  try {

    const res = await api.post("/guardian/login", {

      email,

      password

    });

    const { token, user, mustChangePassword } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("role", "guardian");
    localStorage.setItem("user", JSON.stringify(user));

    if (mustChangePassword) {

      navigate("/");

    } else {

      navigate("/");

    }

  } catch (err) {

    setApiError(
      err.response?.data?.message || "Login failed"
    );

  } finally {

    setLoading(false);

  }

};

  const handleResendOTP = () => {
    setCountdown(30);
    handleSendOTP();
  };

  const currentConfig = roleConfig[activeRole];
  const RoleIcon = currentConfig.icon;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Left Panel */}
      <LeftPanel />

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[440px]"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Medikto</h1>
              <p className="text-slate-400 text-xs">Enterprise Healthcare</p>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            {/* Role Toggle */}
            <div className="px-8 pt-8 pb-2">
              {/* <RoleToggle activeRole={activeRole} onChange={setActiveRole} /> */}
              {location.pathname === "/login" && (
  <RoleToggle
    activeRole={activeRole}
    onChange={setActiveRole}
  />
)}
            </div>

            {/* Card Header */}
            <div className="px-8 pt-4 pb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeRole}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${currentConfig.bg} flex items-center justify-center`}>
                      <RoleIcon size={20} className={currentConfig.color} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{currentConfig.title}</h2>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm">{currentConfig.subtitle}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Card Body */}
            <div className="px-8 pb-8">
              <AnimatePresence>
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-5"
                  >
                    <ErrorToast message={apiError} onClose={() => setApiError("")} />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {/* ═══ SUPER ADMIN ═══ */}
                {activeRole === "superadmin" && (
                  <motion.div
                    key="superadmin"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    <div className="py-4">
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
                          <Shield size={32} className="text-amber-500" />
                        </div>
                      </div>
                      <p className="text-center text-sm text-slate-500 mb-6">
                        Sign in with your Google account to access the Super Administrator dashboard.
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full h-14 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-semibold text-base hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-60 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <GoogleLogo size={20} />
                      )}
                      {loading ? "Signing In..." : "Continue with Google"}
                    </motion.button>

                    <div className="flex items-center justify-center gap-2 pt-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                        <Shield size={12} className="text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700">Super Admin Only</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ═══ HOSPITAL ADMIN ═══ */}
                {activeRole === "hospital" && (
                  <motion.div
                    key="hospital"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <form onSubmit={handleHospitalLogin} className="space-y-5">
                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                            placeholder="admin@hospital.com"
                            className={`w-full h-12 pl-11 pr-4 rounded-xl border text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${
                              errors.email ? "border-red-300 focus:border-red-400 bg-red-50/30" : "border-slate-200 focus:border-[#2563EB]"
                            }`}
                            disabled={loading}
                          />
                        </div>
                        <AnimatePresence>
                          {errors.email && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                              className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                              <AlertCircle size={12} /> {errors.email}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                            placeholder="Enter your password"
                            className={`w-full h-12 pl-11 pr-12 rounded-xl border text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${
                              errors.password ? "border-red-300 focus:border-red-400 bg-red-50/30" : "border-slate-200 focus:border-[#2563EB]"
                            }`}
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <AnimatePresence>
                          {errors.password && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                              className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                              <AlertCircle size={12} /> {errors.password}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Remember Me & Forgot Password */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="peer sr-only"
                              disabled={loading}
                            />
                            <div className="w-4 h-4 rounded border-2 border-slate-300 peer-checked:bg-[#2563EB] peer-checked:border-[#2563EB] transition-all flex items-center justify-center">
                              {rememberMe && <CheckCircle2 size={10} className="text-white" />}
                            </div>
                          </div>
                          <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors">Remember Me</span>
                        </label>
                        <button type="button" className="text-sm text-[#2563EB] font-semibold hover:text-blue-700 transition-colors">
                          Forgot Password?
                        </button>
                      </div>

                      {/* Sign In Button */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 rounded-xl bg-[#2563EB] text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ChevronRight size={16} />
                          </>
                        )}
                      </motion.button>
                    </form>

                    {/* Help Link */}
                    <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                      <p className="text-sm text-slate-500">
                        Need help?{" "}
                        <button type="button" className="text-[#2563EB] font-semibold hover:text-blue-700 transition-colors">
                          Contact Super Administrator
                        </button>
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ═══ CARETAKER ═══ */}
{activeRole === "guardian" && (
                    <motion.div
                    key="caretaker"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <form onSubmit={handleGuardianLogin} className="space-y-5">

  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
      Email Address
    </label>

    <div className="relative">
      <Mail
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="guardian@example.com"
        className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 outline-none"
      />
    </div>
  </div>

  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
      Password
    </label>

    <div className="relative">
      <Lock
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter Password"
        className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 outline-none"
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      >
        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
      </button>
    </div>
  </div>

  <button
    type="submit"
    disabled={loading}
    className="w-full h-12 rounded-xl bg-[#2563EB] text-white font-semibold"
  >
    {loading ? "Signing In..." : "Guardian Login"}
  </button>

</form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Card Footer */}
            <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100">
              <p className="text-center text-xs text-slate-400 leading-relaxed">
                By signing in, you agree to our{" "}
                <a href="#" className="text-[#2563EB] hover:underline font-medium">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-[#2563EB] hover:underline font-medium">Privacy Policy</a>
              </p>
            </div>
          </div>

          {/* Bottom Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 flex items-center justify-center gap-6"
          >
            {[
              { icon: ShieldCheck, label: "Secure" },
              { icon: CheckCircle2, label: "Encrypted" },
              { icon: Lock, label: "Protected" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-slate-400">
                <item.icon size={14} />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default MediktoLogin;