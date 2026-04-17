import { useState, useRef } from "react";

export default function OTP() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputsRef = useRef([]);

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

  // verify OTP
  const handleSubmit = () => {
    const finalOtp = otp.join("");
    console.log("Entered OTP:", finalOtp);

    // 🔥 call backend API here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-4">

      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl text-center">

        <h2 className="text-3xl font-bold mb-2">Verify OTP 🔐</h2>
        <p className="text-gray-400 mb-8 text-sm">
          Enter the 6-digit code sent to your email
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-between gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              ref={(el) => (inputsRef.current[index] = el)}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-lg bg-transparent border border-gray-600 rounded-lg outline-none focus:border-yellow-400"
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-95 transition"
        >
          Verify OTP
        </button>

        {/* Resend */}
        <p className="mt-4 text-sm text-gray-400">
          Didn’t receive code?{" "}
          <span className="text-yellow-400 cursor-pointer hover:underline">
            Resend
          </span>
        </p>
      </div>
    </div>
  );
}