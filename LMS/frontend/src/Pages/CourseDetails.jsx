import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { apiConnector } from "../Services/apiConnector"
import { ChevronDown, ChevronUp, Play, FileText, CheckCircle, Star } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function CourseDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useSelector((state) => state.auth)
  const [courseData, setCourseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openSections, setOpenSections] = useState({})
  const [buying, setBuying] = useState(false)

  useEffect(() => {
    async function getDetails() {
      try {
        const res = await apiConnector("POST", "/course/getCourseDetails", { courseId: id })
        if (res.data.success) {
          setCourseData(res.data.data)
        }
      } catch (err) {
        console.error(err)
        toast.error("Failed to load course details")
      } finally {
        setLoading(false)
      }
    }
    getDetails()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-t-2 border-yellow-400 border-r-2 animate-spin"></div>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <p className="text-xl">Course not found</p>
      </div>
    )
  }

  const { courseDetails, totalDuration } = courseData
  const isEnrolled = user && courseDetails.studentsEnrolled?.includes(user._id)

  const toggleSection = (secId) => {
    setOpenSections((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }))
  }

  // Handle course buying
  const handleBuyNow = async () => {
    if (!token) {
      toast.error("Please login to buy courses")
      setTimeout(() => navigate("/login"), 1500)
      return
    }

    setBuying(true)
    const t = toast.loading("Connecting to Secure Checkout...")
    try {
      const orderRes = await apiConnector("POST", "/payment/capturePayment", { courseId: id })
      if (orderRes.data.success) {
        toast.dismiss(t)
        
        // Simulating highly polished Checkout Modal
        const confirmBuy = window.confirm(
          `StudyNotion Secure Checkout\n\nCourse: ${courseDetails.courseName}\nPrice: ₹${courseDetails.price}\n\nDo you want to complete this checkout?`
        )

        if (confirmBuy) {
          const verifyRes = await apiConnector("POST", "/payment/verifyPayment", {
            courseId: id,
            paymentId: orderRes.data.orderId,
          })
          if (verifyRes.data.success) {
            toast.success("Congratulations! Enrolled successfully.")
            
            // Sync local storage user details
            const updatedUser = {
              ...user,
              courses: [...(user.courses || []), id]
            }
            localStorage.setItem("user", JSON.stringify(updatedUser))
            
            setTimeout(() => navigate("/dashboard/enrolled-courses"), 1500)
          }
        } else {
          toast.error("Checkout cancelled")
        }
      }
    } catch (err) {
      toast.dismiss(t)
      console.error(err)
      toast.error(err.response?.data?.message || "Transaction failed")
    } finally {
      setBuying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0f19] via-[#020617] to-black text-white pb-20">
      <Toaster position="top-center" />
      <div className="absolute w-[600px] h-[600px] bg-yellow-500/5 blur-[160px] rounded-full pointer-events-none -top-40 -left-40"></div>

      {/* Banner */}
      <div className="bg-[#0f172a]/60 border-b border-white/10 py-16 px-6 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <span className="text-yellow-400 font-semibold tracking-wider text-xs uppercase bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20 mb-4 inline-block">
              {courseDetails.category?.name || "Premium"}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
              {courseDetails.courseName}
            </h1>
            <p className="text-gray-400 text-lg mb-6 leading-relaxed">
              {courseDetails.courseDescription}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold">4.8</span>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} fill="currentColor" />
                  ))}
                </div>
                <span className="text-gray-500">({courseDetails.ratingAndReviews?.length || 0} reviews)</span>
              </div>
              <div>
                Created by{" "}
                <span className="font-semibold text-yellow-400">
                  {courseDetails.instructor?.firstName} {courseDetails.instructor?.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Details Content */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
        
        {/* Course Curriculum & Syllabus */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* What you will learn */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-5">What you'll learn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courseDetails.whatYouWillLearn?.split("\n").map((point, index) => (
                <div key={index} className="flex gap-3 text-gray-300 text-sm">
                  <CheckCircle size={18} className="text-yellow-400 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum */}
          <div>
            <h2 className="text-2xl font-bold mb-2">Course content</h2>
            <p className="text-gray-400 text-sm mb-5">
              {courseDetails.courseContent?.length} sections • {totalDuration} total length
            </p>

            <div className="border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/10 bg-white/5 backdrop-blur-xl">
              {courseDetails.courseContent?.map((section) => {
                const isOpen = openSections[section._id]
                return (
                  <div key={section._id}>
                    <button
                      onClick={() => toggleSection(section._id)}
                      className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition"
                    >
                      <span className="font-semibold text-left">{section.sectionName}</span>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{section.subSection?.length || 0} lectures</span>
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="bg-black/30 divide-y divide-white/5">
                        {section.subSection?.map((sub) => (
                          <div key={sub._id} className="flex items-center justify-between p-5 pl-8 text-sm">
                            <div className="flex items-center gap-3">
                              <Play size={14} className="text-yellow-400" />
                              <span className="text-gray-300">{sub.title}</span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-500">
                              <span>{sub.timeDuration}s</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sticky Checkout Sidebar */}
        <div className="relative">
          <div className="lg:sticky lg:top-28 bg-[#0f172a] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="rounded-2xl overflow-hidden aspect-video bg-slate-800 border border-white/10">
              <img
                src={courseDetails.thumbnail}
                alt={courseDetails.courseName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <span className="text-gray-400 text-sm">Course Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-yellow-400">₹{courseDetails.price}</span>
                <span className="text-gray-500 line-through text-sm">₹{courseDetails.price * 2}</span>
              </div>
            </div>

            {isEnrolled ? (
              <button
                onClick={() => navigate("/dashboard/enrolled-courses")}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl hover:scale-95 transition"
              >
                Go to Classroom
              </button>
            ) : (
              <button
                disabled={buying}
                onClick={handleBuyNow}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-2xl hover:scale-95 transition shadow-lg shadow-yellow-500/10 disabled:opacity-50"
              >
                {buying ? "Processing..." : "Buy Now"}
              </button>
            )}

            <div className="text-center text-xs text-gray-500">
              30-day money-back guarantee • Lifetime access
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
