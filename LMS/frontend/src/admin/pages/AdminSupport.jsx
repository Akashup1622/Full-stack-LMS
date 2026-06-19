import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { MessageSquare, Search, Send, User, CheckCircle, Clock } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminSupport() {
  const { darkMode } = useOutletContext()
  const [search, setSearch] = useState("")
  const [activeTicketId, setActiveTicketId] = useState(1)
  
  // Mock support ticket data
  const [tickets, setTickets] = useState([
    {
      id: 1,
      studentName: "John Doe",
      email: "john@student.com",
      subject: "Stripe Payment Issues",
      status: "Open",
      lastUpdated: "10 mins ago",
      messages: [
        { sender: "student", text: "Hi, I tried to enroll in the React Bootcamp, but the payment failed even though money was deducted.", time: "10:15 AM" },
        { sender: "admin", text: "Hello John, let me check the transaction log. Could you please share the invoice ID if you received any email?", time: "10:20 AM" },
        { sender: "student", text: "Yes, the invoice ID is order_xyz789. Please check it.", time: "10:25 AM" }
      ]
    },
    {
      id: 2,
      studentName: "Jane Smith",
      email: "jane@student.com",
      subject: "Certificate of Completion",
      status: "Closed",
      lastUpdated: "Yesterday",
      messages: [
        { sender: "student", text: "Hello, I finished the Python course but didn't receive my completion certificate. How can I download it?", time: "Yesterday" },
        { sender: "admin", text: "Hi Jane, congrats on completing the course! I have re-triggered the certificate generation. You can now download it from your enrolled courses page.", time: "Yesterday" },
        { sender: "student", text: "Awesome! Got it. Thank you so much for the quick response.", time: "Yesterday" }
      ]
    },
    {
      id: 3,
      studentName: "David Miller",
      email: "david@student.com",
      subject: "Video Playback buffering",
      status: "Open",
      lastUpdated: "2 hours ago",
      messages: [
        { sender: "student", text: "The videos in Section 3 are loading very slowly, they buffer every few seconds. Is there an issue with the video CDN?", time: "2 hours ago" }
      ]
    }
  ])

  const [newMessage, setNewMessage] = useState("")

  const activeTicket = tickets.find(t => t.id === activeTicketId)

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    // Add message to active ticket
    setTickets(prev => prev.map(t => {
      if (t.id === activeTicketId) {
        return {
          ...t,
          lastUpdated: "Just now",
          messages: [...t.messages, { sender: "admin", text: newMessage.trim(), time: timeString }]
        }
      }
      return t
    }))
    
    setNewMessage("")
    toast.success("Response sent successfully")
  }

  const handleCloseTicket = (ticketId) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: "Closed" } : t))
    toast.success("Support ticket resolved and closed")
  }

  const filteredTickets = tickets.filter(t => 
    t.studentName.toLowerCase().includes(search.toLowerCase()) || 
    t.subject.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Support & Messages</h1>
        <p className={`text-sm mt-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Interact with students, address billing issues, and resolve platform inquiries.
        </p>
      </div>

      {/* Main Support Grid layout */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 border rounded-3xl overflow-hidden min-h-[550px] ${
        darkMode ? "bg-[#0c1222]/50 border-white/5" : "bg-white border-gray-200 shadow-sm"
      }`}>
        
        {/* Ticket List column */}
        <div className={`p-4 border-r flex flex-col space-y-4 ${
          darkMode ? "border-white/5" : "border-gray-200"
        }`}>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950/20 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-xs text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredTickets.map(t => {
              const isActive = t.id === activeTicketId
              const isOpen = t.status === "Open"
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTicketId(t.id)}
                  className={`w-full text-left p-3.5 rounded-2xl transition flex flex-col gap-1.5 border ${
                    isActive
                      ? "bg-yellow-400/10 border-yellow-400/20 text-white"
                      : darkMode 
                        ? "bg-[#090d16]/40 border-transparent hover:bg-white/5" 
                        : "bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate max-w-[120px]">{t.studentName}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isOpen
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="font-semibold text-xs truncate line-clamp-1">{t.subject}</p>
                  <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1 font-medium">
                    <span>{t.email}</span>
                    <span>{t.lastUpdated}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Messaging area column */}
        <div className="lg:col-span-2 flex flex-col h-[550px]">
          {activeTicket ? (
            <>
              {/* Message Header */}
              <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
                darkMode ? "border-white/5 bg-slate-900/20" : "border-gray-200 bg-gray-50"
              }`}>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-1.5">
                    <User size={14} className="text-yellow-400" /> {activeTicket.studentName}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Subject: {activeTicket.subject}</p>
                </div>
                {activeTicket.status === "Open" && (
                  <button
                    onClick={() => handleCloseTicket(activeTicket.id)}
                    className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl transition flex items-center gap-1 font-bold"
                  >
                    <CheckCircle size={12} />
                    <span>Resolve Ticket</span>
                  </button>
                )}
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/5">
                {activeTicket.messages.map((msg, idx) => {
                  const isAdminMsg = msg.sender === "admin"
                  return (
                    <div
                      key={idx}
                      className={`flex ${isAdminMsg ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs space-y-1.5 shadow-sm border ${
                        isAdminMsg
                          ? "bg-gradient-to-tr from-yellow-400 to-orange-500 text-black font-medium rounded-tr-none border-orange-400/20"
                          : darkMode
                            ? "bg-slate-900 border-white/5 text-gray-100 rounded-tl-none"
                            : "bg-white border-gray-200 text-gray-800 rounded-tl-none"
                      }`}>
                        <p>{msg.text}</p>
                        <span className={`block text-[9px] text-right font-semibold ${
                          isAdminMsg ? "text-orange-950" : "text-gray-500"
                        }`}>
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className={`p-4 border-t shrink-0 flex gap-2 ${
                darkMode ? "border-white/5 bg-slate-900/20" : "border-gray-200 bg-gray-50"
              }`}>
                <input
                  type="text"
                  placeholder={activeTicket.status === "Closed" ? "This ticket has been resolved and closed." : "Type your professional response..."}
                  disabled={activeTicket.status === "Closed"}
                  className="flex-1 px-4 py-3 bg-slate-950/30 border border-white/10 rounded-xl outline-none focus:border-yellow-400 text-xs text-white placeholder-gray-500 disabled:opacity-40"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={activeTicket.status === "Closed"}
                  className="px-4.5 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-700 text-black font-extrabold rounded-xl transition flex items-center justify-center disabled:opacity-40"
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <MessageSquare size={40} className="text-gray-600 mb-3 animate-pulse" />
              <p className="font-bold text-sm">No Active Ticket Selected</p>
              <p className="text-xs text-gray-600 mt-1">Select a conversations thread from the sidebar list.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
