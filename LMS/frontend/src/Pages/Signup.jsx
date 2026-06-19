// Signup.jsx
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { apiConnector } from "../Services/apiConnector";
import toast, { Toaster } from "react-hot-toast";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState("Student");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    const t = toast.loading("Sending OTP to your email...");
    try {
      // Save signup data to sessionStorage to use after OTP verification
      sessionStorage.setItem("signupData", JSON.stringify({ ...data, accountType }));
      
      // Request OTP
      const res = await apiConnector("POST", "/auth/sendotp", { email: data.email });
      if (res.data.success) {
        toast.success("OTP sent! Please check your inbox.");
        navigate("/verify-otp");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      toast.dismiss(t);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-4 py-10">
      <Toaster position="top-center" />

      {/* Glow */}
      <div className="absolute w-[400px] h-[400px] bg-yellow-400/20 blur-[120px] rounded-full top-10 left-10 pointer-events-none"></div>

      {/* Card */}
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">

        <h2 className="text-3xl font-bold text-center mb-2">
          Create Account 🚀
        </h2>
        <p className="text-gray-400 text-center mb-6 text-sm">
          Join and start your learning journey
        </p>

        {/* Account Type Toggle */}
        <div className="flex bg-slate-900 rounded-xl p-1 mb-6">
          {["Student", "Instructor"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setAccountType(type)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                accountType === type
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* First + Last Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                placeholder="First Name"
                className="w-full p-3 bg-transparent border border-gray-600 rounded-lg outline-none focus:border-yellow-400 text-sm"
                {...register("firstName", { required: "Required" })}
              />
              {errors.firstName && (
                <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="Last Name"
                className="w-full p-3 bg-transparent border border-gray-600 rounded-lg outline-none focus:border-yellow-400 text-sm"
                {...register("lastName", { required: "Required" })}
              />
              {errors.lastName && (
                <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-3 bg-transparent border border-gray-600 rounded-lg outline-none focus:border-yellow-400 text-sm"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full p-3 bg-transparent border border-gray-600 rounded-lg outline-none focus:border-yellow-400 text-sm"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
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
              <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full p-3 bg-transparent border border-gray-600 rounded-lg outline-none focus:border-yellow-400 text-sm"
              {...register("confirmPassword", {
                required: "Confirm your password",
                validate: (value) => value === password || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-95 transition disabled:opacity-50"
          >
            {isSubmitting ? "Sending OTP..." : "Create Account"}
          </button>
        </form>

        {/* Login */}
        <p className="mt-6 text-sm text-center text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-yellow-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}