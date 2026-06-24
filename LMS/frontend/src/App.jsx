import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./Pages/Login"
import Signup from "./Pages/Signup"
import OTP from "./Pages/sendotp"
import ResetPassword from "./Pages/ResetPassword"
import CheckEmail from "./Pages/CheckEmail"
import NewPassword from "./Pages/ChooseNewPassword"
import ResetSuccess from "./Pages/Resetsuccess"

// Pages & Components imports
import LandingPage from "./Pages/LandingPage"
import CourseDetails from "./Pages/CourseDetails"
import ExploreCatalog from "./Pages/ExploreCatalog"
import DashboardLayout from "./Components/Dashboard/DashboardLayout"
import ProtectedRoute from "./Components/Auth/ProtectedRoute"

// Dashboard Pages imports
import Profile from "./Pages/Dashboard/Profile"
import EnrolledCourses from "./Pages/Dashboard/EnrolledCourses"
import Wishlist from "./Pages/Dashboard/Wishlist"
import Settings from "./Pages/Dashboard/Settings"
import InstructorCourses from "./Pages/Dashboard/InstructorCourses"
import CreateCourse from "./Pages/CreateCourse"
import InstructorAnalytics from "./Pages/Dashboard/InstructorAnalytics"
import AdminUsers from "./Pages/Dashboard/AdminUsers"
import AdminCourses from "./Pages/Dashboard/AdminCourses"
import AdminCategory from "./Pages/Dashboard/AdminCategory"
import AdminAnalytics from "./Pages/Dashboard/AdminAnalytics"

// Admin Panel Layout & Pages
import AdminLogin from "./admin/pages/AdminLogin"
import AdminProtectedRoute from "./admin/components/AdminProtectedRoute"
import AdminLayout from "./admin/components/AdminLayout"
import AdminDashboard from "./admin/pages/AdminDashboard"
import AdminManageCourses from "./admin/pages/AdminManageCourses"
import AdminAddCourse from "./admin/pages/AdminAddCourse"
import AdminEditCourse from "./admin/pages/AdminEditCourse"
import AdminManageStudents from "./admin/pages/AdminManageStudents"
import AdminStudentProgress from "./admin/pages/AdminStudentProgress"
import AdminPayments from "./admin/pages/AdminPayments"
import AdminAnalyticsPage from "./admin/pages/AdminAnalytics"
import AdminSupport from "./admin/pages/AdminSupport"
import AdminSettings from "./admin/pages/AdminSettings"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Core Catalog & Info Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalog" element={<ExploreCatalog />} />
        <Route path="/course/:id" element={<CourseDetails />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<OTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/reset-success" element={<ResetSuccess />} />

        {/* Dashboard Shell Nested Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* General routes */}
          <Route index element={<Profile />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />

          {/* Student Specific Routes */}
          <Route 
            path="enrolled-courses" 
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <EnrolledCourses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="wishlist" 
            element={
              <ProtectedRoute allowedRoles={["Student"]}>
                <Wishlist />
              </ProtectedRoute>
            } 
          />

          {/* Instructor Specific Routes */}
          <Route 
            path="instructor-courses" 
            element={
              <ProtectedRoute allowedRoles={["Instructor"]}>
                <InstructorCourses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="create-course" 
            element={
              <ProtectedRoute allowedRoles={["Instructor"]}>
                <CreateCourse />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="instructor-analytics" 
            element={
              <ProtectedRoute allowedRoles={["Instructor"]}>
                <InstructorAnalytics />
              </ProtectedRoute>
            } 
          />

          {/* Admin Specific Routes */}
          <Route 
            path="admin-users" 
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin-courses" 
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminCourses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin-category" 
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminCategory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin-analytics" 
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminAnalytics />
              </ProtectedRoute>
            } 
          />

        </Route>

        {/* Admin Panel Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="courses" element={<AdminManageCourses />} />
          <Route path="courses/add" element={<AdminAddCourse />} />
          <Route path="courses/edit/:courseId" element={<AdminEditCourse />} />
          <Route path="students" element={<AdminManageStudents />} />
          <Route path="progress" element={<AdminStudentProgress />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App