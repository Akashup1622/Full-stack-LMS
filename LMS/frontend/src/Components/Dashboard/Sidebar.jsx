import { Link, useLocation, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { logout } from "../../Redux/Slices/authSlice"
import { 
  BookOpen, 
  Compass, 
  Heart, 
  User, 
  PlusCircle, 
  BarChart3, 
  Settings, 
  LogOut, 
  Users, 
  Layers, 
  ShieldCheck 
} from "lucide-react"

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  // Define sidebar links based on role
  const getSidebarLinks = () => {
    switch (user?.accountType) {
      case "Student":
        return [
          { name: "My Profile", path: "/dashboard/profile", icon: User },
          { name: "Enrolled Courses", path: "/dashboard/enrolled-courses", icon: BookOpen },
          { name: "Explore Catalog", path: "/catalog", icon: Compass },
          { name: "Wishlist", path: "/dashboard/wishlist", icon: Heart },
          { name: "Settings", path: "/dashboard/settings", icon: Settings },
        ]
      case "Instructor":
        return [
          { name: "My Profile", path: "/dashboard/profile", icon: User },
          { name: "My Courses", path: "/dashboard/instructor-courses", icon: BookOpen },
          { name: "Create Course", path: "/dashboard/create-course", icon: PlusCircle },
          { name: "Instructor Dashboard", path: "/dashboard/instructor-analytics", icon: BarChart3 },
          { name: "Settings", path: "/dashboard/settings", icon: Settings },
        ]
      case "Admin":
        return [
          { name: "My Profile", path: "/dashboard/profile", icon: User },
          { name: "Manage Users", path: "/dashboard/admin-users", icon: Users },
          { name: "Manage Courses", path: "/dashboard/admin-courses", icon: ShieldCheck },
          { name: "Create Category", path: "/dashboard/admin-category", icon: Layers },
          { name: "Platform Analytics", path: "/dashboard/admin-analytics", icon: BarChart3 },
          { name: "Settings", path: "/dashboard/settings", icon: Settings },
        ]
      default:
        return []
    }
  }

  const links = getSidebarLinks()

  return (
    <aside className="w-64 bg-slate-900/60 backdrop-blur-xl border-r border-white/10 flex flex-col h-screen text-white sticky top-0">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-black text-xl">
          S
        </div>
        <div>
          <h1 className="font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            StudyNotion
          </h1>
          <span className="text-[10px] text-gray-400 tracking-widest uppercase font-semibold">
            {user?.accountType} PANEL
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.path
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive
                  ? "bg-gradient-to-r from-yellow-400/20 to-orange-500/10 border-l-4 border-yellow-400 text-yellow-400 shadow-lg shadow-yellow-500/5"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={20} className={isActive ? "text-yellow-400" : "text-gray-400"} />
              <span>{link.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-white/10 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <img
            src={user?.image}
            alt={user?.firstName}
            className="w-10 h-10 rounded-full border-2 border-yellow-400/50"
          />
          <div className="overflow-hidden">
            <h4 className="font-semibold text-sm truncate">
              {user?.firstName} {user?.lastName}
            </h4>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 hover:border-red-500/60 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition duration-300 font-semibold"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  )
}
