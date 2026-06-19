import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Edit, User, Mail, Calendar, Phone, Award } from "lucide-react"

export default function Profile() {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your professional credentials and account info</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/settings")}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-5 py-2.5 rounded-xl font-semibold hover:scale-95 transition shadow-lg shadow-yellow-500/10"
        >
          <Edit size={16} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Hero card */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute w-[200px] h-[200px] bg-yellow-500/5 blur-[80px] rounded-full top-0 right-0"></div>
        <img
          src={user?.image}
          alt={user?.firstName}
          className="w-24 h-24 rounded-full border-4 border-yellow-400/30"
        />
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-2xl font-extrabold">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-yellow-400 text-sm font-semibold tracking-wider uppercase flex items-center justify-center md:justify-start gap-1.5">
            <Award size={16} />
            <span>{user?.accountType} Account</span>
          </p>
          <p className="text-gray-400 text-sm max-w-lg">
            {user?.additionalDetails?.about || "No professional summary added yet. Click Edit Profile to add your bio."}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Contact Info */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl space-y-4">
          <h3 className="text-lg font-bold border-b border-white/5 pb-3">Personal Credentials</h3>
          
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-yellow-400">
              <Mail size={18} />
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Email Address</span>
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-yellow-400">
              <Phone size={18} />
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Phone Number</span>
              <span className="text-sm font-medium">
                {user?.phone || user?.additionalDetails?.contactNumber || "Not Linked"}
              </span>
            </div>
          </div>
        </div>

        {/* Miscellaneous Details */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl space-y-4">
          <h3 className="text-lg font-bold border-b border-white/5 pb-3">Profile Metadata</h3>
          
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-yellow-400">
              <Calendar size={18} />
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Date Of Birth</span>
              <span className="text-sm font-medium">
                {user?.additionalDetails?.dateOfBirth || "Not Added"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-yellow-400">
              <User size={18} />
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Gender</span>
              <span className="text-sm font-medium">
                {user?.additionalDetails?.gender || "Not Declared"}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
