import { createSlice } from "@reduxjs/toolkit"

// Safe parsers — handles both raw strings and JSON-stringified values
const safeGetToken = () => {
  try {
    const raw = localStorage.getItem("token")
    if (!raw) return null
    // JWT tokens start with 'e' (eyJ...) — return as-is if not valid JSON
    return JSON.parse(raw)
  } catch {
    return localStorage.getItem("token") // return raw string fallback
  }
}

const safeGetUser = () => {
  try {
    const raw = localStorage.getItem("user")
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const initialState = {
  token: safeGetToken(),
  user: safeGetUser(),
  loading: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
      if (action.payload) {
        localStorage.setItem("token", JSON.stringify(action.payload))
      } else {
        localStorage.removeItem("token")
      }
    },
    setUser: (state, action) => {
      state.user = action.payload
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload))
      } else {
        localStorage.removeItem("user")
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    logout: (state) => {
      state.token = null
      state.user = null
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    },
  },
})

export const { setToken, setUser, setLoading, logout } = authSlice.actions
export default authSlice.reducer
