const express = require("express")
const router = express.Router()

const {
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  approveCourse,
  getPlatformAnalytics,
  adminLogin,
  getDashboardStats,
  getStudentProgress,
  adminCreateCourse
} = require("../Controller/Admin")

const {
  editCourse,
  deleteCourse
} = require("../Controller/Course")

const {
  createSection,
  updateSection,
  deleteSection
} = require("../Controller/Section")

const {
  createSubSection,
  updateSubSection,
  deleteSubSection
} = require("../Controller/SubSection")

const { auth, isAdmin } = require("../Middleware/auth")

// Unprotected Auth Route
router.post("/login", adminLogin)

// Protected User Management & Analytics Routes
router.get("/getAllUsers", auth, isAdmin, getAllUsers)
router.post("/toggleBlockUser", auth, isAdmin, toggleBlockUser)
router.post("/deleteUser", auth, isAdmin, deleteUser)
router.post("/approveCourse", auth, isAdmin, approveCourse)
router.get("/getAnalytics", auth, isAdmin, getPlatformAnalytics)
router.get("/getDashboardStats", auth, isAdmin, getDashboardStats)
router.get("/getStudentProgress", auth, isAdmin, getStudentProgress)

// Course Management (Guarded by Admin)
router.post("/createCourse", auth, isAdmin, adminCreateCourse)
router.put("/editCourse", auth, isAdmin, editCourse)
router.delete("/deleteCourse", auth, isAdmin, deleteCourse)

// Sections Management (Guarded by Admin)
router.post("/addSection", auth, isAdmin, createSection)
router.put("/updateSection", auth, isAdmin, updateSection)
router.delete("/deleteSection", auth, isAdmin, deleteSection)

// SubSections/Lectures Management (Guarded by Admin)
router.post("/addSubSection", auth, isAdmin, createSubSection)
router.put("/updateSubSection", auth, isAdmin, updateSubSection)
router.delete("/deleteSubSection", auth, isAdmin, deleteSubSection)

module.exports = router
