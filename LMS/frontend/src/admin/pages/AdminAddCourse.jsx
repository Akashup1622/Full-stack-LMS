import { useState, useEffect } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { apiConnector } from "../../Services/apiConnector"
import { ArrowLeft, Save, Plus, X, UploadCloud } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function AdminAddCourse() {
  const { darkMode } = useOutletContext()
  const navigate = useNavigate()

  const [courseName, setCourseName] = useState("")
  const [courseDescription, setCourseDescription] = useState("")
  const [whatYouWillLearn, setWhatYouWillLearn] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState([])

  // Tags & Instructions array builders
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState([])
  const [instructionInput, setInstructionInput] = useState("")
  const [instructions, setInstructions] = useState([])

  // File upload state
  const [thumbnail, setThumbnail] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiConnector("GET", "/course/showAllCategories")
        if (res.data.success) {
          setCategories(res.data.data)
        }
      } catch (err) {
        console.error(err)
        toast.error("Failed to load course categories")
      }
    }
    fetchCategories()
  }, [])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (t) => {
    setTags(tags.filter(item => item !== t))
  }

  const handleAddInstruction = () => {
    if (instructionInput.trim() && !instructions.includes(instructionInput.trim())) {
      setInstructions([...instructions, instructionInput.trim()])
      setInstructionInput("")
    }
  }

  const handleRemoveInstruction = (inst) => {
    setInstructions(instructions.filter(item => item !== inst))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setThumbnail(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Submitting Admin Course creation form. Active parameters:", {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      category,
      thumbnailName: thumbnail ? thumbnail.name : "No thumbnail selected",
      tagsCount: tags.length,
      instructionsCount: instructions.length
    })

    if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail) {
      toast.error("Please fill in all fields and select a thumbnail image")
      return
    }

    if (tags.length === 0) {
      toast.error("Please add at least one tag")
      return
    }

    if (instructions.length === 0) {
      toast.error("Please add at least one instruction")
      return
    }

    setLoading(true)
    const toastId = toast.loading("Uploading thumbnail and creating course...")

    try {
      const formData = new FormData()
      formData.append("courseName", courseName)
      formData.append("courseDescription", courseDescription)
      formData.append("whatYouWillLearn", whatYouWillLearn)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("tag", JSON.stringify(tags))
      formData.append("instructions", JSON.stringify(instructions))
      formData.append("thumbnailImage", thumbnail)

      const res = await apiConnector("POST", "/admin/createCourse", formData, {
        "Content-Type": "multipart/form-data"
      })

      if (res.data.success) {
        toast.success("Course metadata created successfully!", { id: toastId })
        // Redirect to curriculum editor
        navigate(`/admin/courses/edit/${res.data.data._id}`)
      } else {
        toast.error(res.data.message || "Failed to create course", { id: toastId })
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Failed to publish course information", { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/courses")}
          className={`p-2 rounded-xl border transition ${darkMode ? "hover:bg-white/5 border-white/10" : "hover:bg-gray-100 border-gray-200 text-gray-700"
            }`}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Add Course</h1>
          <p className={`text-sm mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Register a new curriculum entry. You can build sections and upload videos next.
          </p>
        </div>
      </div>

      {/* Main Creation Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left column (Form Fields) */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`p-6 md:p-8 rounded-3xl border space-y-5 ${darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
            }`}>

            {/* Course Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Course Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Complete Web Development Bootcamp"
                className="w-full mt-2.5 p-3.5 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
            </div>

            {/* Course Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Description</label>
              <textarea
                rows="4"
                required
                placeholder="Write a compelling course description summary..."
                className="w-full mt-2.5 p-3.5 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
              />
            </div>

            {/* What you will learn */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">What Students Will Learn</label>
              <textarea
                rows="3"
                required
                placeholder="Describe key learning outcomes..."
                className="w-full mt-2.5 p-3.5 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                value={whatYouWillLearn}
                onChange={(e) => setWhatYouWillLearn(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Category</label>
                <select
                  required
                  className="w-full mt-2.5 p-3.5 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-gray-300"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="" disabled className="bg-slate-900 text-gray-500">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id} className="bg-slate-900 text-white">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Enrollment Price ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 49"
                  className="w-full mt-2.5 p-3.5 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

          </div>

          {/* Tags and Instructions */}
          <div className={`p-6 md:p-8 rounded-3xl border space-y-6 ${darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
            }`}>

            {/* Tags array inputs */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Course Tags</label>
              <div className="flex gap-2 mt-2.5">
                <input
                  type="text"
                  placeholder="e.g. React, NextJS, Python"
                  className="flex-1 p-3 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-bold text-sm transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3.5">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded-full text-xs font-bold">
                    <span>{t}</span>
                    <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-red-400 transition">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Instructions array inputs */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Course Requirements / Instructions</label>
              <div className="flex gap-2 mt-2.5">
                <input
                  type="text"
                  placeholder="e.g. Basic understanding of HTML/CSS is required"
                  className="flex-1 p-3 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                  value={instructionInput}
                  onChange={(e) => setInstructionInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInstruction())}
                />
                <button
                  type="button"
                  onClick={handleAddInstruction}
                  className="px-4 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-bold text-sm transition"
                >
                  Add
                </button>
              </div>
              <ul className="mt-4 space-y-2">
                {instructions.map((inst, i) => (
                  <li key={i} className="flex justify-between items-center gap-3 p-3 bg-slate-900/40 rounded-xl text-sm border border-white/5">
                    <span className="text-gray-300">{inst}</span>
                    <button type="button" onClick={() => handleRemoveInstruction(inst)} className="text-red-400 hover:text-red-500 transition">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Right column (Thumbnail & Publish settings) */}
        <div className="space-y-6">

          {/* Thumbnail Box */}
          <div className={`p-6 rounded-3xl border flex flex-col items-center text-center ${darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
            }`}>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Course Thumbnail</label>

            {previewUrl ? (
              <div className="w-full space-y-4">
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/15">
                  <img src={previewUrl} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => { setThumbnail(null); setPreviewUrl(""); }}
                  className="text-xs text-red-400 hover:underline font-bold"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <label className="w-full aspect-video border-2 border-dashed border-white/10 hover:border-yellow-400/40 rounded-2xl flex flex-col items-center justify-center cursor-pointer p-4 transition group bg-slate-950/20">
                <UploadCloud size={40} className="text-gray-500 group-hover:text-yellow-400 transition" />
                <span className="text-xs font-bold text-gray-300 mt-3 group-hover:text-yellow-400 transition">Upload Thumbnail Image</span>
                <span className="text-[10px] text-gray-500 mt-1">PNG, JPG or WEBP (Max 2MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* Form Actions */}
          <div className={`p-6 rounded-3xl border space-y-3.5 ${darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
            }`}>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-extrabold rounded-xl text-sm transition hover:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  <span>Create Course</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/courses")}
              className={`w-full py-3 border rounded-xl text-sm font-semibold transition hover:bg-white/5 ${darkMode ? "border-white/10 text-gray-400" : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              Cancel
            </button>
          </div>

        </div>

      </form>

    </div>
  )
}
