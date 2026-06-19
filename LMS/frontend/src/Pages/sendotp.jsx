import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../Redux/Slices/authSlice";
import { apiConnector } from "../Services/apiConnector";
import toast, { Toaster } from "react-hot-toast";

export default function OTP() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // handle input change
  const handleChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // move to next input
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // verify OTP and complete signup
  const handleSubmit = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length < 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }

    const signupData = JSON.parse(sessionStorage.getItem("signupData") || "{}");
    if (!signupData.email) {
      toast.error("Session expired. Please sign up again.");
      navigate("/signup");
      return;
    }

    const t = toast.loading("Creating your account...");
    try {
      const res = await apiConnector("POST", "/auth/signup", {
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        password: signupData.password,
        confirmPassword: signupData.confirmPassword,
        accountType: signupData.accountType,
        otp: finalOtp,
      });

      if (res.data.success) {
        toast.success("Account created! Welcome to StudyNotion 🎉");
        sessionStorage.removeItem("signupData");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "OTP verification failed. Try again.");
    } finally {
      toast.dismiss(t);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    const signupData = JSON.parse(sessionStorage.getItem("signupData") || "{}");
    if (!signupData.email) {
      toast.error("Session expired. Please sign up again.");
      navigate("/signup");
      return;
    }
    const t = toast.loading("Resending OTP...");
    try {
      const res = await apiConnector("POST", "/auth/sendotp", { email: signupData.email });
      if (res.data.success) {
        toast.success("New OTP sent to your email!");
      }
    } catch (err) {
      toast.error("Failed to resend OTP.");
    } finally {
      toast.dismiss(t);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-4">
      <Toaster position="top-center" />

      <div className="absolute w-[400px] h-[400px] bg-yellow-400/10 blur-[120px] rounded-full top-10 right-10 pointer-events-none"></div>

      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-center">

        <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl">🔐</span>
        </div>

        <h2 className="text-3xl font-bold mb-2">Verify OTP</h2>
        <p className="text-gray-400 mb-8 text-sm">
          Enter the 6-digit code sent to your email address
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-between gap-2 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              ref={(el) => (inputsRef.current[index] = el)}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-xl font-bold bg-slate-900 border border-white/10 rounded-xl outline-none focus:border-yellow-400 transition text-white"
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-95 transition shadow-lg shadow-yellow-500/10"
        >
          Verify & Create Account
        </button>

        {/* Resend */}
        <p className="mt-5 text-sm text-gray-400">
          Didn't receive code?{" "}
          <span
            onClick={handleResend}
            className="text-yellow-400 cursor-pointer hover:underline font-semibold"
          >
            Resend OTP
          </span>
        </p>
      </div>
    </div>
  );
}