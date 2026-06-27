import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { adminApiConnector } from "../../Services/adminApiConnector"
import { Search, ChevronLeft, ChevronRight, BookOpen, User, RefreshCw, Calendar, ArrowUpDown } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminStudentProgress() {
  const { darkMode } = useOutletContext()
  
  // State for tracking records and pagination
  const [records, setRecords] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  
  // Query Filters & Pagination State
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState("")
  const [courseFilter, setCourseFilter] = useState("")
  const [sortBy, setSortBy] = useState("progress")
  const [sortOrder, setSortOrder] = useState("desc")

  // Fetch course list for filtering
  const fetchCourses = async () => {
    try {
      const res = await adminApiConnector("GET", "/course/getAllCourses")
      if (res.data.success) {
        setCourses(res.data.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Fetch paginated progress records from API
  const fetchProgress = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        search,
        courseId: courseFilter,
        sortBy,
        sortOrder
      })

      const res = await adminApiConnector("GET", `/admin/getStudentProgress?${queryParams.toString()}`)
      if (res.data.success) {
        setRecords(res.data.data.records)
        setTotalPages(res.data.data.pagination.totalPages || 1)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load student progress tracking")
    } finally {
      setLoading(false)
    }
  }

  // Trigger search / filter resets on page changes
  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    fetchProgress()
  }, [page, courseFilter, sortBy, sortOrder])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchProgress()
  }

  const handleSortToggle = (field) => {
    const newOrder = sortBy === field && sortOrder === "desc" ? "asc" : "desc"
    setSortBy(field)
    setSortOrder(newOrder)
    setPage(1)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Progress</h1>
          <p className={`text-sm mt-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Track and monitor lecture completion percentages, enrolled courses, and student activity logs.
          </p>
        </div>
        <button
          onClick={fetchProgress}
          className={`p-2.5 rounded-xl border transition ${
            darkMode ? "hover:bg-white/5 border-white/10" : "hover:bg-gray-100 border-gray-200"
          }`}
          title="Refresh Data"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-center gap-4 ${
        darkMode ? "bg-[#0c1222]/80 border-white/5" : "bg-white border-gray-200 shadow-sm"
      }`}>
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex gap-2">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search student name or email..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-5 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-sm rounded-xl transition"
          >
            Search
          </button>
        </form>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
          <span className="text-xs font-bold text-gray-500 shrink-0 uppercase tracking-wider">Filter Course:</span>
          <select
            className="w-full sm:w-60 p-2.5 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-gray-300"
            value={courseFilter}
            onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
          >
            <option value="" className="bg-slate-900 text-white">All Enrolled Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id} className="bg-slate-900 text-white">
                {c.courseName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Table */}
      <div className={`rounded-3xl border overflow-hidden ${
        darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
      }`}>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-gray-500 mt-4 uppercase tracking-widest font-semibold">Loading Student Records...</p>
            </div>
          ) : records.length > 0 ? (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className={`border-b ${darkMode ? "border-white/5" : "border-gray-200"} ${darkMode ? "bg-slate-900/40" : "bg-gray-50"}`}>
                  <th 
                    className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider cursor-pointer hover:text-white transition"
                    onClick={() => handleSortToggle("studentName")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Student Name</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Course Title</th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider text-center">Lectures Completed</th>
                  <th 
                    className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider cursor-pointer hover:text-white transition"
                    onClick={() => handleSortToggle("progress")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Progress</span>
                      <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Last Active</th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.map((r, idx) => {
                  const isCompleted = r.progress === 100
                  return (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 md:p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="font-bold">{r.studentName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 md:p-5">
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} className="text-yellow-500 shrink-0" />
                          <span className="font-semibold line-clamp-1 max-w-[200px]">{r.courseName}</span>
                        </div>
                      </td>
                      <td className="p-4 md:p-5 text-center font-bold">
                        {r.completedLectures} <span className="text-gray-500 font-medium">/ {r.totalLectures}</span>
                      </td>
                      <td className="p-4 md:p-5">
                        <div className="space-y-1.5 min-w-[120px]">
                          <div className="flex items-center justify-between text-[11px] font-black text-yellow-400">
                            <span>{r.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" 
                              style={{ width: `${r.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 md:p-5">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Calendar size={13} />
                          <span>{formatDate(r.lastActiveDate)}</span>
                        </div>
                      </td>
                      <td className="p-4 md:p-5 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-extrabold ${
                          isCompleted
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <RefreshCw className="mx-auto text-gray-600 mb-4 animate-pulse" size={40} />
              <p className="font-bold text-lg">No Progress History Found</p>
              <p className="text-sm text-gray-500 mt-1">Try resetting filter dropdown or keyword searches.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/5 pt-6">
          <span className="text-xs text-gray-500 font-semibold">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`p-2 rounded-xl border transition disabled:opacity-30 disabled:scale-100 hover:scale-95 ${
                darkMode ? "border-white/10 hover:bg-white/5" : "border-gray-200 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`p-2 rounded-xl border transition disabled:opacity-30 disabled:scale-100 hover:scale-95 ${
                darkMode ? "border-white/10 hover:bg-white/5" : "border-gray-200 hover:bg-gray-100"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
