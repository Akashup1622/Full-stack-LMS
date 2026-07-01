import axios from "axios"

export const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  withCredentials: true,
})

// Intercept responses to handle 401 errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear localStorage auth state
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("admin_token")
      // Redirect to login
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export const apiConnector = (method, url, bodyData, headers, params) => {

  // GET TOKEN
  let token = localStorage.getItem("token")
  if (token) {
    try {
      token = JSON.parse(token)
    } catch {
      // fallback if token is already plain text
    }
  }

  // Check if url refers to admin panel or uses the admin override
  if (url.includes("/admin") || (headers && headers["Use-Admin-Token"])) {
    const adminToken = localStorage.getItem("admin_token")
    if (adminToken) {
      try {
        token = JSON.parse(adminToken)
      } catch {
        token = adminToken
      }
    }
  }

  const defaultHeaders = {
    ...headers,
  }

  if (defaultHeaders["Use-Admin-Token"]) {
    delete defaultHeaders["Use-Admin-Token"]
  }

  // ADD AUTH HEADER
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`
  }

  return axiosInstance({
    method: method,
    url: url,
    data: bodyData ? bodyData : null,
    headers: defaultHeaders,
    params: params ? params : null,
  })
}