import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { apiConnector } from "../Services/apiConnector"
import { Compass, Search, BookOpen, User, Star } from "lucide-react"
import { useSelector } from "react-redux"

export default function LandingPage() {
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    async function fetchData() {
      try {
        const catRes = await apiConnector("GET", "/course/showAllCategories")
        if (catRes.data.success) {
          setCategories(catRes.data.data)
        }
        const courseRes = await apiConnector("GET", "/course/getAllCourses")
        if (courseRes.data.success) {
          setCourses(courseRes.data.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      selectedCategory === "All" || course.category?._id === selectedCategory || course.category === selectedCategory
    const matchesSearch =
      course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseDescription?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0f19] via-[#020617] to-black text-white">
      {/* Glows */}
      <div className="absolute w-[400px] h-[400px] bg-yellow-500/10 blur-[130px] rounded-full top-20 left-10 pointer-events-none"></div>
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 blur-[140px] rounded-full top-1/2 right-10 pointer-events-none"></div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/70 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-black text-xl">
            S
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            StudyNotion
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/catalog" className="text-gray-300 hover:text-yellow-400 transition">
            Explore Courses
          </Link>
          {user ? (
            <Link
              to={
                user.accountType === "Student"
                  ? "/dashboard/enrolled-courses"
                  : user.accountType === "Instructor"
                    ? "/dashboard/instructor-courses"
                    : "/dashboard/admin-analytics"
              }
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold hover:scale-95 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-300 hover:text-white transition px-4 py-2">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold hover:scale-95 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 flex flex-col items-center text-center max-w-4xl mx-auto">
        <span className="text-yellow-400 font-bold tracking-widest text-sm uppercase bg-yellow-400/10 px-4 py-1.5 rounded-full border border-yellow-400/20 mb-6">
          ⚡ Empower Your Career
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Next-Generation <br />
          <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
            EdTech Learning
          </span>{" "}
          Platform
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Master coding, marketing, design, and business with video courses taught by global industry leaders.
        </p>

        {/* Search Bar */}
        <div className="relative w-full max-w-xl bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-xl flex items-center shadow-xl">
          <Search size={22} className="text-gray-400 ml-4" />
          <input
            type="text"
            placeholder="What do you want to learn today?"
            className="flex-1 bg-transparent py-4 px-4 text-white outline-none placeholder-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-6 py-3 rounded-xl transition hover:scale-95">
            Search
          </button>
        </div>
      </section>

      {/* Category Pills & Catalog */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Compass className="text-yellow-400" /> Browse Course Catalog
        </h2>

        {/* Pills */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-5 py-2.5 rounded-full font-semibold border transition shrink-0 ${selectedCategory === "All"
                ? "bg-yellow-400 border-yellow-400 text-black shadow-lg shadow-yellow-500/20"
                : "border-white/10 bg-white/5 text-gray-300 hover:text-white"
              }`}
          >
            All Courses
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-5 py-2.5 rounded-full font-semibold border transition shrink-0 ${selectedCategory === cat._id
                  ? "bg-yellow-400 border-yellow-400 text-black shadow-lg shadow-yellow-500/20"
                  : "border-white/10 bg-white/5 text-gray-300 hover:text-white"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-white/5 border border-white/10 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white/5 rounded-2xl border border-white/10">
            <BookOpen size={48} className="mx-auto mb-3" />
            <p className="text-lg font-medium">No courses found matching criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                onClick={() => navigate(`/course/${course._id}`)}
                className="group cursor-pointer bg-[#0f172a]/60 border border-white/10 rounded-2xl p-4 hover:border-yellow-400/40 hover:-translate-y-1 transition-all duration-300 backdrop-blur-xl shadow-lg hover:shadow-yellow-500/5 flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative rounded-xl overflow-hidden aspect-video mb-4 bg-slate-800">
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-yellow-400">
                    {course.category?.name || "Premium"}
                  </span>
                </div>

                {/* Details */}
                <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-yellow-400 transition">
                  {course.courseName}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                  {course.courseDescription}
                </p>

                <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <User size={14} />
                    <span>{course.instructor?.firstName || "Expert"} Instructor</span>
                  </div>
                  <span className="font-extrabold text-lg text-yellow-400">
                    ₹{course.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "10K+", label: "Students" },
            { value: "500+", label: "Courses" },
            { value: "100+", label: "Instructors" },
            { value: "4.9★", label: "Ratings" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
            >
              <h3 className="text-4xl font-bold text-yellow-400">
                {item.value}
              </h3>
              <p className="text-gray-400 mt-2">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">
          Why Learn With StudyNotion?
        </h2>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              title: "Expert Mentors",
              desc: "Learn from industry professionals.",
            },
            {
              title: "Lifetime Access",
              desc: "Study whenever you want.",
            },
            {
              title: "Certification",
              desc: "Earn certificates after completion.",
            },
            {
              title: "Community",
              desc: "Connect with learners worldwide.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
            >
              <h3 className="text-xl font-bold mb-4">
                {item.title}
              </h3>
              <p className="text-gray-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">
          What Our Students Say
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Rahul Sharma",
              review:
                "Amazing courses. I got my first internship after completing MERN Stack.",
            },
            {
              name: "Priya Verma",
              review:
                "Best platform for learning web development from scratch.",
            },
            {
              name: "Ankit Kumar",
              review:
                "The instructors explain concepts very clearly.",
            },
          ].map((item) => (
            <div
              key={item.name}
              className="bg-white/5 border border-white/10 rounded-3xl p-8"
            >
              <div className="flex gap-1 text-yellow-400 mb-4">
                ★★★★★
              </div>

              <p className="text-gray-300 mb-6">
                {item.review}
              </p>

              <h4 className="font-bold">
                {item.name}
              </h4>
            </div>
          ))}
        </div>
      </section>


      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-500 p-12 text-center">
          <h2 className="text-5xl font-black text-black mb-4">
            Become an Instructor
          </h2>

          <p className="text-black/80 text-lg mb-8">
            Share your knowledge and earn money by teaching students worldwide.
          </p>

          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-4 rounded-xl bg-black text-white font-bold"
          >
            Start Teaching Today
          </button>
        </div>
      </section>

      <footer className="border-t border-white/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-yellow-400 font-bold text-2xl">
              StudyNotion
            </h3>

            <p className="text-gray-400 mt-4">
              Empowering students through online education.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Courses</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Web Development</li>
              <li>Data Science</li>
              <li>AI & ML</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>About</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Help Center</li>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
