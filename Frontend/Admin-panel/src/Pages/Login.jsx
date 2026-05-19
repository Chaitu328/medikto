import { useState } from "react";

import {
  ShieldCheck,
  Smartphone,
  Lock,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  // ================= STATES =================
  const [phone, setPhone] = useState("");

  const [otp, setOtp] = useState("");

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  // ================= DUMMY SEND OTP =================
  const sendOTP = async () => {
    if (!phone) {
      return alert("Enter phone number");
    }

    setLoading(true);

    setTimeout(() => {
      alert("Dummy OTP Sent");

      setStep(2);

      setLoading(false);
    }, 1000);
  };

  // ================= DUMMY VERIFY OTP =================
  const verifyOTP = async () => {
    if (!otp) {
      return alert("Enter OTP");
    }

    setLoading(true);

    setTimeout(() => {
      // ================= DUMMY USER =================
      const dummyUser = {
        id: "123456",
        name: "Demo User",
        phone,
        role: "admin",
      };

      // ================= DUMMY TOKEN =================
      localStorage.setItem(
        "token",
        "dummy-token"
      );

      localStorage.setItem(
        "user",
        JSON.stringify(dummyUser)
      );

      alert("Login Successful");

      navigate("/");

      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] p-8 text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h1 className="text-4xl font-bold">
            Medikto
          </h1>

          <p className="mt-3 text-blue-100 text-lg">
            Secure Healthcare Login
          </p>
        </div>

        {/* BODY */}
        <div className="p-8">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <label className="block text-sm font-semibold text-gray-600 mb-3">
                Phone Number
              </label>

              <div className="relative mb-6">
                <Smartphone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="Enter phone number"
                  className="w-full h-14 rounded-2xl border border-gray-200 pl-12 pr-4 outline-none focus:border-[#2563EB] transition"
                />
              </div>

              <button
                onClick={sendOTP}
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold shadow-lg transition"
              >
                {loading
                  ? "Sending..."
                  : "Send OTP"}
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <label className="block text-sm font-semibold text-gray-600 mb-3">
                Enter OTP
              </label>

              <div className="relative mb-6">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value)
                  }
                  placeholder="Enter any OTP"
                  className="w-full h-14 rounded-2xl border border-gray-200 pl-12 pr-4 outline-none focus:border-[#2563EB] transition"
                />
              </div>

              <button
                onClick={verifyOTP}
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold shadow-lg transition"
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full mt-4 text-[#2563EB] font-medium"
              >
                Change Number
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}