import { useState, useEffect } from "react"
import { Heart, Star, BookOpen, Clock, User, Compass } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { apiConnector } from "../../Services/apiConnector"
import { setUser } from "../../Redux/Slices/authSlice"
import toast from "react-hot-toast"

export default function CourseCard({ course, onWishlistToggle, isWishlistedInitial = false }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, token } = useSelector((state) => state.auth)
  const [isWishlisted, setIsWishlisted] = useState(isWishlistedInitial)
  const [loading, setLoading] = useState(false)

  // Sync initial state
  useEffect(() => {
    setIsWishlisted(isWishlistedInitial)
  }, [isWishlistedInitial])

  const isStudent = user && user.accountType === "Student"
  const isEnrolled = user && (user.courses?.includes(course._id) || (user.enrolledCourses && user.enrolledCourses.includes(course._id)))

  const handleWishlistClick = async (e) => {
    e.stopPropagation()
    if (!token) {
      toast.error("Please log in to manage your wishlist")
      navigate("/login")
      return
    }
    if (!isStudent) {
      toast.error("Only students can wishlist courses")
      return
    }

    setLoading(true)
    const endpoint = isWishlisted ? "/course/wishlist/remove" : "/course/wishlist/add"
    const toastMsg = isWishlisted ? "Removed from wishlist" : "Added to wishlist"

    try {
      const res = await apiConnector("POST", endpoint, { courseId: course._id })
      if (res.data.success) {
        setIsWishlisted(!isWishlisted)
        toast.success(toastMsg)
        
        // Sync user in Redux & LocalStorage
        const updatedWishlist = res.data.wishlist || []
        const updatedUser = { ...user, wishlist: updatedWishlist }
        dispatch(setUser(updatedUser))
        
        if (onWishlistToggle) {
          onWishlistToggle(course._id, !isWishlisted)
        }
      } else {
        toast.error(res.data.message || "Failed to update wishlist")
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = () => {
    navigate(`/course/${course._id}`)
  }

  // Fallbacks for missing database fields
  const ratingValue = course.rating || 4.5
  const reviewsCount = course.totalReviews || course.ratingAndReviews?.length || 0
  const studentCount = course.totalStudentsEnrolled || course.studentsEnrolled?.length || 0
  const courseLevel = course.level || "Beginner"
  const courseDuration = course.duration || "8 hours"

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-slate-900/40 border border-white/5 hover:border-yellow-400/30 rounded-3xl p-5 hover:-translate-y-2 transition-all duration-300 backdrop-blur-xl shadow-xl hover:shadow-yellow-400/5 cursor-pointer h-full justify-between"
    >
      {/* Thumbnail and Tags */}
      <div>
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-800 border border-white/5 mb-4">
          <img
            src={course.thumbnail}
            alt={course.courseName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Category Tag */}
          <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-yellow-400 border border-white/5">
            {course.category?.name || "Premium"}
          </span>

          {/* Wishlist Button Overlay */}
          {(!user || user.accountType === "Student") && (
            <button
              disabled={loading}
              onClick={handleWishlistClick}
              className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition border shadow-md ${
                isWishlisted
                  ? "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30 scale-110"
                  : "bg-black/60 border-white/10 text-gray-400 hover:text-red-500 hover:scale-110"
              }`}
            >
              <Heart
                size={16}
                fill={isWishlisted ? "currentColor" : "none"}
                className={isWishlisted ? "animate-ping-once" : ""}
              />
            </button>
          )}
        </div>

        {/* Title & Desc */}
        <h3 className="font-extrabold text-lg line-clamp-1 group-hover:text-yellow-400 transition mb-1 text-white">
          {course.courseName}
        </h3>
        <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed h-8">
          {course.courseDescription}
        </p>

        {/* Badges: Level, Duration & Enrolled */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 border border-white/5">
            <Compass size={10} className="text-yellow-400" />
            {courseLevel}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 border border-white/5">
            <Clock size={10} className="text-yellow-400" />
            {courseDuration}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-lg text-gray-300 border border-white/5">
            <User size={10} className="text-yellow-400" />
            {studentCount} Students
          </span>
        </div>

        {/* Instructor & Rating */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5 text-sm">
          <div className="flex items-center gap-2">
            <img
              src={course.instructor?.image || "https://api.dicebear.com/5.x/initials/svg?seed=Instructor"}
              alt={course.instructor?.firstName}
              className="w-6 h-6 rounded-full object-cover border border-yellow-400/20"
            />
            <span className="text-gray-300 text-xs truncate max-w-[120px]">
              {course.instructor?.firstName} {course.instructor?.lastName}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-yellow-400 font-bold">{ratingValue}</span>
            <div className="flex text-yellow-400">
              <Star size={12} fill="currentColor" className="text-yellow-400" />
            </div>
            <span className="text-gray-500 font-medium">({reviewsCount})</span>
          </div>
        </div>
      </div>

      {/* Pricing and Action */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">Price</span>
          <span className="font-black text-xl text-yellow-400">
            {course.price === 0 ? "Free" : `₹${course.price}`}
          </span>
        </div>

        {isEnrolled ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate("/dashboard/enrolled-courses")
            }}
            className="px-4 py-2 text-xs bg-emerald-500/20 text-emerald-400 font-bold rounded-xl border border-emerald-500/30 hover:bg-emerald-500/30 transition duration-300"
          >
            Enrolled
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/course/${course._id}`)
            }}
            className="px-4 py-2.5 text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:scale-95 transition-all duration-300 shadow-md shadow-yellow-500/5"
          >
            Enroll Now
          </button>
        )}
      </div>
    </div>
  )
}
