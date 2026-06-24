import { useState, useEffect, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { apiConnector } from "../Services/apiConnector"
import { 
  Search, 
  Filter, 
  Compass, 
  TrendingUp, 
  Clock, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  X,
  BookOpen
} from "lucide-react"
import CourseCard from "../Components/Catalog/CourseCard"
import toast, { Toaster } from "react-hot-toast"

export default function ExploreCatalog() {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  // Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLevel, setSelectedLevel] = useState("All")
  const [selectedRating, setSelectedRating] = useState("")
  const [selectedPrice, setSelectedPrice] = useState("")
  const [sortOption, setSortOption] = useState("Newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Data States
  const [courses, setCourses] = useState([])
  const [trendingCourses, setTrendingCourses] = useState([])
  const [newCourses, setNewCourses] = useState([])
  
  // Loading & Error States
  const [loading, setLoading] = useState(true)
  const [sectionsLoading, setSectionsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mobile filters overlay state
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Fetch Categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await apiConnector("GET", "/course/showAllCategories")
        if (res.data.success) {
          setCategories(res.data.data)
        }
      } catch (err) {
        console.error("Categories fetch error:", err)
      }
    }
    fetchCategories()
  }, [])

  // Fetch sections (Trending and Newly Added)
  useEffect(() => {
    async function fetchSections() {
      setSectionsLoading(true)
      try {
        const trendingRes = await apiConnector("GET", "/course/trending")
        if (trendingRes.data.success) {
          setTrendingCourses(trendingRes.data.data)
        }
        const newRes = await apiConnector("GET", "/course/new")
        if (newRes.data.success) {
          setNewCourses(newRes.data.data)
        }
      } catch (err) {
        console.error("Sections fetch error:", err)
      } finally {
        setSectionsLoading(false)
      }
    }
    fetchSections()
  }, [])

  // Fetch explore courses based on filters/sorting/pagination
  const fetchExploreCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        search: searchQuery,
        category: selectedCategory,
        level: selectedLevel,
        rating: selectedRating,
        price: selectedPrice,
        sort: sortOption,
        page: currentPage,
        limit: 6
      }
      
      const res = await apiConnector("GET", "/course/explore", null, null, params)
      if (res.data.success) {
        setCourses(res.data.data.courses)
        setTotalPages(res.data.data.totalPages)
      } else {
        setError("Failed to fetch courses")
      }
    } catch (err) {
      console.error("Explore fetch error:", err)
      setError("Failed to connect to catalog database")
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory, selectedLevel, selectedRating, selectedPrice, sortOption, currentPage])

  // Fetch when filters/page change
  useEffect(() => {
    fetchExploreCourses()
  }, [fetchExploreCourses])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearchQuery(searchInput)
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setSearchInput("")
    setSearchQuery("")
    setSelectedCategory("All")
    setSelectedLevel("All")
    setSelectedRating("")
    setSelectedPrice("")
    setSortOption("Newest")
    setCurrentPage(1)
  }

  // Handle wishlist sync locally when catalog state toggles
  const handleLocalWishlistToggle = (courseId, isAdded) => {
    // Optionally trigger refreshes or let components maintain state
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans antialiased pb-24 relative overflow-hidden">
      <Toaster position="top-center" />

      {/* Decorative ambient background glows */}
      <div className="absolute w-[600px] h-[600px] bg-yellow-500/5 blur-[160px] rounded-full pointer-events-none -top-40 -left-40 z-0"></div>
      <div className="absolute w-[600px] h-[600px] bg-indigo-500/5 blur-[160px] rounded-full pointer-events-none -bottom-40 -right-40 z-0"></div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-black text-xl">
            S
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            StudyNotion
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/catalog" className="text-yellow-400 font-medium hover:text-yellow-300 transition text-sm">
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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold hover:scale-95 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-300 hover:text-white transition text-xs font-semibold px-2 py-1">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold hover:scale-95 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative px-6 pt-12 pb-6 max-w-7xl mx-auto z-10">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
            <Compass className="text-yellow-400" size={36} /> Explore Catalog
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl">
            Search and filter hundreds of top-tier courses. Learn modern development, design, and engineering fields.
          </p>
        </div>
      </section>

      {/* Trending & New Sections */}
      {!sectionsLoading && (trendingCourses.length > 0 || newCourses.length > 0) && (
        <section className="px-6 py-6 max-w-7xl mx-auto z-10 relative space-y-12">
          {/* Trending Section */}
          {trendingCourses.length > 0 && (
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2 mb-4 text-yellow-400">
                <TrendingUp size={20} /> Popular & Trending
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingCourses.slice(0, 4).map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    isWishlistedInitial={user?.wishlist?.includes(course._id)}
                    onWishlistToggle={handleLocalWishlistToggle}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Newly Added Section */}
          {newCourses.length > 0 && (
            <div>
              <h2 className="text-xl font-extrabold flex items-center gap-2 mb-4 text-orange-400">
                <Clock size={20} /> Newly Added Courses
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {newCourses.slice(0, 4).map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    isWishlistedInitial={user?.wishlist?.includes(course._id)}
                    onWishlistToggle={handleLocalWishlistToggle}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Main Catalog Search & Filter Section */}
      <section className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-4 gap-8 z-10 relative">
        
        {/* Desktop Filter Panel */}
        <aside className="hidden lg:block space-y-6 bg-slate-900/50 border border-white/5 p-6 rounded-3xl backdrop-blur-xl h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <span className="font-extrabold text-lg flex items-center gap-2">
              <Filter size={18} className="text-yellow-400" /> Filters
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-yellow-400/80 hover:text-yellow-400 hover:underline font-semibold"
            >
              Reset All
            </button>
          </div>

          {/* Categories Filter */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm tracking-wide text-gray-400 uppercase">Categories</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setSelectedCategory("All"); setCurrentPage(1); }}
                className={`text-left px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                  selectedCategory === "All"
                    ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                    : "border-transparent text-gray-300 hover:bg-white/5"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => { setSelectedCategory(cat._id); setCurrentPage(1); }}
                  className={`text-left px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                    selectedCategory === cat._id
                      ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                      : "border-transparent text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Level Filter */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h4 className="font-bold text-sm tracking-wide text-gray-400 uppercase">Difficulty Level</h4>
            <div className="flex flex-col gap-2">
              {["All", "Beginner", "Intermediate", "Advanced"].map((level) => (
                <button
                  key={level}
                  onClick={() => { setSelectedLevel(level); setCurrentPage(1); }}
                  className={`text-left px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                    selectedLevel === level
                      ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                      : "border-transparent text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {level === "All" ? "All Levels" : level}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h4 className="font-bold text-sm tracking-wide text-gray-400 uppercase">Ratings</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "All Ratings", value: "" },
                { label: "4.5 & up", value: "4.5" },
                { label: "4.0 & up", value: "4.0" },
                { label: "3.5 & up", value: "3.5" },
              ].map((rat) => (
                <button
                  key={rat.label}
                  onClick={() => { setSelectedRating(rat.value); setCurrentPage(1); }}
                  className={`text-left px-3 py-2 text-xs font-semibold rounded-xl border transition flex items-center justify-between ${
                    selectedRating === rat.value
                      ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                      : "border-transparent text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <span>{rat.label}</span>
                  {rat.value && <Star size={12} fill="currentColor" className="text-yellow-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h4 className="font-bold text-sm tracking-wide text-gray-400 uppercase">Pricing</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "Any Price", value: "" },
                { label: "Free Courses", value: "Free" },
                { label: "Paid Courses", value: "Paid" },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => { setSelectedPrice(p.value); setCurrentPage(1); }}
                  className={`text-left px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                    selectedPrice === p.value
                      ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                      : "border-transparent text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Courses Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls Bar: Search, Sorting, and Mobile Filters Toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-white/5 p-4 rounded-3xl backdrop-blur-xl">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md w-full">
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full bg-slate-950 border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-white text-xs outline-none focus:border-yellow-400/50 transition"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>

            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
              {/* Mobile filter button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950 border border-white/5 text-xs text-gray-300 font-semibold"
              >
                <Filter size={14} /> Filter
              </button>

              {/* Sorting */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs font-medium whitespace-nowrap">Sort By</span>
                <select
                  value={sortOption}
                  onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-950 border border-white/5 rounded-2xl px-4 py-2.5 text-xs text-white outline-none focus:border-yellow-400/50 cursor-pointer"
                >
                  <option value="Newest">Newest</option>
                  <option value="Popular">Popular (Most Students)</option>
                  <option value="Highest Rated">Highest Rated</option>
                  <option value="Price Low-High">Price: Low to High</option>
                  <option value="Price High-Low">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-3xl p-5 h-96 flex flex-col justify-between animate-pulse">
                  <div>
                    <div className="w-full aspect-video bg-slate-800 rounded-2xl mb-4"></div>
                    <div className="h-6 bg-slate-800 rounded-lg w-3/4 mb-3"></div>
                    <div className="h-4 bg-slate-800 rounded-lg w-full mb-2"></div>
                    <div className="h-4 bg-slate-800 rounded-lg w-5/6 mb-4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 w-16 bg-slate-800 rounded-md"></div>
                      <div className="h-6 w-16 bg-slate-800 rounded-md"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="h-8 w-16 bg-slate-800 rounded-lg"></div>
                    <div className="h-8 w-24 bg-slate-800 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-slate-900/20 border border-white/5 rounded-3xl text-gray-500">
              <p className="text-lg font-medium">{error}</p>
              <button
                onClick={fetchExploreCourses}
                className="mt-4 px-5 py-2.5 bg-yellow-400 text-black font-semibold rounded-xl text-sm hover:scale-95 transition"
              >
                Retry
              </button>
            </div>
          ) : courses.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 bg-slate-900/20 border border-white/5 rounded-3xl text-gray-500 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <BookOpen size={28} className="text-yellow-400" />
              </div>
              <p className="text-lg font-bold text-white mb-1">No courses found matching your criteria</p>
              <p className="text-gray-400 text-sm max-w-sm">Try relaxing your search query or reset filters to explore all premium courses.</p>
              <button
                onClick={resetFilters}
                className="mt-6 px-5 py-2.5 bg-yellow-400 text-black font-semibold rounded-xl text-xs hover:scale-95 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Main Courses Grid list */
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    isWishlistedInitial={user?.wishlist?.includes(course._id)}
                    onWishlistToggle={handleLocalWishlistToggle}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 bg-slate-900/40 border border-white/5 py-4 px-6 rounded-3xl backdrop-blur-xl w-fit mx-auto">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-slate-950 border border-white/5 text-gray-300 hover:text-white rounded-xl disabled:opacity-30 disabled:hover:text-gray-300 transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-extrabold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-slate-950 border border-white/5 text-gray-300 hover:text-white rounded-xl disabled:opacity-30 disabled:hover:text-gray-300 transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Mobile Filters Drawer Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-80 h-full bg-[#020617] border-l border-white/10 p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <span className="font-extrabold text-lg flex items-center gap-2">
                  <Filter size={18} className="text-yellow-400" /> Filters
                </span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 bg-white/5 rounded-lg text-gray-400 hover:text-white transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-3 pt-4">
                <h4 className="font-bold text-xs tracking-wide text-gray-400 uppercase">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setSelectedCategory("All"); setCurrentPage(1); }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                      selectedCategory === "All"
                        ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                        : "border-white/5 bg-slate-900/50 text-gray-300"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => { setSelectedCategory(cat._id); setCurrentPage(1); }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                        selectedCategory === cat._id
                          ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                          : "border-white/5 bg-slate-900/50 text-gray-300"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Levels */}
              <div className="space-y-3 pt-4 border-t border-white/5 mt-4">
                <h4 className="font-bold text-xs tracking-wide text-gray-400 uppercase">Difficulty Level</h4>
                <div className="flex flex-wrap gap-2">
                  {["All", "Beginner", "Intermediate", "Advanced"].map((level) => (
                    <button
                      key={level}
                      onClick={() => { setSelectedLevel(level); setCurrentPage(1); }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                        selectedLevel === level
                          ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                          : "border-white/5 bg-slate-900/50 text-gray-300"
                      }`}
                    >
                      {level === "All" ? "All Levels" : level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ratings */}
              <div className="space-y-3 pt-4 border-t border-white/5 mt-4">
                <h4 className="font-bold text-xs tracking-wide text-gray-400 uppercase">Ratings</h4>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "All Ratings", value: "" },
                    { label: "4.5 & up", value: "4.5" },
                    { label: "4.0 & up", value: "4.0" },
                    { label: "3.5 & up", value: "3.5" },
                  ].map((rat) => (
                    <button
                      key={rat.label}
                      onClick={() => { setSelectedRating(rat.value); setCurrentPage(1); }}
                      className={`text-left px-3 py-2 text-xs font-semibold rounded-xl border transition flex items-center justify-between ${
                        selectedRating === rat.value
                          ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                          : "border-white/5 bg-slate-900/50 text-gray-300"
                      }`}
                    >
                      <span>{rat.label}</span>
                      {rat.value && <Star size={12} fill="currentColor" className="text-yellow-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-3 pt-4 border-t border-white/5 mt-4">
                <h4 className="font-bold text-xs tracking-wide text-gray-400 uppercase">Pricing</h4>
                <div className="flex gap-2">
                  {[
                    { label: "Any", value: "" },
                    { label: "Free", value: "Free" },
                    { label: "Paid", value: "Paid" },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => { setSelectedPrice(p.value); setCurrentPage(1); }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                        selectedPrice === p.value
                          ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                          : "border-white/5 bg-slate-900/50 text-gray-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-6 border-t border-white/5 mt-6">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 border border-white/10 text-xs text-gray-400 hover:text-white font-bold rounded-2xl transition bg-slate-950"
              >
                Reset
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-2xl hover:scale-95 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
