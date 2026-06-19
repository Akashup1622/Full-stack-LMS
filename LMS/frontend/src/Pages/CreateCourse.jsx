import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { apiConnector } from "../Services/apiConnector"
import { Save, Plus, Trash, Check, ArrowRight, ArrowLeft, Video, Film } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function CreateCourse() {
  const navigate = useNavigate()

  // Creation state
  const [step, setStep] = useState(1)
  const [course, setCourse] = useState(null)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Step 1 Form fields
  const [courseName, setCourseName] = useState("")
  const [courseDescription, setCourseDescription] = useState("")
  const [whatYouWillLearn, setWhatYouWillLearn] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [thumbnailFile, setThumbnailFile] = useState(null)

  // Step 2 Form fields (Curriculum builders)
  const [sections, setSections] = useState([])
  const [sectionName, setSectionName] = useState("")
  
  // Subsection fields
  const [activeSectionIdForLecture, setActiveSectionIdForLecture] = useState(null)
  const [lectureTitle, setLectureTitle] = useState("")
  const [lectureDescription, setLectureDescription] = useState("")
  const [lectureVideo, setLectureVideo] = useState(null)

  const [savingStep, setSavingStep] = useState(false)

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await apiConnector("GET", "/course/showAllCategories")
        if (res.data.success) {
          setCategories(res.data.data)
          if (res.data.data.length > 0) {
            setCategory(res.data.data[0]._id)
          }
        }
      } catch (err) {
        console.error(err)
        toast.error("Failed to load categories")
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Step 1: Submit course info
  const handleCourseInfoSubmit = async (e) => {
    e.preventDefault()
    if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnailFile) {
      toast.error("Please fill all mandatory fields and upload thumbnail")
      return
    }

    setSavingStep(true)
    const t = toast.loading("Uploading course thumbnail & details...")
    try {
      const formData = new FormData()
      formData.append("courseName", courseName)
      formData.append("courseDescription", courseDescription)
      formData.append("whatYouWillLearn", whatYouWillLearn)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("thumbnailImage", thumbnailFile)
      formData.append("status", "Draft")
      
      // Standard StudyNotion parameters
      formData.append("tag", JSON.stringify(["React", "MERN"]))
      formData.append("instructions", JSON.stringify(["Complete syllabus", "Lifetime support"]))

      const res = await apiConnector("POST", "/course/createCourse", formData, {
        "Content-Type": "multipart/form-data",
      })

      if (res.data.success) {
        toast.success("Course details registered!")
        setCourse(res.data.data)
        setStep(2)
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Failed to create course")
    } finally {
      toast.dismiss(t)
      setSavingStep(false)
    }
  }

  // Step 2: Add Section
  const handleAddSection = async (e) => {
    e.preventDefault()
    if (!sectionName) {
      toast.error("Please enter section title")
      return
    }

    const t = toast.loading("Adding section...")
    try {
      const res = await apiConnector("POST", "/course/addSection", {
        sectionName,
        courseId: course._id,
      })

      if (res.data.success) {
        toast.success("Section added successfully!")
        setCourse(res.data.data)
        setSectionName("")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to add section")
    } finally {
      toast.dismiss(t)
    }
  }

  // Step 2: Add Subsection lecture video
  const handleAddLecture = async (e) => {
    e.preventDefault()
    if (!lectureTitle || !lectureDescription || !lectureVideo) {
      toast.error("Please fill lecture title, description and select video")
      return
    }

    const t = toast.loading("Uploading video lecture to Cloudinary (this may take a few seconds)...")
    try {
      const formData = new FormData()
      formData.append("sectionId", activeSectionIdForLecture)
      formData.append("title", lectureTitle)
      formData.append("description", lectureDescription)
      formData.append("video", lectureVideo)

      const res = await apiConnector("POST", "/course/addSubSection", formData, {
        "Content-Type": "multipart/form-data",
      })

      if (res.data.success) {
        toast.success("Video lecture uploaded!")
        
        // Reload course curriculum
        const refreshCourse = await apiConnector("POST", "/course/getCourseDetails", { courseId: course._id })
        if (refreshCourse.data.success) {
          setCourse(refreshCourse.data.data.courseDetails)
        }

        setLectureTitle("")
        setLectureDescription("")
        setLectureVideo(null)
        setActiveSectionIdForLecture(null)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to upload lecture video")
    } finally {
      toast.dismiss(t)
    }
  }

  // Step 3: Publish
  const handlePublishCourse = async (statusVal) => {
    setSavingStep(true)
    const t = toast.loading("Publishing settings...")
    try {
      const res = await apiConnector("PUT", "/course/editCourse", {
        courseId: course._id,
        status: statusVal,
      })

      if (res.data.success) {
        toast.success(`Course successfully saved as ${statusVal}!`)
        navigate("/dashboard/instructor-courses")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to update status")
    } finally {
      toast.dismiss(t)
      setSavingStep(false)
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto pb-16">
      <Toaster position="top-center" />
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Create Course</h1>
        <p className="text-gray-400 text-sm mt-1">Design premium digital education materials step-by-step</p>
      </div>

      {/* Multistep Progress */}
      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
        {[
          { label: "Course Info", stepNum: 1 },
          { label: "Course Builder", stepNum: 2 },
          { label: "Publish Settings", stepNum: 3 },
        ].map((s) => (
          <div key={s.stepNum} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition ${
                step >= s.stepNum ? "bg-yellow-400 text-black" : "bg-white/10 text-gray-400"
              }`}
            >
              {step > s.stepNum ? <Check size={16} /> : s.stepNum}
            </div>
            <span className={`text-xs font-semibold ${step >= s.stepNum ? "text-yellow-400" : "text-gray-500"}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Course Info */}
      {step === 1 && (
        <form onSubmit={handleCourseInfoSubmit} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl space-y-6">
          <h3 className="text-xl font-bold border-b border-white/5 pb-3">1. Course Information</h3>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Course Title *</label>
            <input
              type="text"
              placeholder="e.g. Complete React & Tailwind Masterclass"
              className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Course Description *</label>
            <textarea
              placeholder="Provide a comprehensive summary of syllabus, goals, and targets"
              rows="4"
              className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">What You Will Learn * (One item per line)</label>
            <textarea
              placeholder="Understand state management&#10;Construct beautiful layouts&#10;Deploy full stack apps"
              rows="3"
              className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
              value={whatYouWillLearn}
              onChange={(e) => setWhatYouWillLearn(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Course Category *</label>
              {loadingCategories ? (
                <div className="p-3 bg-slate-950 border border-white/15 rounded-xl text-gray-500 text-sm">Loading Categories...</div>
              ) : (
                <select
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Price (INR) *</label>
              <input
                type="number"
                placeholder="₹ 999"
                className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Course Thumbnail Thumbnail Image *</label>
            <input
              type="file"
              accept="image/*"
              className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
            />
          </div>

          <button
            type="submit"
            disabled={savingStep}
            className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold rounded-xl transition hover:scale-95 flex items-center justify-center gap-2"
          >
            <span>Save & Continue</span>
            <ArrowRight size={18} />
          </button>
        </form>
      )}

      {/* STEP 2: Course Builder (Syllabus & Videos) */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl space-y-6">
            <h3 className="text-xl font-bold border-b border-white/5 pb-3">2. Course Syllabus Builder</h3>
            
            {/* Render existing curriculum */}
            <div className="space-y-4">
              {course.courseContent?.map((sec) => (
                <div key={sec._id} className="bg-slate-950 border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="font-bold text-yellow-400">{sec.sectionName}</h4>
                    <button
                      onClick={() => setActiveSectionIdForLecture(sec._id)}
                      className="text-xs text-yellow-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Plus size={14} /> Add Lecture Video
                    </button>
                  </div>

                  {/* Subsection lectures */}
                  <div className="space-y-2">
                    {sec.subSection?.map((sub) => (
                      <div key={sub._id} className="flex items-center gap-2 text-sm text-gray-400 pl-4 py-1">
                        <Video size={14} className="text-yellow-400 shrink-0" />
                        <span className="truncate flex-1">{sub.title}</span>
                        <span className="text-[10px] text-gray-600">{sub.timeDuration}s</span>
                      </div>
                    ))}
                    {(!sec.subSection || sec.subSection.length === 0) && (
                      <p className="text-xs text-gray-600 pl-4">No video lectures added yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Form to Add Section */}
            <form onSubmit={handleAddSection} className="flex gap-3">
              <input
                type="text"
                placeholder="Enter section title e.g. Introduction to MERN"
                className="flex-grow bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
              />
              <button
                type="submit"
                className="px-5 py-3 bg-white/5 border border-white/15 hover:bg-white/10 rounded-xl text-yellow-400 font-bold transition flex items-center gap-1.5 shrink-0"
              >
                <Plus size={16} />
                <span>Add Section</span>
              </button>
            </form>
          </div>

          {/* Upload Subsection Lecture Overlay Modal */}
          {activeSectionIdForLecture && (
            <form
              onSubmit={handleAddLecture}
              className="bg-white/10 border border-yellow-400/20 p-8 rounded-3xl space-y-4"
            >
              <h4 className="font-bold text-lg text-yellow-400">Add New Lecture Video</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Lecture Title e.g. Setting up Express Server"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                />
                <textarea
                  placeholder="Lecture description and learning outcomes"
                  rows="2"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                  value={lectureDescription}
                  onChange={(e) => setLectureDescription(e.target.value)}
                />
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Select MP4 Video File *</label>
                  <input
                    type="file"
                    accept="video/mp4"
                    className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                    onChange={(e) => setLectureVideo(e.target.files[0])}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSectionIdForLecture(null)}
                  className="px-4 py-2 text-xs text-gray-400 hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-yellow-400 text-black font-semibold rounded-xl text-xs transition"
                >
                  Upload Video
                </button>
              </div>
            </form>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3.5 border border-white/10 hover:bg-white/5 rounded-xl font-bold transition flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold rounded-xl transition hover:scale-95 flex items-center justify-center gap-2"
            >
              <span>Save & Publish Settings</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Publish Settings */}
      {step === 3 && (
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl text-center space-y-6">
          <Film className="mx-auto text-yellow-400 animate-bounce" size={48} />
          <h3 className="text-2xl font-bold">Publish Your New Course</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            You are almost there! Choose whether to publish your course to the catalog immediately or save as a draft.
          </p>

          <div className="flex gap-4 max-w-md mx-auto pt-4">
            <button
              onClick={() => handlePublishCourse("Draft")}
              disabled={savingStep}
              className="flex-1 py-3.5 border border-yellow-400/20 text-yellow-400 bg-yellow-400/5 hover:bg-yellow-400/10 rounded-xl font-bold transition disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handlePublishCourse("Published")}
              disabled={savingStep}
              className="flex-1 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold rounded-xl transition hover:scale-95 disabled:opacity-50"
            >
              Publish Now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
