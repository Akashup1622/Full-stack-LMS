import { useState, useEffect } from "react"
import { apiConnector } from "../../Services/apiConnector"
import { Trash2, ShieldAlert, CheckCircle2 } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const res = await apiConnector("GET", "/admin/getAllUsers")
      if (res.data.success) {
        setUsers(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load platform users list")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleToggleBlock = async (userId) => {
    try {
      const res = await apiConnector("POST", "/admin/toggleBlockUser", { userId })
      if (res.data.success) {
        toast.success(res.data.message)
        fetchUsers() // reload status
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to change user status")
    }
  }

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm("Are you absolutely sure you want to delete this user? All their profiles and enrollments will be wiped.")
    if (!confirmDelete) return

    try {
      const res = await apiConnector("POST", "/admin/deleteUser", { userId })
      if (res.data.success) {
        toast.success("User deleted successfully!")
        setUsers((prev) => prev.filter((u) => u._id !== userId))
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete user account")
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <Toaster position="top-center" />
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Manage Users</h1>
        <p className="text-gray-400 text-sm mt-1">Supervise role-based profiles and active status locks</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300 divide-y divide-white/5">
            <thead>
              <tr className="text-gray-500 font-semibold">
                <th className="py-3 px-2">Profile</th>
                <th className="py-3 px-2">Email</th>
                <th className="py-3 px-2">Account Type</th>
                <th className="py-3 px-2">Active Status</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-white/5 transition">
                  <td className="py-4 px-2 flex items-center gap-3">
                    <img src={u.image} alt={u.firstName} className="w-9 h-9 rounded-full" />
                    <span className="font-semibold text-white">
                      {u.firstName} {u.lastName}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-gray-400">{u.email}</td>
                  <td className="py-4 px-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-yellow-400">
                      {u.accountType}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        u.active
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : "bg-red-500/10 border border-red-500/20 text-red-400"
                      }`}
                    >
                      {u.active ? "Active" : "Locked"}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-right space-x-2">
                    <button
                      onClick={() => handleToggleBlock(u._id)}
                      className={`p-2 rounded-xl transition ${
                        u.active
                          ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                      title={u.active ? "Block User" : "Activate User"}
                    >
                      {u.active ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition"
                      title="Delete Account"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
