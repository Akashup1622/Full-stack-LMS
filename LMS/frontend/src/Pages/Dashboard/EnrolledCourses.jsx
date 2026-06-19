import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { apiConnector } from "../../Services/apiConnector"
import { PlayCircle, Award, CheckSquare, Star, MessageSquare } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function EnrolledCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  
  // Classroom active view
  const [activeCourse, setActiveCourse] = useState(null)
  const [activeVideo, setActiveVideo] = useState(null)
  const [completedVideos, setCompletedVideos] = useState([])
  
  // Rating modal/section
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState("")

  const fetchEnrolledCourses = async () => {
    try {
      const res = await apiConnector("GET", "/profile/getEnrolledCourses")
      if (res.data.success) {
        setEnrolledCourses(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load enrolled courses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnrolledCourses()
  }, [])

  // Open Classroom Mode
  const enterClassroom = async (course) => {
    setActiveCourse(course)
    try {
      const res = await apiConnector("POST", "/course/getFullCourseDetails", { courseId: course._id })
      if (res.data.success) {
        setCompletedVideos(res.data.data.completedVideos || [])
        // Set first video active
        const firstSec = course.courseContent?.[0]
        const firstSub = firstSec?.subSection?.[0]
        if (firstSub) {
          setActiveVideo(firstSub)
        }
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load complete curriculum")
    }
  }

  // Mark lesson video as completed
  const markLessonComplete = async (subsectionId) => {
    if (completedVideos.includes(subsectionId)) {
      toast.error("Lesson already completed")
      return
    }

    try {
      const res = await apiConnector("PUT", "/course/updateCourseProgress", {
        courseId: activeCourse._id,
        subsectionId,
      })
      if (res.status === 200 || res.data?.success) {
        toast.success("Progress updated! Keep learning.")
        setCompletedVideos((prev) => [...prev, subsectionId])
        fetchEnrolledCourses() // reload main catalog percentage
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to mark completed")
    }
  }

  // Submit course review
  const submitReview = async (e) => {
    e.preventDefault()
    if (!reviewText) {
      toast.error("Please enter review text")
      return
    }

    try {
      const res = await apiConnector("POST", "/course/createRating", {
        rating,
        review: reviewText,
        courseId: activeCourse._id,
      })
      if (res.data.success) {
        toast.success("Review submitted! Thank you.")
        setReviewText("")
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Already reviewed or failed")
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Active classroom UI overlay
  if (activeCourse) {
    return (
      <div className="space-y-6 animate-fadeIn pb-16">
        <Toaster position="top-center" />
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => setActiveCourse(null)}
              className="text-yellow-400 text-sm hover:underline font-semibold"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-2">{activeCourse.courseName}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Video View & Video Player */}
          <div className="lg:col-span-2 space-y-6">
            {activeVideo ? (
              <div className="bg-[#0f172a] rounded-3xl overflow-hidden aspect-video border border-white/10 shadow-2xl relative group">
                <video
                  src={activeVideo.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  poster={activeCourse.thumbnail}
                />
              </div>
            ) : (
              <div className="bg-slate-800/40 border border-white/10 aspect-video rounded-3xl flex items-center justify-center">
                <p className="text-gray-500">No active video lecture selected</p>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-yellow-400">
                  {activeVideo?.title || "Welcome to the Classroom"}
                </h3>
                {activeVideo && !completedVideos.includes(activeVideo._id) && (
                  <button
                    onClick={() => markLessonComplete(activeVideo._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:scale-95 transition"
                  >
                    <CheckSquare size={16} />
                    <span>Mark Complete</span>
                  </button>
                )}
              </div>
              <p className="text-gray-400 text-sm">{activeVideo?.description || "Select a lecture module from the right menu to begin your learning course."}</p>
            </div>

            {/* Leave Review Form */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-yellow-400" /> Share Your Experience
              </h4>
              <form onSubmit={submitReview} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">Your Rating:</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="text-yellow-400 hover:scale-110 transition"
                      >
                        <Star size={20} fill={star <= rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows="3"
                  placeholder="Tell us what you liked or how we can improve..."
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-xl text-sm transition hover:scale-95"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>

          {/* Collapsible Classroom Drawer */}
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 h-[550px] flex flex-col shadow-2xl">
            <h3 className="font-bold text-lg mb-4 pb-2 border-b border-white/10">Course Curriculum</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {activeCourse.courseContent?.map((section) => (
                <div key={section._id} className="space-y-2">
                  <h4 className="text-xs text-gray-500 tracking-wider uppercase font-semibold">{section.sectionName}</h4>
                  <div className="space-y-1">
                    {section.subSection?.map((sub) => {
                      const isCompleted = completedVideos.includes(sub._id)
                      const isActive = activeVideo?._id === sub._id
                      return (
                        <button
                          key={sub._id}
                          onClick={() => setActiveVideo(sub)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition text-left ${
                            isActive
                              ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
                              : "hover:bg-white/5 text-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <PlayCircle size={16} className={isCompleted ? "text-emerald-400" : "text-gray-400"} />
                            <span className="truncate">{sub.title}</span>
                          </div>
                          {isCompleted && (
                            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-400 font-semibold shrink-0">
                              Done
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    )
  }

  // Dashboard Catalog Grid
  return (
    <div className="space-y-8 animate-fadeIn">
      <Toaster position="top-center" />
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Enrolled Courses</h1>
        <p className="text-gray-400 text-sm mt-1">Jump right back in and complete your lectures</p>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl text-gray-500">
          <Award size={48} className="mx-auto mb-3 text-yellow-400" />
          <p className="text-lg font-medium">You haven't enrolled in any courses yet.</p>
          <button
            onClick={() => navigate("/catalog")}
            className="mt-4 px-5 py-2.5 bg-yellow-400 text-black font-semibold rounded-xl text-sm hover:scale-95 transition"
          >
            Browse Course Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {enrolledCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white/5 border border-white/10 rounded-3xl p-5 hover:border-yellow-400/30 transition-all duration-300 backdrop-blur-xl flex flex-col md:flex-row gap-5"
            >
              <img
                src={course.thumbnail}
                alt={course.courseName}
                className="w-full md:w-36 aspect-video object-cover rounded-2xl border border-white/5"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-lg line-clamp-1">{course.courseName}</h3>
                  <p className="text-gray-400 text-xs mt-1">By {course.instructor?.firstName || "Expert"}</p>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Progress Percentage</span>
                    <span className="font-semibold text-yellow-400">{course.progressPercentage || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                      style={{ width: `${course.progressPercentage || 0}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={() => enterClassroom(course)}
                  className="mt-4 w-full py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-xl text-sm transition hover:scale-95"
                >
                  Resume Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
