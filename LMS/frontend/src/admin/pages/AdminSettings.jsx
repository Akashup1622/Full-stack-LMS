import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { apiConnector } from "../../Services/apiConnector"
import { User, Shield, Key, Eye, EyeOff, Save, Check } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminSettings() {
  const { darkMode } = useOutletContext()
  
  let adminUser = null
  try {
    const rawUser = localStorage.getItem("admin_user")
    if (rawUser) {
      adminUser = JSON.parse(rawUser)
    }
  } catch (err) {
    console.error(err)
  }

  // Profile forms
  const [firstName, setFirstName] = useState(adminUser?.firstName || "")
  const [lastName, setLastName] = useState(adminUser?.lastName || "")
  const [email, setEmail] = useState(adminUser?.email || "")
  const [loadingProfile, setLoadingProfile] = useState(false)

  // Password forms
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loadingPass, setLoadingPass] = useState(false)

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoadingProfile(true)
    const toastId = toast.loading("Updating profile details...")
    try {
      const res = await apiConnector("PUT", "/profile/updateProfile", {
        firstName,
        lastName,
        gender: "Male",
        dateOfBirth: "1990-01-01",
        about: "LMS System Administrator",
        contactNumber: "1234567890"
      })
      if (res.data.success) {
        toast.success("Profile updated successfully!", { id: toastId })
        // Update admin_user in localStorage
        const updated = {
          ...adminUser,
          firstName: res.data.updatedUserDetails?.firstName || firstName,
          lastName: res.data.updatedUserDetails?.lastName || lastName
        }
        localStorage.setItem("admin_user", JSON.stringify(updated))
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Failed to update profile", { id: toastId })
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    setLoadingPass(true)
    const toastId = toast.loading("Updating secure password...")
    try {
      const res = await apiConnector("POST", "/auth/changepassword", {
        oldPassword,
        newPassword
      })
      if (res.data.success) {
        toast.success("Password updated successfully!", { id: toastId })
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Failed to change password", { id: toastId })
    } finally {
      setLoadingPass(false)
    }
  }

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Settings</h1>
        <p className={`text-sm mt-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Modify your administrator account credentials, reset passcodes, and curate roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: General Profile Settings */}
        <div className={`p-6 md:p-8 rounded-3xl border space-y-6 ${
          darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
        }`}>
          <h3 className="font-extrabold text-lg flex items-center gap-2">
            <User size={18} className="text-yellow-400" /> Account Profile
          </h3>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">First Name</label>
                <input
                  type="text"
                  required
                  className="w-full mt-2.5 p-3 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Last Name</label>
                <input
                  type="text"
                  required
                  className="w-full mt-2.5 p-3 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                disabled
                className="w-full mt-2.5 p-3 bg-slate-900 border border-white/10 rounded-xl outline-none text-sm text-gray-400 cursor-not-allowed"
                value={email}
              />
              <span className="text-[10px] text-gray-500 mt-1.5 block">Email address changes require database administrator authorization.</span>
            </div>

            <button
              type="submit"
              disabled={loadingProfile}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold rounded-xl text-sm transition hover:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-1.5"
            >
              {loadingProfile ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  <span>Update Profile Info</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Security / Password Change */}
        <div className={`p-6 md:p-8 rounded-3xl border space-y-6 ${
          darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
        }`}>
          <h3 className="font-extrabold text-lg flex items-center gap-2">
            <Key size={18} className="text-yellow-400" /> Security & Passwords
          </h3>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Current Password</label>
              <input
                type={showPass ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full mt-2.5 p-3 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">New Password</label>
              <input
                type={showPass ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full mt-2.5 p-3 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Confirm New Password</label>
              <input
                type={showPass ? "text" : "password"}
                required
                placeholder="••••••••"
                className="w-full mt-2.5 p-3 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPass"
                className="rounded text-yellow-400 bg-slate-950 border-white/10 outline-none"
                checked={showPass}
                onChange={() => setShowPass(!showPass)}
              />
              <label htmlFor="showPass" className="text-xs text-gray-400 select-none cursor-pointer">Show Passwords</label>
            </div>

            <button
              type="submit"
              disabled={loadingPass}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold rounded-xl text-sm transition hover:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-1.5"
            >
              {loadingPass ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Key size={16} />
                  <span>Change Password</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  )
}
