import { useNavigate } from "react-router-dom";
export default function CheckEmail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-4">

      {/* Glow Effects */}
      <div className="absolute w-[300px] h-[300px] bg-blue-500/20 blur-[120px] rounded-full top-10 left-10"></div>
      <div className="absolute w-[300px] h-[300px] bg-purple-500/20 blur-[120px] rounded-full bottom-10 right-10"></div>

      {/* Card */}
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-center">

        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-blue-500/20 border border-blue-400/30">
          <span className="text-3xl">📩</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-bold mb-2">
          Check Your Email
        </h2>

        {/* Description */}
        <p className="text-gray-400 mb-6 text-sm">
          We’ve sent a password reset link to your email.  
          Please check your inbox and follow the instructions.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">

          <button
            onClick={() => navigate("/reset-password")}
            className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-95 transition-all duration-200"
          >
            Resend Email
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-lg border border-gray-600 hover:bg-white/10 transition"
          >
            Back to Login
          </button>
        </div>

      </div>
    </div>
  );
}