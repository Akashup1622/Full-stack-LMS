import { createSlice } from "@reduxjs/toolkit"

// ─── Safe Helpers ────────────────────────────────────────────────────────────
// Safely decode a JWT payload without any library (base64url decoding)
const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split(".")[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

// Check if a token string is still valid (not expired)
export const isTokenValid = (token) => {
  if (!token) return false
  const payload = decodeJwtPayload(token)
  if (!payload || !payload.exp) return false
  // exp is in seconds, Date.now() is in ms
  return payload.exp * 1000 > Date.now()
}

// Read admin_token from localStorage and validate it on first load
const safeGetAdminToken = () => {
  try {
    const raw = localStorage.getItem("admin_token")
    if (!raw) return null
    // admin_token is stored as a plain JWT string (not JSON-stringified)
    return isTokenValid(raw) ? raw : null
  } catch {
    return null
  }
}

const safeGetAdminUser = () => {
  try {
    const raw = localStorage.getItem("admin_user")
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// ─── Initial State ───────────────────────────────────────────────────────────
const initialState = {
  adminToken: safeGetAdminToken(),
  adminUser: safeGetAdminUser(),
  adminLoading: false,
}

// Clean localStorage if token was expired on load
if (!initialState.adminToken) {
  localStorage.removeItem("admin_token")
  localStorage.removeItem("admin_user")
}

// ─── Slice ───────────────────────────────────────────────────────────────────
const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    setAdminToken: (state, action) => {
      state.adminToken = action.payload
      if (action.payload) {
        // Store as plain string — NOT JSON.stringified
        localStorage.setItem("admin_token", action.payload)
      } else {
        localStorage.removeItem("admin_token")
      }
    },
    setAdminUser: (state, action) => {
      state.adminUser = action.payload
      if (action.payload) {
        localStorage.setItem("admin_user", JSON.stringify(action.payload))
      } else {
        localStorage.removeItem("admin_user")
      }
    },
    setAdminLoading: (state, action) => {
      state.adminLoading = action.payload
    },
    adminLogout: (state) => {
      state.adminToken = null
      state.adminUser = null
      state.adminLoading = false
      localStorage.removeItem("admin_token")
      localStorage.removeItem("admin_user")
    },
  },
})

export const { setAdminToken, setAdminUser, setAdminLoading, adminLogout } =
  adminAuthSlice.actions

export default adminAuthSlice.reducer
