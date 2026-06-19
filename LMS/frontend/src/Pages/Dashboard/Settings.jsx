import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { apiConnector } from "../../Services/apiConnector"
import { setUser } from "../../Redux/Slices/authSlice"
import { Save, Key, Camera, ShieldCheck, ShieldAlert, Lock } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function Settings() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [twoFactorSecret, setTwoFactorSecret] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [setupMode, setSetupMode] = useState(false)
  const [loading2FA, setLoading2FA] = useState(false)

  // Profile fields state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    dateOfBirth: user?.additionalDetails?.dateOfBirth || "",
    gender: user?.additionalDetails?.gender || "Male",
    contactNumber: user?.additionalDetails?.contactNumber || "",
    about: user?.additionalDetails?.about || "",
  })

  // Password change state
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingPic, setUploadingPic] = useState(false)

  // Handle profile text inputs
  const handleInputChange = (e) => {
    setProfileData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  // Submit profile settings
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    const t = toast.loading("Updating your profile details...")
    try {
      const res = await apiConnector("PUT", "/profile/updateProfile", profileData)
      if (res.data.success) {
        toast.success("Profile details updated!")
        dispatch(setUser(res.data.updatedUserDetails))
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Failed to save details")
    } finally {
      toast.dismiss(t)
      setSavingProfile(false)
    }
  }

  // Handle avatar upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("displayPicture", file)

    setUploadingPic(true)
    const t = toast.loading("Uploading your profile avatar...")
    try {
      const res = await apiConnector("PUT", "/profile/updateDisplayPicture", formData, {
        "Content-Type": "multipart/form-data",
      })
      if (res.data.success) {
        toast.success("Avatar uploaded successfully!")
        const updatedUser = {
          ...user,
          image: res.data.data.image,
        }
        dispatch(setUser(updatedUser))
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to upload display image")
    } finally {
      toast.dismiss(t)
      setUploadingPic(false)
    }
  }

  // Handle Password modification
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!oldPassword || !newPassword) {
      toast.error("Please fill password fields")
      return
    }

    setSavingPassword(true)
    const t = toast.loading("Changing your account password...")
    try {
      const res = await apiConnector("POST", "/auth/changepassword", {
        oldPassword,
        newPassword,
      })
      if (res.data.success) {
        toast.success("Password changed successfully!")
        setOldPassword("")
        setNewPassword("")
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Incorrect current password")
    } finally {
      toast.dismiss(t)
      setSavingPassword(false)
    }
  }

  // Init 2FA Setup
  const handleInit2FA = async () => {
    setLoading2FA(true)
    const t = toast.loading("Generating 2FA credentials...")
    try {
      const res = await apiConnector("POST", "/auth/2fa/setup")
      if (res.data.success) {
        setQrCodeUrl(res.data.qrCodeUrl)
        setTwoFactorSecret(res.data.secret)
        setSetupMode(true)
        toast.success("Scan the QR code to proceed.")
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Failed to initialize 2FA")
    } finally {
      toast.dismiss(t)
      setLoading2FA(false)
    }
  }

  // Confirm and Enable 2FA
  const handleVerify2FA = async (e) => {
    e.preventDefault()
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code")
      return
    }
    setLoading2FA(true)
    const t = toast.loading("Verifying 2FA token...")
    try {
      const res = await apiConnector("POST", "/auth/2fa/verify", { token: verificationCode })
      if (res.data.success) {
        toast.success("2FA successfully enabled!")
        setTwoFactorEnabled(true)
        setSetupMode(false)
        setVerificationCode("")
        dispatch(setUser({ ...user, twoFactorEnabled: true }))
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Invalid 2FA token")
    } finally {
      toast.dismiss(t)
      setLoading2FA(false)
    }
  }

  // Disable 2FA
  const handleDisable2FA = async (e) => {
    e.preventDefault()
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code")
      return
    }
    setLoading2FA(true)
    const t = toast.loading("Disabling 2FA...")
    try {
      const res = await apiConnector("POST", "/auth/2fa/disable", { token: verificationCode })
      if (res.data.success) {
        toast.success("2FA successfully disabled.")
        setTwoFactorEnabled(false)
        setVerificationCode("")
        dispatch(setUser({ ...user, twoFactorEnabled: false }))
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Invalid 2FA token")
    } finally {
      toast.dismiss(t)
      setLoading2FA(false)
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <Toaster position="top-center" />
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure profile aesthetics, metadata, and security credentials</p>
      </div>

      {/* Profile Picture Upload Card */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex items-center gap-6">
        <div className="relative group">
          <img
            src={user?.image}
            alt={user?.firstName}
            className="w-20 h-20 rounded-full border-2 border-yellow-400/50 object-cover"
          />
          <label className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition">
            <Camera size={18} className="text-yellow-400" />
            <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
          </label>
        </div>
        <div>
          <h3 className="font-bold text-lg">Change Display Picture</h3>
          <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, or SVG formats.</p>
          <label className="mt-3 inline-block px-4 py-2 border border-white/15 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold cursor-pointer transition">
            {uploadingPic ? "Uploading..." : "Select File"}
            <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
          </label>
        </div>
      </div>

      {/* Settings Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Info Form */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl space-y-6">
          <h3 className="text-lg font-bold border-b border-white/5 pb-3">Account Information</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                  value={profileData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Gender</label>
                <select
                  name="gender"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                  value={profileData.gender}
                  onChange={handleInputChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                value={profileData.contactNumber}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">About Bio</label>
              <textarea
                name="about"
                rows="3"
                className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                value={profileData.about}
                onChange={handleInputChange}
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-xl text-sm transition hover:scale-95 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{savingProfile ? "Saving..." : "Save Details"}</span>
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl space-y-6">
          <h3 className="text-lg font-bold border-b border-white/5 pb-3">Update Security Credentials</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Current Password</label>
              <input
                type="password"
                className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">New Password</label>
              <input
                type="password"
                className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl text-sm transition hover:scale-95 disabled:opacity-50"
            >
              <Key size={16} />
              <span>{savingPassword ? "Changing..." : "Change Password"}</span>
            </button>
          </form>
        </div>

      </div>

      {/* Two-Factor Authentication Management */}
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl space-y-6 mt-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Lock size={18} className="text-yellow-400" />
            <span>Two-Factor Authentication (2FA)</span>
          </h3>
          <div className="flex items-center gap-2">
            {twoFactorEnabled ? (
              <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={12} /> Enabled
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldAlert size={12} /> Disabled
              </span>
            )}
          </div>
        </div>

        {!twoFactorEnabled && !setupMode && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 leading-relaxed">
              Add an extra layer of security to your account. Once enabled, you will be prompted to enter a 6-digit OTP code generated by your Authenticator app (like Google Authenticator or Authy) whenever you sign in.
            </p>
            <button
              onClick={handleInit2FA}
              disabled={loading2FA}
              className="px-6 py-3 rounded-xl bg-yellow-400 text-black font-semibold text-sm hover:scale-95 transition disabled:opacity-50"
            >
              Set Up 2FA
            </button>
          </div>
        )}

        {setupMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-yellow-400">Step 1: Scan this QR Code</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Open your authenticator app, tap the "+" or "Add account" button, and scan the QR code on the right. If you cannot scan the code, enter this secret key manually:
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-white/10 text-xs font-mono text-center select-all cursor-pointer">
                {twoFactorSecret}
              </div>
              <h4 className="font-semibold text-sm text-yellow-400 mt-6">Step 2: Enter Verification Code</h4>
              <form onSubmit={handleVerify2FA} className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400 tracking-widest text-center font-mono"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading2FA}
                    className="flex-1 py-3 rounded-xl bg-yellow-400 text-black font-semibold text-sm hover:scale-95 transition"
                  >
                    Verify & Activate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSetupMode(false)
                      setVerificationCode("")
                    }}
                    className="px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
            <div className="flex justify-center p-4 bg-white rounded-2xl max-w-[200px] mx-auto md:mr-0">
              <img src={qrCodeUrl} alt="2FA QR Code" className="w-full h-auto" />
            </div>
          </div>
        )}

        {twoFactorEnabled && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 leading-relaxed">
              Two-factor authentication is currently active on your account. If you wish to turn it off, enter a 6-digit OTP code below and confirm.
            </p>
            <form onSubmit={handleDisable2FA} className="max-w-md space-y-3">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit code to disable"
                className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400 tracking-widest text-center font-mono"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
              />
              <button
                type="submit"
                disabled={loading2FA}
                className="px-6 py-3 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:scale-95 transition disabled:opacity-50"
              >
                Disable 2FA
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  )
}
