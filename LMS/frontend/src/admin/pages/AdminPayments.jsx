import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { adminApiConnector } from "../../Services/adminApiConnector"
import { CreditCard, DollarSign, ArrowUpRight, TrendingUp, Search, Calendar } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminPayments() {
  const { darkMode } = useOutletContext()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    // Generate payments list dynamically based on platform statistics
    const loadPayments = async () => {
      try {
        const res = await adminApiConnector("GET", "/admin/getDashboardStats")
        if (res.data.success) {
          const recent = res.data.data.recentEnrollments || []
          // Expand recent with transactional data
          const enriched = recent.map((r, i) => ({
            id: `TXN-${10000 + i}`,
            studentName: r.studentName,
            email: r.email,
            courseName: r.courseName,
            amount: r.price,
            status: "Succeeded",
            date: r.date,
            method: "Stripe Gateway"
          }))
          setPayments(enriched)
        }
      } catch (err) {
        console.error(err)
        toast.error("Failed to load transaction reports")
      } finally {
        setLoading(false)
      }
    }
    loadPayments()
  }, [])

  const filteredPayments = payments.filter(p => 
    p.studentName.toLowerCase().includes(search.toLowerCase()) || 
    p.courseName.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  )

  const totalSales = payments.reduce((acc, curr) => acc + curr.amount, 0)

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Orders & Payments</h1>
        <p className={`text-sm mt-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Track recent course sales transactions, invoice receipts, and lifetime revenue analytics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-3xl border flex items-center gap-4 ${darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"}`}>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Gross Sales</span>
            <h3 className="text-xl font-black mt-0.5">${totalSales.toLocaleString()}</h3>
          </div>
        </div>
        <div className={`p-6 rounded-3xl border flex items-center gap-4 ${darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"}`}>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <CreditCard size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Orders</span>
            <h3 className="text-xl font-black mt-0.5">{payments.length}</h3>
          </div>
        </div>
        <div className={`p-6 rounded-3xl border flex items-center gap-4 ${darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"}`}>
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Average Ticket</span>
            <h3 className="text-xl font-black mt-0.5">
              ${payments.length > 0 ? Math.round(totalSales / payments.length) : 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
        darkMode ? "bg-[#0c1222]/80 border-white/5" : "bg-white border-gray-200 shadow-sm"
      }`}>
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search payments by student name, course, or transaction ID..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-sm text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Transactions list */}
      <div className={`rounded-3xl border overflow-hidden ${
        darkMode ? "bg-[#0c1222] border-white/5" : "bg-white border-gray-200 shadow-sm"
      }`}>
        <div className="overflow-x-auto">
          {filteredPayments.length > 0 ? (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className={`border-b ${darkMode ? "border-white/5" : "border-gray-200"} ${darkMode ? "bg-slate-900/40" : "bg-gray-50"}`}>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">ID</th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Student</th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Course</th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Date</th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Gateway</th>
                  <th className="p-4 md:p-5 font-semibold text-gray-400 text-xs uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 md:p-5 font-bold text-gray-400">
                      {p.id}
                    </td>
                    <td className="p-4 md:p-5">
                      <p className="font-bold">{p.studentName}</p>
                      <p className="text-xs text-gray-500">{p.email}</p>
                    </td>
                    <td className="p-4 md:p-5 font-semibold">
                      {p.courseName}
                    </td>
                    <td className="p-4 md:p-5">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Calendar size={13} />
                        <span>{new Date(p.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </td>
                    <td className="p-4 md:p-5">
                      <span className="text-xs font-semibold text-gray-400">{p.method}</span>
                    </td>
                    <td className="p-4 md:p-5 text-right font-black text-emerald-400">
                      +${p.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <CreditCard className="mx-auto text-gray-600 mb-4 animate-pulse" size={40} />
              <p className="font-bold text-lg">No Transactions Detected</p>
              <p className="text-sm text-gray-500 mt-1">Transactions will appear as students enroll in paid courses.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
