import { useState, useEffect } from "react"
import { useParams, useNavigate, useOutletContext } from "react-router-dom"
import { apiConnector } from "../../Services/apiConnector"
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  Play, 
  FileText, 
  Video, 
  Film, 
  Check, 
  X,
  Upload,
  BookOpen
} from "lucide-react"
import toast from "react-hot-toast"

export default function AdminEditCourse() {
  const { courseId } = useParams()
  const { darkMode } = useOutletContext()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Course metadata edit form
  const [courseName, setCourseName] = useState("")
  const [courseDescription, setCourseDescription] = useState("")
  const [whatYouWillLearn, setWhatYouWillLearn] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  
  // Section states
  const [newSectionName, setNewSectionName] = useState("")
  const [editingSectionId, setEditingSectionId] = useState(null)
  const [editingSectionName, setEditingSectionName] = useState("")

  // Subsection (Lecture) states
  const [activeSectionId, setActiveSectionId] = useState(null) // for add lecture modal
  const [lectureTitle, setLectureTitle] = useState("")
  const [lectureDesc, setLectureDesc] = useState("")
  const [lectureVideo, setLectureVideo] = useState(null)
  const [lectureVideoPreview, setLectureVideoPreview] = useState("")
  const [uploadingLecture, setUploadingLecture] = useState(false)
  const [editingLecture, setEditingLecture] = useState(null) // holds lecture object when editing

  const fetchCourseDetails = async () => {
    try {
      const res = await apiConnector("POST", "/course/getFullCourseDetails", { courseId })
      if (res.data.success) {
        const details = res.data.data.courseDetails
        setCourse(details)
        setCourseName(details.courseName || "")
        setCourseDescription(details.courseDescription || "")
        setWhatYouWillLearn(details.whatYouWillLearn || "")
        setPrice(details.price || "")
        setCategory(details.category?._id || details.category || "")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load course details")
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await apiConnector("GET", "/course/showAllCategories")
      if (res.data.success) {
        setCategories(res.data.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchCategories()
      await fetchCourseDetails()
      setLoading(false)
    }
    init()
  }, [courseId])

  // Save metadata changes
  const handleSaveMetadata = async (e) => {
    e.preventDefault()
    const toastId = toast.loading("Updating course metadata...")
    try {
      const res = await apiConnector("PUT", "/admin/editCourse", {
        courseId,
        courseName,
        courseDescription,
        whatYouWillLearn,
        price,
        category
      })

      if (res.data.success) {
        toast.success("Course metadata updated!", { id: toastId })
        fetchCourseDetails()
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to update course details", { id: toastId })
    }
  }

  // --- SECTION ACTIONS ---
  const handleAddSection = async (e) => {
    e.preventDefault()
    if (!newSectionName.trim()) return

    try {
      const res = await apiConnector("POST", "/admin/addSection", {
        sectionName: newSectionName.trim(),
        courseId
      })
      if (res.data.success) {
        toast.success("Section added successfully")
        setNewSectionName("")
        fetchCourseDetails()
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to add section")
    }
  }

  const handleUpdateSection = async (sectionId) => {
    if (!editingSectionName.trim()) return

    try {
      const res = await apiConnector("PUT", "/admin/updateSection", {
        sectionId,
        sectionName: editingSectionName.trim()
      })
      if (res.data.success) {
        toast.success("Section renamed successfully")
        setEditingSectionId(null)
        fetchCourseDetails()
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to rename section")
    }
  }

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Are you sure you want to delete this section and all of its lectures?")) {
      return
    }

    try {
      const res = await apiConnector("DELETE", "/admin/deleteSection", {
        sectionId,
        courseId
      })
      if (res.data.success) {
        toast.success("Section deleted successfully")
        fetchCourseDetails()
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete section")
    }
  }

  // --- SUBSECTION / LECTURE ACTIONS ---
  const handleVideoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLectureVideo(file)
      setLectureVideoPreview(URL.createObjectURL(file))
    }
  }

  const handleSaveLecture = async (e) => {
    e.preventDefault()
    if (!lectureTitle.trim() || !lectureDesc.trim()) {
      toast.error("Please enter a title and description")
      return
    }

    setUploadingLecture(true)
    const toastId = toast.loading(
      editingLecture ? "Updating lecture details..." : "Uploading video and creating lecture module..."
    )

    try {
      const formData = new FormData()
      formData.append("sectionId", activeSectionId)
      formData.append("title", lectureTitle)
      formData.append("description", lectureDesc)
      if (lectureVideo) {
        formData.append("video", lectureVideo)
      }

      let res
      if (editingLecture) {
        formData.append("subSectionId", editingLecture._id)
        res = await apiConnector("PUT", "/admin/updateSubSection", formData, {
          "Content-Type": "multipart/form-data"
        })
      } else {
        if (!lectureVideo) {
          toast.error("Please select a video file to upload", { id: toastId })
          setUploadingLecture(false)
          return
        }
        res = await apiConnector("POST", "/admin/addSubSection", formData, {
          "Content-Type": "multipart/form-data"
        })
      }

      if (res.data.success) {
        toast.success(editingLecture ? "Lecture updated!" : "Lecture added successfully!", { id: toastId })
        closeLectureModal()
        fetchCourseDetails()
      } else {
        toast.error(res.data.message || "Failed to save lecture", { id: toastId })
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred during video upload/save", { id: toastId })
    } finally {
      setUploadingLecture(false)
    }
  }

  const handleDeleteLecture = async (subSectionId, sectionId) => {
    if (!window.confirm("Delete this lecture permanently?")) {
      return
    }

    try {
      const res = await apiConnector("DELETE", "/admin/deleteSubSection", {
        subSectionId,
        sectionId
      })
      if (res.data.success) {
        toast.success("Lecture deleted successfully")
        fetchCourseDetails()
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete lecture")
    }
  }

  const openAddLectureModal = (sectionId) => {
    setActiveSectionId(sectionId)
    setLectureTitle("")
    setLectureDesc("")
    setLectureVideo(null)
    setLectureVideoPreview("")
    setEditingLecture(null)
  }

  const openEditLectureModal = (sectionId, lec) => {
    setActiveSectionId(sectionId)
    setLectureTitle(lec.title || "")
    setLectureDesc(lec.description || "")
    setLectureVideo(null)
    setLectureVideoPreview(lec.videoUrl || "")
    setEditingLecture(lec)
  }

  const closeLectureModal = () => {
    setActiveSectionId(null)
    setEditingLecture(null)
    setLectureTitle("")
    setLectureDesc("")
    setLectureVideo(null)
    setLectureVideoPreview("")
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20 animate-fadeIn relative">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/courses")}
          className={`p-2 rounded-xl border transition ${
            darkMode ? "hover:bg-white/5 border-white/10" : "hover:bg-gray-100 border-gray-200 text-gray-700"
          }`}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Course Builder</h1>
          <p className={`text-sm mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Curate sections, upload lecture videos, and edit details for <span className="text-yellow-400 font-semibold">{course?.courseName}</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Course Metadata Editor */}
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border ${
            darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
          }`}>
            <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-yellow-400" /> Course Details
            </h3>
            
            <form onSubmit={handleSaveMetadata} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Course Title</label>
                <input
                  type="text"
                  required
                  className="w-full mt-2 p-3 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Description</label>
                <textarea
                  rows="4"
                  required
                  className="w-full mt-2 p-3 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">What Students Will Learn</label>
                <textarea
                  rows="3"
                  required
                  className="w-full mt-2 p-3 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                  value={whatYouWillLearn}
                  onChange={(e) => setWhatYouWillLearn(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Category</label>
                  <select
                    required
                    className="w-full mt-2 p-3 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-gray-300"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id} className="bg-slate-900 text-white">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Price ($)</label>
                  <input
                    type="number"
                    required
                    className="w-full mt-2 p-3 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold rounded-xl text-sm transition hover:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/10"
              >
                <Save size={16} />
                <span>Save General Info</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Curriculum (Sections and SubSections) Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`p-6 md:p-8 rounded-3xl border ${
            darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
          }`}>
            <h3 className="font-extrabold text-lg mb-6">Course Curriculum</h3>
            
            {/* Add Section Form */}
            <form onSubmit={handleAddSection} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Enter new section name (e.g. Getting Started)..."
                required
                className="flex-1 p-3 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
              />
              <button
                type="submit"
                className="px-5 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-sm rounded-xl transition flex items-center gap-1.5"
              >
                <Plus size={16} />
                <span>Add Section</span>
              </button>
            </form>

            {/* Curriculum structure */}
            <div className="space-y-6">
              {course?.courseContent && course.courseContent.length > 0 ? (
                course.courseContent.map((section) => {
                  const isEditingSection = editingSectionId === section._id
                  
                  return (
                    <div 
                      key={section._id} 
                      className={`p-5 rounded-2xl border transition-all ${
                        darkMode ? "bg-slate-950/40 border-white/5 hover:border-white/10" : "bg-gray-50 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* Section Header */}
                      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-white/5">
                        
                        {/* Section name input / label */}
                        {isEditingSection ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              className="flex-1 p-2 bg-slate-950 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-yellow-400"
                              value={editingSectionName}
                              onChange={(e) => setEditingSectionName(e.target.value)}
                            />
                            <button
                              onClick={() => handleUpdateSection(section._id)}
                              className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingSectionId(null)}
                              className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-yellow-400">{section.sectionName}</h4>
                            <button
                              onClick={() => {
                                setEditingSectionId(section._id)
                                setEditingSectionName(section.sectionName)
                              }}
                              className="p-1 text-gray-500 hover:text-white transition"
                              title="Rename Section"
                            >
                              <Edit3 size={14} />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openAddLectureModal(section._id)}
                            className="text-xs bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                          >
                            <Plus size={12} />
                            <span>Add Lecture</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section._id)}
                            className="p-1.5 text-red-400 hover:bg-red-500/15 rounded-lg transition"
                            title="Delete Section"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Section Subsections (Lectures) */}
                      <div className="space-y-2">
                        {section.subSection && section.subSection.length > 0 ? (
                          section.subSection.map((sub) => (
                            <div 
                              key={sub._id}
                              className={`flex items-center justify-between gap-4 p-3 rounded-xl border text-sm transition-all group ${
                                darkMode ? "bg-slate-900 border-white/5 hover:bg-white/5" : "bg-white border-gray-100 hover:border-gray-200 shadow-xs"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Video size={16} className="text-gray-500 shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-bold truncate">{sub.title}</p>
                                  <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                                    Duration: {Math.round(parseFloat(sub.timeDuration || 0))}s | {sub.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => openEditLectureModal(section._id, sub)}
                                  className="p-1.5 text-blue-400 hover:bg-white/10 rounded-lg transition"
                                  title="Edit Video / Details"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteLecture(sub._id, section._id)}
                                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                  title="Delete Lecture"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 italic text-center py-4">No lecture modules added in this section yet.</p>
                        )}
                      </div>

                    </div>
                  )
                })
              ) : (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl text-gray-500">
                  <p className="font-medium text-sm">No sections created yet.</p>
                  <p className="text-xs text-gray-600 mt-1">Start by typing a section title above and clicking "Add Section".</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Add / Edit Lecture Modal */}
      {activeSectionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-3xl border overflow-hidden animate-zoomIn ${
            darkMode ? "bg-[#0c1222] border-white/10 text-white" : "bg-white border-gray-200 text-gray-800"
          }`}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-black text-lg">{editingLecture ? "Edit Lecture" : "Upload New Lecture"}</h3>
              <button onClick={closeLectureModal} className="p-1 hover:bg-white/10 rounded-lg transition">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveLecture} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Lecture Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to State Slices"
                  className="w-full mt-2 p-3 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain what is covered in this lecture video module..."
                  className="w-full mt-2 p-3 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
                  value={lectureDesc}
                  onChange={(e) => setLectureDesc(e.target.value)}
                />
              </div>

              {/* Video upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Lecture Video File</label>
                {lectureVideoPreview ? (
                  <div className="space-y-2">
                    <div className="w-full bg-slate-950 aspect-video rounded-xl overflow-hidden border border-white/10 relative">
                      <video src={lectureVideoPreview} controls className="w-full h-full object-contain" />
                    </div>
                    <label className="text-xs text-yellow-400 hover:underline cursor-pointer block font-bold text-center">
                      Replace Video File
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                    </label>
                  </div>
                ) : (
                  <label className="w-full py-10 border-2 border-dashed border-white/10 hover:border-yellow-400/30 rounded-xl flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/10 group">
                    <Film size={32} className="text-gray-500 group-hover:text-yellow-400 transition" />
                    <span className="text-xs font-bold text-gray-300 mt-2.5 group-hover:text-yellow-400 transition">Select MP4/MOV Video File</span>
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                  </label>
                )}
              </div>

              <div className="pt-4 flex gap-3 border-t border-white/5">
                <button
                  type="submit"
                  disabled={uploadingLecture}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold rounded-xl text-sm transition hover:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-1.5"
                >
                  {uploadingLecture ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Uploading Video...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>{editingLecture ? "Save Lecture" : "Upload & Create"}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeLectureModal}
                  className={`px-5 py-3 border rounded-xl text-sm font-semibold transition hover:bg-white/5 ${
                    darkMode ? "border-white/10 text-gray-400" : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
