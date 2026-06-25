import { Navigate } from "react-router-dom"

export default function AdminProtectedRoute({ children }) {
  const adminToken = localStorage.getItem("admin_token")

  let adminUser = null
  try {
    const rawUser = localStorage.getItem("admin_user")
    if (rawUser) {
      adminUser = JSON.parse(rawUser)
    }
  } catch (err) {
    console.error("Error parsing admin_user:", err)
  }

  // Redirect to admin login if token missing or role is not Admin
  if (!adminToken || !adminUser || adminUser.accountType !== "Admin") {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
