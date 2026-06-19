import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom"
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  Users, 
  TrendingUp, 
  CreditCard, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight,
  UserCheck
} from "lucide-react"

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  
  const location = useLocation()
  const navigate = useNavigate()
  
  let adminUser = null
  try {
    const rawUser = localStorage.getItem("admin_user")
    if (rawUser) {
      adminUser = JSON.parse(rawUser)
    }
  } catch (err) {
    console.error(err)
  }

  // Toggle Dark/Light mode class on HTML or wrapper
  useEffect(() => {
    const savedTheme = localStorage.getItem("admin_theme")
    if (savedTheme) {
      setDarkMode(savedTheme === "dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !darkMode
    setDarkMode(newTheme)
    localStorage.setItem("admin_theme", newTheme ? "dark" : "light")
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    navigate("/admin/login")
  }

  const menuItems = [
    { name: "Dashboard Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Manage Courses", path: "/admin/courses", icon: BookOpen },
    { name: "Add Course", path: "/admin/courses/add", icon: PlusCircle },
    { name: "Manage Students", path: "/admin/students", icon: Users },
    { name: "Student Progress", path: "/admin/progress", icon: TrendingUp },
    { name: "Orders / Payments", path: "/admin/payments", icon: CreditCard },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Messages & Support", path: "/admin/support", icon: MessageSquare },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ]

  const activePath = location.pathname

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 flex ${
      darkMode ? "bg-[#090d16] text-gray-100" : "bg-gray-50 text-gray-800"
    }`}>
      
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 lg:static flex flex-col transition-all duration-300 border-r border-white/5 shadow-2xl ${
        darkMode ? "bg-[#0c1222] border-r-white/5" : "bg-white border-r-gray-200"
      } ${
        collapsed ? "w-20" : "w-64"
      } ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        
        {/* Sidebar Header */}
        <div className={`h-20 flex items-center justify-between px-6 border-b ${
          darkMode ? "border-white/5" : "border-gray-200"
        }`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-black text-lg shrink-0">
              Ω
            </div>
            {!collapsed && (
              <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent truncate">
                LMS ADMIN
              </span>
            )}
          </div>
          
          {/* Collapse sidebar button */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:flex p-1.5 rounded-lg border transition ${
              darkMode ? "hover:bg-white/5 border-white/10" : "hover:bg-gray-100 border-gray-200"
            }`}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Sidebar Navigation Menu */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activePath === item.path || (item.path !== "/admin/dashboard" && activePath.startsWith(item.path))
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg shadow-orange-500/20"
                    : darkMode 
                      ? "text-gray-400 hover:text-white hover:bg-white/5" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div className={`p-4 border-t ${
          darkMode ? "border-white/5" : "border-gray-200"
        }`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3.5 p-3 rounded-xl font-semibold text-sm transition-all ${
              darkMode 
                ? "text-red-400 hover:bg-red-500/10 hover:text-red-300" 
                : "text-red-600 hover:bg-red-50 hover:text-red-700"
            }`}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className={`h-20 flex items-center justify-between px-6 md:px-8 border-b z-30 transition-colors ${
          darkMode ? "bg-[#0c1222]/80 border-b-white/5" : "bg-white/80 border-b-gray-200"
        } backdrop-blur-md sticky top-0`}>
          
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className={`lg:hidden p-2 rounded-xl border ${
                darkMode ? "hover:bg-white/5 border-white/10" : "hover:bg-gray-100 border-gray-200"
              }`}
            >
              <Menu size={20} />
            </button>
            
            {/* Page header title details */}
            <div className="hidden sm:block">
              <span className={`text-xs font-semibold uppercase tracking-widest ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                LMS Control Center
              </span>
              <h2 className="text-sm font-bold mt-0.5">
                Logged in as <span className="text-yellow-400 font-semibold">{adminUser ? `${adminUser.firstName}` : "Administrator"}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Light/Dark mode toggler */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition ${
                darkMode 
                  ? "hover:bg-white/5 border-white/10 text-yellow-400" 
                  : "hover:bg-gray-100 border-gray-200 text-purple-600"
              }`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className={`h-8 w-[1px] ${darkMode ? "bg-white/10" : "bg-gray-200"}`} />

            {/* Admin Profile Info */}
            <Link to="/admin/settings" className="flex items-center gap-2.5 group">
              <img
                src={adminUser?.image || `https://api.dicebear.com/9.x/initials/svg?seed=System Admin`}
                alt="Admin Avatar"
                className="w-10 h-10 rounded-xl border border-white/10 object-cover group-hover:scale-105 transition"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold leading-tight group-hover:underline">
                  {adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : "System Admin"}
                </p>
                <p className={`text-[10px] uppercase font-bold tracking-wider leading-none mt-0.5 ${
                  darkMode ? "text-yellow-400" : "text-amber-600"
                }`}>
                  Root Admin
                </p>
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Inner Router Views */}
        <main className={`flex-1 overflow-y-auto p-6 md:p-8 ${
          darkMode ? "bg-[#090d16]" : "bg-gray-50"
        }`}>
          <div className="max-w-7xl mx-auto animate-fadeIn">
            <Outlet context={{ darkMode }} />
          </div>
        </main>

      </div>
    </div>
  )
}
