/**
 * AdminProtectedRoute.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Guards all /admin/* routes (except /admin/login).
 *
 * Checks performed (in order):
 *  1. Token exists in Redux state (backed by localStorage).
 *  2. Token is not expired (using manual JWT payload decode — no extra library).
 *  3. Decoded accountType === "Admin".
 *
 * If any check fails:
 *  - Invalid/expired token is cleared from localStorage + Redux.
 *  - User is hard-redirected to /admin/login.
 *
 * While checking: a full-screen loading spinner is shown to prevent flash
 * of the protected component before the check completes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { adminLogout, isTokenValid } from "../../Redux/Slices/adminAuthSlice"

export default function AdminProtectedRoute({ children }) {
  const dispatch = useDispatch()
  const { adminToken, adminUser } = useSelector((state) => state.adminAuth)

  // Checking state: undefined = still checking, true/false = result
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const verify = () => {
      // 1. Token must exist
      if (!adminToken) {
        setIsAuthorized(false)
        setAuthChecked(true)
        return
      }

      // 2. Token must not be expired
      if (!isTokenValid(adminToken)) {
        // Token expired — clear everything
        dispatch(adminLogout())
        setIsAuthorized(false)
        setAuthChecked(true)
        return
      }

      // 3. User record must exist and have Admin role
      if (!adminUser || adminUser.accountType !== "Admin") {
        dispatch(adminLogout())
        setIsAuthorized(false)
        setAuthChecked(true)
        return
      }

      // All checks passed
      setIsAuthorized(true)
      setAuthChecked(true)
    }

    verify()
  }, [adminToken, adminUser, dispatch])

  // ── Loading State — prevents flash of protected content ───────────────────
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-yellow-400/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-yellow-400 border-r-orange-500 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Verifying Admin Credentials
          </p>
          <p className="text-[10px] text-gray-600 mt-1">
            Please wait...
          </p>
        </div>
      </div>
    )
  }

  // ── Unauthorized — redirect to login ──────────────────────────────────────
  if (!isAuthorized) {
    return <Navigate to="/admin/login" replace />
  }

  // ── Authorized — render the protected page ────────────────────────────────
  return children
}
