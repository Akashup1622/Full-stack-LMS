/**
 * adminApiConnector.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Dedicated Axios instance for all Admin Panel API calls.
 *
 * Key behaviours:
 *  1. Automatically reads admin_token from localStorage and injects it as
 *     "Authorization: Bearer <token>" on every request.
 *  2. Does NOT manually set Content-Type for multipart/form-data — lets Axios
 *     set it automatically (with the correct boundary string).
 *  3. On a 401 response, clears admin credentials and redirects to /admin/login.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import axios from "axios"

// ─── Axios Instance ───────────────────────────────────────────────────────────
export const adminAxiosInstance = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  withCredentials: true,
})

// ─── Request Interceptor — Inject Admin Token ─────────────────────────────────
adminAxiosInstance.interceptors.request.use(
  (config) => {
    // Always read the latest token from localStorage (handles token refresh)
    const adminToken = localStorage.getItem("admin_token")

    if (adminToken) {
      // admin_token is stored as a plain JWT string (not JSON-stringified)
      config.headers["Authorization"] = `Bearer ${adminToken}`
    }

    // IMPORTANT: Do NOT override Content-Type when sending FormData.
    // Axios detects FormData and sets the correct multipart/form-data boundary.
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"]
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor — Handle 401 Globally ───────────────────────────────
adminAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token is invalid or expired — clear admin state and redirect to login
      localStorage.removeItem("admin_token")
      localStorage.removeItem("admin_user")

      // Only redirect if we're currently on an admin page
      if (window.location.pathname.startsWith("/admin") &&
          window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login"
      }
    }
    return Promise.reject(error)
  }
)

// ─── Main Connector Function ──────────────────────────────────────────────────
/**
 * @param {string} method   - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} url      - API endpoint path (e.g. "/admin/getDashboardStats")
 * @param {any}    bodyData - Request body (plain object or FormData)
 * @param {object} headers  - Additional headers to merge (optional)
 * @param {object} params   - URL query parameters (optional)
 */
export const adminApiConnector = (method, url, bodyData, headers, params) => {
  return adminAxiosInstance({
    method,
    url,
    data: bodyData ?? null,
    headers: headers ?? {},
    params: params ?? null,
  })
}
