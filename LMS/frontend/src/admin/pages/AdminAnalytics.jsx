import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { adminApiConnector } from "../../Services/adminApiConnector"
import { BarChart3, TrendingUp, Users, BookOpen, AlertCircle } from "lucide-react"
import { RevenueLineChart, EnrollmentsBarChart } from "../components/SVGCharts"
import toast from "react-hot-toast"

export default function AdminAnalytics() {
  const { darkMode } = useOutletContext()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminApiConnector("GET", "/admin/getDashboardStats")
        if (res.data.success) {
          setStats(res.data.data)
        }
      } catch (err) {
        console.error(err)
        toast.error("Failed to load analytics summaries")
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

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
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Analytics</h1>
        <p className={`text-sm mt-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Visualize learning progress metrics, monthly sales trends, and aggregate user engagement charts.
        </p>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Revenue Over Time */}
          <div className={`p-6 rounded-3xl border ${darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"}`}>
            <h3 className="font-extrabold text-base mb-6 flex items-center gap-2">
              <TrendingUp size={16} className="text-yellow-400" /> Revenue Trajectory
            </h3>
            <div className="h-64">
              <RevenueLineChart data={stats?.monthlyRevenue || []} darkMode={darkMode} />
            </div>
          </div>

          {/* Student Registrations */}
          <div className={`p-6 rounded-3xl border ${darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"}`}>
            <h3 className="font-extrabold text-base mb-6 flex items-center gap-2">
              <Users size={16} className="text-yellow-400" /> New Registrations Trend
            </h3>
            <div className="h-64">
              <EnrollmentsBarChart data={stats?.monthlyRevenue || []} darkMode={darkMode} />
            </div>
          </div>

        </div>

        {/* Right column sidebar summaries */}
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border space-y-6 ${darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"}`}>
            <h3 className="font-extrabold text-base pb-3 border-b border-white/5">Performance Metrics</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">
                  <span>Student Active Rate</span>
                  <span className="text-yellow-400">
                    {stats?.totalStudents > 0 ? Math.round((stats.activeUsers / stats.totalStudents) * 100) : 100}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" 
                    style={{ width: `${stats?.totalStudents > 0 ? (stats.activeUsers / stats.totalStudents) * 100 : 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">
                  <span>Course Completion Ratio</span>
                  <span className="text-yellow-400">
                    {stats?.totalStudents > 0 ? Math.round((stats.completedCoursesCount / stats.totalStudents) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" 
                    style={{ width: `${stats?.totalStudents > 0 ? (stats.completedCoursesCount / stats.totalStudents) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">
                  <span>Average Revenue per Course</span>
                  <span className="text-yellow-400">
                    ${stats?.totalCourses > 0 ? Math.round(stats.totalRevenue / stats.totalCourses) : 0}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" style={{ width: "65%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Platform Audit details */}
          <div className={`p-6 rounded-3xl border flex gap-3 ${darkMode ? "bg-amber-500/5 border-amber-500/10 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider">Platform Optimization Tip</p>
              <p className="text-xs mt-1 leading-relaxed">
                Courses that include interactive video subsections and modular quizzes see a 42% higher lecture completion rate.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
