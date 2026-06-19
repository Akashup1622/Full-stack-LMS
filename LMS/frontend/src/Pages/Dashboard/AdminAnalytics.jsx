import { useState, useEffect } from "react"
import { apiConnector } from "../../Services/apiConnector"
import { Users, DollarSign, BookOpen, ShieldCheck } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await apiConnector("GET", "/admin/getAnalytics")
        if (res.data.success) {
          setAnalytics(res.data.data)
        }
      } catch (err) {
        console.error(err)
        toast.error("Failed to load platform analytics")
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

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
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Global platform metrics, revenue, and registration metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden flex items-center gap-4">
          <div className="absolute w-20 h-20 bg-emerald-500/5 blur-xl rounded-full top-0 right-0"></div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Total Revenue</span>
            <span className="text-2xl font-extrabold text-white">₹{analytics?.totalRevenue || 0}</span>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden flex items-center gap-4">
          <div className="absolute w-20 h-20 bg-yellow-400/5 blur-xl rounded-full top-0 right-0"></div>
          <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Total Students</span>
            <span className="text-2xl font-extrabold text-white">{analytics?.studentsCount || 0}</span>
          </div>
        </div>

        {/* Total Instructors */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden flex items-center gap-4">
          <div className="absolute w-20 h-20 bg-indigo-500/5 blur-xl rounded-full top-0 right-0"></div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Total Instructors</span>
            <span className="text-2xl font-extrabold text-white">{analytics?.instructorsCount || 0}</span>
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden flex items-center gap-4">
          <div className="absolute w-20 h-20 bg-purple-500/5 blur-xl rounded-full top-0 right-0"></div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Total Courses</span>
            <span className="text-2xl font-extrabold text-white">{analytics?.coursesCount || 0}</span>
          </div>
        </div>

      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl text-center space-y-4">
        <h3 className="text-xl font-bold">Platform Status: Active 🚀</h3>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          The StudyNotion platform is running at optimal speeds. Check active categories, courses, and user panels to maintain perfect education flow.
        </p>
      </div>

    </div>
  )
}
