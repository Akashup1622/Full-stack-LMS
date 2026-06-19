import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#0b0f19] via-[#020617] to-black text-white">
      
      {/* Background Glows */}
      <div className="absolute w-[600px] h-[600px] bg-yellow-500/5 blur-[160px] rounded-full -top-40 -left-40 pointer-events-none"></div>
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/5 blur-[140px] rounded-full bottom-10 right-10 pointer-events-none"></div>

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative p-8 md:p-10">
        <div className="max-w-6xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

    </div>
  )
}
