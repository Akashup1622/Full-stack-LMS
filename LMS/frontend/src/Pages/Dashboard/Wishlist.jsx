import { useState, useEffect } from "react"
import { Heart, Compass, Trash2, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { apiConnector } from "../../Services/apiConnector"
import { setUser } from "../../Redux/Slices/authSlice"
import toast, { Toaster } from "react-hot-toast"

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  // Fetch wishlist on mount
  useEffect(() => {
    async function fetchWishlist() {
      try {
        const res = await apiConnector("GET", "/course/wishlist")
        if (res.data.success) {
          setWishlist(res.data.wishlist)
        }
      } catch (err) {
        console.error("Fetch wishlist error:", err)
        toast.error("Failed to load wishlist")
      } finally {
        setLoading(false)
      }
    }
    fetchWishlist()
  }, [])

  // Handle wishlist item removal
  const handleRemove = async (courseId, e) => {
    e.stopPropagation()
    const t = toast.loading("Removing course...")
    try {
      const res = await apiConnector("POST", "/course/wishlist/remove", { courseId })
      if (res.data.success) {
        toast.success("Removed from wishlist", { id: t })
        
        // Remove from local state
        setWishlist((prev) => prev.filter((course) => course._id !== courseId))
        
        // Update user state in Redux & localStorage
        const updatedWishlist = user.wishlist?.filter((id) => id !== courseId) || []
        const updatedUser = { ...user, wishlist: updatedWishlist }
        dispatch(setUser(updatedUser))
      } else {
        toast.error(res.data.message || "Failed to remove course", { id: t })
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Failed to remove course", { id: t })
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn text-white">
      <Toaster position="top-center" />
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent w-fit">
          My Wishlist
        </h1>
        <p className="text-gray-400 text-sm mt-1">Keep track of courses you want to enroll in later</p>
      </div>

      {loading ? (
        // Loading Skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className="bg-white/5 border border-white/10 rounded-3xl p-5 flex gap-5 animate-pulse h-40"
            >
              <div className="w-36 aspect-video bg-slate-800 rounded-2xl shrink-0"></div>
              <div className="flex-grow flex flex-col justify-between py-1">
                <div className="space-y-2">
                  <div className="h-5 bg-slate-800 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-slate-800 rounded w-1/4"></div>
                  <div className="h-6 bg-slate-800 rounded w-1/5"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        // Empty State
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl text-gray-500">
          <Heart size={48} className="mx-auto mb-3 text-red-500/80 animate-pulse" />
          <p className="text-lg font-medium text-white mb-2">Your wishlist is currently empty.</p>
          <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">
            Browse through our premium selection of courses to get started on your learning journey.
          </p>
          <button
            onClick={() => navigate("/catalog")}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl text-xs hover:scale-95 transition shadow-lg shadow-yellow-500/10 flex items-center gap-2 mx-auto"
          >
            <Compass size={14} /> Explore Catalog
          </button>
        </div>
      ) : (
        // Wishlist Course Grid
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {wishlist.map((course) => (
            <div
              key={course._id}
              onClick={() => navigate(`/course/${course._id}`)}
              className="group bg-[#0f172a]/60 border border-white/10 hover:border-yellow-400/30 rounded-3xl p-5 hover:-translate-y-1 transition duration-300 cursor-pointer flex flex-col sm:flex-row gap-5 backdrop-blur-xl shadow-lg relative"
            >
              {/* Image */}
              <div className="w-full sm:w-36 aspect-video bg-slate-800 rounded-2xl overflow-hidden border border-white/5 shrink-0">
                <img
                  src={course.thumbnail}
                  alt={course.courseName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Course Info */}
              <div className="flex-grow flex flex-col justify-between py-1">
                <div>
                  <h3 className="font-extrabold text-lg line-clamp-1 group-hover:text-yellow-400 transition text-white">
                    {course.courseName}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    By {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/5 text-gray-300 px-2 py-0.5 rounded">
                    {course.level || "Beginner"}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5 sm:border-t-0 sm:mt-0">
                  <span className="font-black text-lg text-yellow-400">
                    {course.price === 0 ? "Free" : `₹${course.price}`}
                  </span>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => handleRemove(course._id, e)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition border border-white/5"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={14} />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/course/${course._id}`)
                      }}
                      className="px-4 py-2 text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:scale-95 transition flex items-center gap-1.5"
                    >
                      View Details <ArrowRight size={12} />
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
