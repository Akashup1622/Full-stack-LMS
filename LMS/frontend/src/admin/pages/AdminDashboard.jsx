import { useState, useEffect } from "react"
import { useOutletContext, Link } from "react-router-dom"
import { adminApiConnector } from "../../Services/adminApiConnector"
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Activity, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles
} from "lucide-react"
import { RevenueLineChart, EnrollmentsBarChart } from "../components/SVGCharts"
import toast from "react-hot-toast"

export default function AdminDashboard() {
  const { darkMode } = useOutletContext()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboardStats = async () => {
    try {
      const res = await adminApiConnector("GET", "/admin/getDashboardStats")
      if (res.data.success) {
        setStats(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load dashboard metrics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Aggregating platform intelligence...</p>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "from-blue-500/20 to-indigo-500/20 text-blue-400",
      description: "Enrolled in at least one course"
    },
    {
      title: "Total Courses",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: "from-yellow-500/20 to-amber-500/20 text-yellow-400",
      description: "Draft & Published catalog"
    },
    {
      title: "Total Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400",
      description: "Lifetime enrollment earnings"
    },
    {
      title: "Active Students",
      value: stats?.activeUsers || 0,
      icon: Activity,
      color: "from-pink-500/20 to-rose-500/20 text-pink-400",
      description: "Unblocked students active"
    },
    {
      title: "Completed Courses",
      value: stats?.completedCoursesCount || 0,
      icon: CheckCircle,
      color: "from-purple-500/20 to-violet-500/20 text-purple-400",
      description: "Student 100% completed courses"
    },
    {
      title: "Recent Enrollments",
      value: stats?.recentEnrollments?.length || 0,
      icon: Clock,
      color: "from-cyan-500/20 to-sky-500/20 text-cyan-400",
      description: "Enrollments logged recently"
    }
  ]

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      
      {/* Welcome Banner */}
      <div className={`p-6 md:p-8 rounded-3xl border relative overflow-hidden backdrop-blur-xl ${
        darkMode ? "bg-[#0f172a]/60 border-white/5" : "bg-white border-gray-200 shadow-sm"
      }`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">System Status: Optimal</h1>
            <p className={`text-sm mt-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Welcome to your administrative command center. Here is a real-time summary of your LMS platform.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/admin/courses/add"
              className="px-5 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold rounded-xl text-sm transition hover:scale-95 shadow-md shadow-orange-500/10 flex items-center gap-1.5"
            >
              <Sparkles size={16} />
              <span>Create Course</span>
            </Link>
            <Link
              to="/admin/progress"
              className={`px-5 py-3 rounded-xl border text-sm font-semibold transition hover:scale-95 ${
                darkMode ? "border-white/10 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              Track Student Progress
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div 
              key={idx}
              className={`p-6 rounded-3xl border flex gap-5 transition-all duration-300 hover:scale-[1.01] hover:border-yellow-400/20 ${
                darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${card.color} flex items-center justify-center shrink-0`}>
                <Icon size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-semibold uppercase tracking-widest ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  {card.title}
                </span>
                <p className="text-2xl font-black tracking-tight mt-1">{card.value}</p>
                <p className={`text-xs mt-1.5 truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {card.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Graph */}
        <div className={`p-6 md:p-8 rounded-3xl border ${
          darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <TrendingUp className="text-yellow-400" size={18} /> Monthly Revenue
              </h3>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Distribution of platform sales earnings</p>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-bold">Live</span>
          </div>
          <div className="h-64">
            <RevenueLineChart data={stats?.monthlyRevenue || []} darkMode={darkMode} />
          </div>
        </div>

        {/* Enrollments Graph */}
        <div className={`p-6 md:p-8 rounded-3xl border ${
          darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Users className="text-yellow-400" size={18} /> Student Enrollments
              </h3>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>New student sign-ups by month</p>
            </div>
            <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full font-bold">Monthly</span>
          </div>
          <div className="h-64">
            <EnrollmentsBarChart data={stats?.monthlyRevenue || []} darkMode={darkMode} />
          </div>
        </div>

      </div>

      {/* Recent Activity and Enrollments lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Enrollments table overview */}
        <div className={`lg:col-span-2 p-6 md:p-8 rounded-3xl border ${
          darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-lg">Recent Enrollments</h3>
            <Link to="/admin/progress" className="text-yellow-400 text-xs font-semibold flex items-center gap-1 hover:underline">
              <span>View All</span> <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {stats?.recentEnrollments && stats.recentEnrollments.length > 0 ? (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className={`border-b ${darkMode ? "border-white/5" : "border-gray-200"}`}>
                    <th className="pb-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">Student</th>
                    <th className="pb-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">Course</th>
                    <th className="pb-3 font-semibold text-gray-400 text-xs uppercase tracking-wider">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentEnrollments.map((enroll, idx) => (
                    <tr key={idx} className="group">
                      <td className="py-3.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 text-xs flex items-center justify-center font-bold text-gray-300 border border-white/5">
                          {enroll.studentName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold">{enroll.studentName}</p>
                          <p className="text-xs text-gray-500">{enroll.email}</p>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <p className="font-semibold line-clamp-1 max-w-[200px]">{enroll.courseName}</p>
                      </td>
                      <td className="py-3.5">
                        <span className="font-black text-yellow-400">${enroll.price}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-gray-500">No enrollment history logged.</div>
            )}
          </div>
        </div>

        {/* Activity Streams Feed */}
        <div className={`p-6 md:p-8 rounded-3xl border flex flex-col ${
          darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
        }`}>
          <h3 className="font-extrabold text-lg mb-6">System Log Activity</h3>
          
          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((act, i) => (
                <div key={i} className="flex gap-3 text-xs leading-relaxed">
                  <div className="relative shrink-0 mt-0.5">
                    {act.type === "enrollment" ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400">
                        <Users size={12} />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-yellow-500/15 border border-yellow-500/35 flex items-center justify-center text-yellow-400">
                        <BookOpen size={12} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{act.message}</p>
                    <span className="text-[10px] text-gray-500 font-semibold">
                      {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">No recent activity detected.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
