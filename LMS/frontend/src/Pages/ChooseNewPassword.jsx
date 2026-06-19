import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiConnector } from "../Services/apiConnector";
import toast, { Toaster } from "react-hot-toast";

export default function NewPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    // Extract token from URL: /new-password?token=abc123
    const token = new URLSearchParams(location.search).get("token");
    if (!token) {
      toast.error("Reset token is missing. Please use the link from your email.");
      return;
    }

    const t = toast.loading("Updating your password...");
    try {
      const res = await apiConnector("POST", "/auth/forget-password", {
        password: data.password,
        confirmpassword: data.confirmPassword,
        token,
      });
      if (res.data.success) {
        toast.success("Password updated successfully!");
        navigate("/reset-success");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      toast.dismiss(t);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-4">
      <Toaster position="top-center" />

      {/* Glow */}
      <div className="absolute w-[300px] h-[300px] bg-purple-500/20 blur-[120px] rounded-full top-10 left-10"></div>
      <div className="absolute w-[300px] h-[300px] bg-blue-500/20 blur-[120px] rounded-full bottom-10 right-10"></div>

      {/* Card */}
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">

        {/* Heading */}
        <h2 className="text-3xl font-bold text-center mb-2">
          Set New Password 🔐
        </h2>
        <p className="text-gray-400 text-center mb-8 text-sm">
          Create a strong password to secure your account
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* New Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
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

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full p-3 bg-transparent border border-gray-600 rounded-lg outline-none focus:border-yellow-400"
              {...register("confirmPassword", {
                required: "Confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />

            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-95 transition disabled:opacity-50"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* Back to Login */}
        <p className="mt-6 text-sm text-center text-gray-400">
          Remember your password?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-yellow-400 cursor-pointer hover:underline"
          >
            Back to Login
          </span>
        </p>
      </div>
    </div>
  );
}