import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiConnector } from "../../Services/apiConnector"
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please enter email and password")
      return
    }

    setLoading(true)
    const toastId = toast.loading("Verifying administrator credentials...")
    try {
      const res = await apiConnector("POST", "/admin/login", { email, password })

      if (res.data.success) {
        toast.success("Welcome back, Administrator!", { id: toastId })
        // Store Admin token & user separately
        localStorage.setItem("admin_token", res.data.token)
        localStorage.setItem("admin_user", JSON.stringify(res.data.user))

        // Redirect to admin dashboard
        navigate("/admin/dashboard")
      } else {
        toast.error(res.data.message || "Failed to authenticate", { id: toastId })
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Invalid credentials or unauthorized access", { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <Toaster position="top-center" />

      {/* Decorative premium glass elements */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/20">
            <ShieldCheck size={32} className="text-black stroke-[2]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          LMS Control Panel
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Secure Administrator Sign-In
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-[#0f172a]/70 backdrop-blur-xl py-8 px-6 sm:px-10 border border-white/5 shadow-2xl rounded-3xl">
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Admin Email Address
              </label>
              <div className="mt-2.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@lms.com"
                  className="block w-full pl-10 pr-3 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-yellow-400 text-sm transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Password
              </label>
              <div className="mt-2.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-yellow-400 text-sm transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-extrabold rounded-xl text-sm shadow-lg shadow-orange-500/10 transition hover:scale-[0.98] disabled:opacity-50 disabled:scale-100"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate Access</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Quick links footer */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-xs text-gray-400 hover:text-yellow-400 transition"
            >
              ← Back to Main Website
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
