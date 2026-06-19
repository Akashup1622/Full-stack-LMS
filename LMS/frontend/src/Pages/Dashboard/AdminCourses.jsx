import { useState, useEffect } from "react"
import { apiConnector } from "../../Services/apiConnector"
import { Check, X, ShieldAlert, Award } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCourses = async () => {
    try {
      const res = await apiConnector("GET", "/course/getAllCourses")
      if (res.data.success) {
        setCourses(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load catalog")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleApproveCourse = async (courseId) => {
    try {
      const res = await apiConnector("POST", "/admin/approveCourse", { courseId })
      if (res.data.success) {
        toast.success(res.data.message)
        fetchCourses() // refresh list
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to approve course")
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
        <h1 className="text-3xl font-extrabold tracking-tight">Manage Courses</h1>
        <p className="text-gray-400 text-sm mt-1">Supervise and approve active marketplace course offerings</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
        {courses.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No published or drafted courses exist on the platform.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300 divide-y divide-white/5">
              <thead>
                <tr className="text-gray-500 font-semibold">
                  <th className="py-3 px-2">Thumbnail</th>
                  <th className="py-3 px-2">Course Name</th>
                  <th className="py-3 px-2">Instructor</th>
                  <th className="py-3 px-2">Price</th>
                  <th className="py-3 px-2 text-right">Publication Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {courses.map((c) => (
                  <tr key={c._id} className="hover:bg-white/5 transition">
                    <td className="py-4 px-2">
                      <img src={c.thumbnail} alt={c.courseName} className="w-14 aspect-video rounded-lg object-cover" />
                    </td>
                    <td className="py-4 px-2 font-semibold text-white">{c.courseName}</td>
                    <td className="py-4 px-2 text-gray-400">
                      {c.instructor?.firstName} {c.instructor?.lastName}
                    </td>
                    <td className="py-4 px-2 text-yellow-400 font-bold">₹{c.price}</td>
                    <td className="py-4 px-2 text-right">
                      <button
                        onClick={() => handleApproveCourse(c._id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-auto ${
                          c.status === "Published"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                        }`}
                      >
                        {c.status === "Published" ? (
                          <>
                            <X size={12} />
                            <span>Unpublish</span>
                          </>
                        ) : (
                          <>
                            <Check size={12} />
                            <span>Publish Course</span>
                          </>
                        )}
                      </button>
                    </td>
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
