// Login.jsx
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../Redux/Slices/authSlice";
import { apiConnector } from "../Services/apiConnector";
import toast, { Toaster } from "react-hot-toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    const t = toast.loading("Verifying credentials...");
    try {
      const res = await apiConnector("POST", "/auth/login", data);
      if (res.data.twoFactorRequired) {
        setTempToken(res.data.tempToken);
        setShow2FA(true);
        toast.success("Please enter your 2FA OTP code.");
        return;
      }
      if (res.data.success) {
        toast.success("Welcome back! Login successful.");
        dispatch(setToken(res.data.token));
        dispatch(setUser(res.data.user));
        
        // Sync local storage
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        setTimeout(() => navigate("/dashboard"), 1200);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      toast.dismiss(t);
    }
  };

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }
    const t = toast.loading("Verifying 2FA code...");
    try {
      const res = await apiConnector("POST", "/auth/2fa/login-verify", {
        tempToken,
        token: otpCode
      });
      if (res.data.success) {
        toast.success("Verification successful! Logging in...");
        dispatch(setToken(res.data.token));
        dispatch(setUser(res.data.user));
        
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        setTimeout(() => navigate("/dashboard"), 1200);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Invalid 2FA code. Please try again.");
    } finally {
      toast.dismiss(t);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-4">
      <Toaster position="top-center" />

      {/* Glow */}
      <div className="absolute w-[400px] h-[400px] bg-yellow-400/20 blur-[120px] rounded-full top-10 left-10"></div>

      {/* Card */}
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">

        {show2FA ? (
          <>
            <h2 className="text-3xl font-bold text-center mb-2">
              Two-Factor Auth 🔐
            </h2>
            <p className="text-gray-400 text-center mb-8 text-sm">
              Enter the 6-digit code from your authenticator app
            </p>

            <form onSubmit={handle2FAVerify} className="space-y-5">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="w-full p-3 bg-transparent border border-gray-600 rounded-lg outline-none focus:border-yellow-400 text-center tracking-widest font-mono text-2xl"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-95 transition"
              >
                Verify & Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setShow2FA(false);
                  setOtpCode("");
                  setTempToken("");
                }}
                className="w-full text-center text-sm text-gray-400 hover:text-white mt-4 block"
              >
                ← Back to Login
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-center mb-2">
              Welcome Back 👋
            </h2>
            <p className="text-gray-400 text-center mb-8 text-sm">
              Login to continue your journey
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Email */}
              <div>
                <input
                  type="email"
                  placeholder="Enter Email"
                  className="w-full p-3 bg-transparent border border-gray-600 rounded-lg outline-none focus:border-yellow-400"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email format",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    className="w-full p-3 bg-transparent border border-gray-600 rounded-lg outline-none focus:border-yellow-400"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Minimum 6 characters required",
                      },
                    })}
                  />

                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 cursor-pointer text-gray-400"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </span>
                </div>

                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot */}
              <div className="text-right text-sm">
                <Link to="/reset-password" className="text-yellow-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-95 transition disabled:opacity-50"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-[1px] bg-gray-700"></div>
              <p className="px-3 text-gray-400 text-sm">OR</p>
              <div className="flex-1 h-[1px] bg-gray-700"></div>
            </div>

            {/* Google */}
            <button className="w-full border border-gray-600 py-2 rounded-lg hover:bg-white/10 transition">
              Continue with Google
            </button>

            {/* Signup */}
            <p className="mt-6 text-sm text-center text-gray-400">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-yellow-400 hover:underline">
                Signup
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}