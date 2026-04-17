import { useNavigate } from "react-router-dom";
export default function ResetSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-4">

      {/* Glow Effects */}
      <div className="absolute w-[300px] h-[300px] bg-green-400/20 blur-[120px] rounded-full top-10 left-10"></div>
      <div className="absolute w-[300px] h-[300px] bg-blue-500/20 blur-[120px] rounded-full bottom-10 right-10"></div>

      {/* Card */}
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-center">

        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-green-500/20 border border-green-400/30">
          <span className="text-3xl">✅</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-bold mb-2">
          Password Reset Successful 🎉
        </h2>

        {/* Description */}
        <p className="text-gray-400 mb-6 text-sm">
          Your password has been successfully updated.  
          You can now login with your new password.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/login")}
          className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-green-400 to-emerald-500 text-black hover:scale-95 transition-all duration-200 shadow-lg"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}