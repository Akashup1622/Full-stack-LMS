import { useState } from "react"
import { Heart, Compass } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([])
  const navigate = useNavigate()

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Wishlist</h1>
        <p className="text-gray-400 text-sm mt-1">Keep track of courses you want to enroll in later</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl text-gray-500">
          <Heart size={48} className="mx-auto mb-3 text-red-500/80 animate-pulse" />
          <p className="text-lg font-medium">Your wishlist is currently empty.</p>
          <button
            onClick={() => navigate("/catalog")}
            className="mt-4 px-5 py-2.5 bg-yellow-400 text-black font-semibold rounded-xl text-sm hover:scale-95 transition"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {wishlist.map((course) => (
            <div
              key={course._id}
              onClick={() => navigate(`/course/${course._id}`)}
              className="bg-white/5 border border-white/10 rounded-3xl p-5 hover:border-yellow-400/30 transition duration-300 cursor-pointer flex gap-5"
            >
              <img
                src={course.thumbnail}
                alt={course.courseName}
                className="w-36 aspect-video object-cover rounded-2xl border border-white/5"
              />
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-lg line-clamp-1">{course.courseName}</h3>
                  <p className="text-gray-400 text-xs mt-1">By {course.instructor?.firstName}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold text-yellow-400">₹{course.price}</span>
                  <button className="text-red-400 text-xs hover:underline">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
