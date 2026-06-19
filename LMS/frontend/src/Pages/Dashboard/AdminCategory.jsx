import { useState, useEffect } from "react"
import { apiConnector } from "../../Services/apiConnector"
import { Plus, Tag } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function AdminCategory() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)

  const fetchCategories = async () => {
    try {
      const res = await apiConnector("GET", "/course/showAllCategories")
      if (res.data.success) {
        setCategories(res.data.data)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !description) {
      toast.error("Please fill name and description")
      return
    }

    setCreating(true)
    const t = toast.loading("Registering category...")
    try {
      const res = await apiConnector("POST", "/course/createCategory", { name, description })
      if (res.data.success) {
        toast.success("Category registered successfully!")
        setName("")
        setDescription("")
        fetchCategories() // refresh
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to create category")
    } finally {
      toast.dismiss(t)
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <Toaster position="top-center" />
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Create Category</h1>
        <p className="text-gray-400 text-sm mt-1">Configure global catalog categories for student course discovery</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Category Form */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl h-fit">
          <h3 className="font-bold text-lg mb-4 pb-2 border-b border-white/5 flex items-center gap-2">
            <Plus size={18} className="text-yellow-400" /> New Category Details
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Category Name *</label>
              <input
                type="text"
                placeholder="e.g. Artificial Intelligence"
                className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Description *</label>
              <textarea
                placeholder="Briefly summarize courses falling under this classification"
                rows="3"
                className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 outline-none text-white text-sm focus:border-yellow-400"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold rounded-xl text-sm transition hover:scale-95 disabled:opacity-50"
            >
              {creating ? "Registering..." : "Create Category"}
            </button>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
          <h3 className="font-bold text-lg mb-4 pb-2 border-b border-white/5">Active Global Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="p-4 bg-slate-950 border border-white/5 rounded-2xl flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center shrink-0">
                  <Tag size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{cat.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
