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

const { auth, isAdmin, adminAuth } = require("../Middleware/auth")

// Unprotected Auth Route
router.post("/login", adminLogin)

// Protected User Management & Analytics Routes
router.get("/getAllUsers", adminAuth, isAdmin, getAllUsers)
router.post("/toggleBlockUser", adminAuth, isAdmin, toggleBlockUser)
router.post("/deleteUser", adminAuth, isAdmin, deleteUser)
router.post("/approveCourse", adminAuth, isAdmin, approveCourse)
router.get("/getAnalytics", adminAuth, isAdmin, getPlatformAnalytics)
router.get("/getDashboardStats", adminAuth, isAdmin, getDashboardStats)
router.get("/getStudentProgress", adminAuth, isAdmin, getStudentProgress)

// Course Management (Guarded by Admin)
router.post("/createCourse", adminAuth, isAdmin, adminCreateCourse)
router.put("/editCourse", adminAuth, isAdmin, editCourse)
router.delete("/deleteCourse", adminAuth, isAdmin, deleteCourse)

// Sections Management (Guarded by Admin)
router.post("/addSection", adminAuth, isAdmin, createSection)
router.put("/updateSection", adminAuth, isAdmin, updateSection)
router.delete("/deleteSection", adminAuth, isAdmin, deleteSection)

// SubSections/Lectures Management (Guarded by Admin)
router.post("/addSubSection", adminAuth, isAdmin, createSubSection)
router.put("/updateSubSection", adminAuth, isAdmin, updateSubSection)
router.delete("/deleteSubSection", adminAuth, isAdmin, deleteSubSection)

module.exports = router
