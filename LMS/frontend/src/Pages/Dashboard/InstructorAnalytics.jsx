import { useState, useEffect } from "react"
import { apiConnector } from "../../Services/apiConnector"
import { DollarSign, Users, Award, BookOpen } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function InstructorAnalytics() {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await apiConnector("GET", "/profile/instructorDashboard")
        if (res.status === 200 || res.data?.courses) {
          setStats(res.data.courses || [])
        }
      } catch (err) {
        console.error(err)
        toast.error("Failed to load analytics dashboard")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const totalRevenue = stats.reduce((acc, curr) => acc + curr.totalAmountGenerated, 0)
  const totalStudents = stats.reduce((acc, curr) => acc + curr.totalStudentsEnrolled, 0)

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
        <h1 className="text-3xl font-extrabold tracking-tight">Instructor Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Review your financial earnings and course popularity metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Total Earnings</span>
            <span className="text-2xl font-extrabold text-white">₹{totalRevenue}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Active Enrollments</span>
            <span className="text-2xl font-extrabold text-white">{totalStudents} Students</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Total Courses</span>
            <span className="text-2xl font-extrabold text-white">{stats.length} Courses</span>
          </div>
        </div>

      </div>

      {/* Detailed Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
        <h3 className="text-lg font-bold mb-4 pb-2 border-b border-white/10">Individual Course Statistics</h3>
        
        {stats.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No active courses registered</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300 divide-y divide-white/5">
              <thead>
                <tr className="text-gray-500 font-semibold">
                  <th className="py-3 px-2">Course Name</th>
                  <th className="py-3 px-2">Total Enrolled</th>
                  <th className="py-3 px-2">Total Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.map((course) => (
                  <tr key={course._id} className="hover:bg-white/5 transition">
                    <td className="py-4 px-2 font-semibold text-white">{course.courseName}</td>
                    <td className="py-4 px-2">{course.totalStudentsEnrolled} Students</td>
                    <td className="py-4 px-2 text-yellow-400 font-bold">₹{course.totalAmountGenerated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
