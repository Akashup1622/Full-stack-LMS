import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { apiConnector } from "../../Services/apiConnector"
import { Users, Search, ToggleLeft, ToggleRight, Trash2, Shield, UserCheck, ShieldAlert } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminManageStudents() {
  const { darkMode } = useOutletContext()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("All")

  const fetchUsers = async () => {
    try {
      const res = await apiConnector("GET", "/admin/getAllUsers")
      if (res.data.success) {
        setUsers(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load user list")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleToggleBlock = async (userId, currentActive) => {
    const action = currentActive ? "block" : "activate"
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return
    }

    try {
      const res = await apiConnector("POST", "/admin/toggleBlockUser", { userId })
      if (res.data.success) {
        toast.success(`User account ${res.data.data.active ? "activated" : "blocked"} successfully`)
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, active: res.data.data.active } : u))
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to toggle block status")
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("WARNING: This will permanently delete the user account, their profile details, and any enrollment data. This cannot be undone. Are you sure?")) {
      return
    }

    try {
      const res = await apiConnector("POST", "/admin/deleteUser", { userId })
      if (res.data.success) {
        toast.success("User account deleted successfully")
        setUsers(prev => prev.filter(u => u._id !== userId))
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete user account")
    }
  }

  // Filtering users
  const filteredUsers = users.filter(u => {
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase()
    const email = (u.email || "").toLowerCase()
    const matchesSearch = fullName.includes(search.toLowerCase()) || email.includes(search.toLowerCase())
    
    if (roleFilter === "All") return matchesSearch
    return matchesSearch && u.accountType === roleFilter
  })

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Manage Users</h1>
        <p className={`text-sm mt-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Monitor registered student profiles, review instructor credentials, and block or delete accounts.
        </p>
      </div>

      {/* Control filters bar */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-4 ${
        darkMode ? "bg-[#0c1222]/80 border-white/5" : "bg-white border-gray-200 shadow-sm"
      }`}>
        <div className="flex-1 relative w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by user name or email..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="w-full sm:w-48 p-2.5 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-gray-300"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="All" className="bg-slate-900 text-white">All Roles</option>
          <option value="Student" className="bg-slate-900 text-white">Students</option>
          <option value="Instructor" className="bg-slate-900 text-white">Instructors</option>
        </select>
      </div>

      {/* Users table */}
      <div className={`rounded-3xl border overflow-hidden ${
        darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
      }`}>
        <div className="overflow-x-auto">
          {filteredUsers.length > 0 ? (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className={`border-b ${darkMode ? "border-white/5" : "border-gray-200"} ${darkMode ? "bg-slate-900/40" : "bg-gray-50"}`}>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">User Account</th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Email Address</th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Role</th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Account Type</th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Status</th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => {
                  const isActive = u.active
                  return (
                    <tr key={u._id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 md:p-5 flex items-center gap-3.5">
                        <img
                          src={u.image || `https://api.dicebear.com/9.x/initials/svg?seed=${u.firstName} ${u.lastName}`}
                          alt="Avatar"
                          className="w-10 h-10 object-cover rounded-full border border-white/5 shrink-0"
                        />
                        <div>
                          <p className="font-bold">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{u.phone ? `Phone: ${u.phone}` : "No Phone Listed"}</p>
                        </div>
                      </td>
                      <td className="p-4 md:p-5">
                        <span className="font-medium">{u.email}</span>
                      </td>
                      <td className="p-4 md:p-5">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          u.accountType === "Instructor"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}>
                          {u.accountType}
                        </span>
                      </td>
                      <td className="p-4 md:p-5">
                        <span className="text-gray-400 font-semibold">
                          {u.additionalDetails?.gender || "Not specified"}
                        </span>
                      </td>
                      <td className="p-4 md:p-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {isActive ? <UserCheck size={12} /> : <ShieldAlert size={12} />}
                          <span>{isActive ? "Active" : "Blocked"}</span>
                        </span>
                      </td>
                      <td className="p-4 md:p-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleBlock(u._id, isActive)}
                            className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition"
                            title={isActive ? "Block Account" : "Activate Account"}
                          >
                            {isActive ? <ToggleRight className="text-emerald-400" size={18} /> : <ToggleLeft className="text-red-400" size={18} />}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-2 rounded-lg border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition text-red-400"
                            title="Delete User Account"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <Users className="mx-auto text-gray-600 mb-4" size={40} />
              <p className="font-bold text-lg">No Users Found</p>
              <p className="text-sm text-gray-500 mt-1">Try resetting filters or using a different search query.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
