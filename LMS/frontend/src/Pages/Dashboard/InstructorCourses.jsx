import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { apiConnector } from "../../Services/apiConnector"
import { PlusCircle, Edit, Trash2, Globe, EyeOff } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function InstructorCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchCourses = async () => {
    try {
      const res = await apiConnector("GET", "/course/getInstructorCourses")
      if (res.data.success) {
        setCourses(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to fetch courses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleDeleteCourse = async (courseId) => {
    const confirmDelete = window.confirm("Are you absolutely sure you want to delete this course? This action is irreversible.")
    if (!confirmDelete) return

    try {
      const res = await apiConnector("DELETE", "/course/deleteCourse", { courseId })
      if (res.data.success) {
        toast.success("Course deleted successfully!")
        setCourses((prev) => prev.filter((c) => c._id !== courseId))
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete course")
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Courses</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and configure your course catalog publications</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/create-course")}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-5 py-2.5 rounded-xl font-semibold hover:scale-95 transition shadow-lg shadow-yellow-500/10"
        >
          <PlusCircle size={18} />
          <span>New Course</span>
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl text-gray-500">
          <PlusCircle size={48} className="mx-auto mb-3 text-yellow-400" />
          <p className="text-lg font-medium">You haven't created any courses yet.</p>
          <button
            onClick={() => navigate("/dashboard/create-course")}
            className="mt-4 px-5 py-2.5 bg-yellow-400 text-black font-semibold rounded-xl text-sm hover:scale-95 transition"
          >
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white/5 border border-white/10 rounded-3xl p-5 hover:border-yellow-400/30 transition-all duration-300 backdrop-blur-xl flex flex-col md:flex-row gap-5"
            >
              <div className="relative w-full md:w-44 aspect-video rounded-2xl overflow-hidden border border-white/5 bg-slate-800 shrink-0">
                <img src={course.thumbnail} alt={course.courseName} className="w-full h-full object-cover" />
                <span
                  className={`absolute top-2.5 right-2.5 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-md ${
                    course.status === "Published"
                      ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                      : "bg-yellow-400/20 border border-yellow-400/30 text-yellow-400"
                  }`}
                >
                  {course.status === "Published" ? <Globe size={10} /> : <EyeOff size={10} />}
                  <span>{course.status}</span>
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-lg line-clamp-1">{course.courseName}</h3>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{course.courseDescription}</p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4">
                  <span className="font-bold text-yellow-400 text-lg">₹{course.price}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/course/${course._id}`)}
                      className="p-2 border border-white/15 bg-white/5 hover:bg-white/10 rounded-xl transition text-xs font-semibold text-gray-300 hover:text-white"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        toast.success("Edit course mode triggered")
                        // In high-fidelity, goes to multi-step builder
                      }}
                      className="p-2 bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 rounded-xl transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
