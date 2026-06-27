import { useState, useEffect } from "react"
import { Link, useNavigate, useOutletContext } from "react-router-dom"
import { adminApiConnector } from "../../Services/adminApiConnector"
import { PlusCircle, Search, Edit2, Trash2, Eye, ToggleLeft, ToggleRight, Sparkles } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminManageCourses() {
  const { darkMode } = useOutletContext()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

  const fetchCourses = async () => {
    try {
      // Fetch all registered courses (which returns all courses)
      const res = await adminApiConnector("GET", "/course/getAllCourses")
      if (res.data.success) {
        setCourses(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load courses catalog")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleToggleStatus = async (courseId) => {
    try {
      const res = await adminApiConnector("POST", "/admin/approveCourse", { courseId })
      if (res.data.success) {
        toast.success(`Course set to ${res.data.data.status} successfully`)
        // Update local state
        setCourses(prev => prev.map(c => c._id === courseId ? { ...c, status: res.data.data.status } : c))
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to toggle course status")
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to permanently delete this course and all its sections/lectures? This cannot be undone.")) {
      return
    }

    try {
      const res = await adminApiConnector("DELETE", "/admin/deleteCourse", { courseId })
      if (res.data.success) {
        toast.success("Course deleted successfully")
        setCourses(prev => prev.filter(c => c._id !== courseId))
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Failed to delete course")
    }
  }

  // Filter courses based on search string
  const filteredCourses = courses.filter(c => 
    c.courseName?.toLowerCase().includes(search.toLowerCase()) ||
    (c.instructor?.firstName && `${c.instructor.firstName} ${c.instructor.lastName}`.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Courses</h1>
          <p className={`text-sm mt-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Monitor, publish, edit, or delete platform curriculum modules.
          </p>
        </div>
        <Link
          to="/admin/courses/add"
          className="px-5 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold rounded-xl text-sm transition hover:scale-95 shadow-md shadow-orange-500/10 flex items-center gap-2 shrink-0"
        >
          <PlusCircle size={16} />
          <span>Add Course</span>
        </Link>
      </div>

      {/* Control filters bar */}
      <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
        darkMode ? "bg-[#0c1222]/80 border-white/5" : "bg-white border-gray-200 shadow-sm"
      }`}>
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by course title or instructor name..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Courses Catalog Table */}
      <div className={`rounded-3xl border overflow-hidden ${
        darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
      }`}>
        <div className="overflow-x-auto">
          {filteredCourses.length > 0 ? (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className={`border-b ${darkMode ? "border-white/5" : "border-gray-200"} ${darkMode ? "bg-slate-900/40" : "bg-gray-50"}`}>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Thumbnail & Course</th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Instructor</th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Price</th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Status</th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCourses.map((c) => {
                  const isPublished = c.status === "Published"
                  return (
                    <tr key={c._id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 md:p-5 flex items-center gap-4">
                        <img
                          src={c.thumbnail}
                          alt={c.courseName}
                          className="w-16 h-10 object-cover rounded-lg border border-white/5 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold truncate max-w-[240px]">{c.courseName}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-[240px]">
                            {c.studentsEnrolled?.length || 0} students enrolled
                          </p>
                        </div>
                      </td>
                      <td className="p-4 md:p-5">
                        <p className="font-semibold">{c.instructor ? `${c.instructor.firstName} ${c.instructor.lastName}` : "System Admin"}</p>
                        <p className="text-xs text-gray-500">{c.instructor?.email || "admin@lms.com"}</p>
                      </td>
                      <td className="p-4 md:p-5 font-black text-yellow-400">
                        ${c.price || 0}
                      </td>
                      <td className="p-4 md:p-5">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          isPublished
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {c.status || "Draft"}
                        </span>
                      </td>
                      <td className="p-4 md:p-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(c._id)}
                            className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition"
                            title={isPublished ? "Unpublish (Set to Draft)" : "Publish Course"}
                          >
                            {isPublished ? <ToggleRight className="text-emerald-400" size={18} /> : <ToggleLeft className="text-gray-500" size={18} />}
                          </button>
                          
                          <button
                            onClick={() => navigate(`/admin/courses/edit/${c._id}`)}
                            className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition text-blue-400"
                            title="Edit Curriculum & Details"
                          >
                            <Edit2 size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteCourse(c._id)}
                            className="p-2 rounded-lg border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition text-red-400"
                            title="Permanently Delete Course"
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
              <Search className="mx-auto text-gray-600 mb-4" size={40} />
              <p className="font-bold text-lg">No Courses Found</p>
              <p className="text-sm text-gray-500 mt-1">Try refining your search keyword or add a new course.</p>
              <Link
                to="/admin/courses/add"
                className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 bg-yellow-400 text-black font-semibold rounded-xl text-sm transition hover:scale-95"
              >
                <Sparkles size={16} />
                <span>Create New Course</span>
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
