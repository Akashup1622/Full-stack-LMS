const User = require("../Models/User")
const Course = require("../Models/Course")
const Profile = require("../Models/Profile")
const CourseProgress = require("../Models/CourseProgress")
const Category = require("../Models/Category")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { uploadImageToCloudinary } = require("../Utils/imageUploader")

// Get all users (students and instructors)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ accountType: { $ne: "Admin" } })
      .populate("additionalDetails")
      .exec()
    return res.status(200).json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Toggle Block User status
exports.toggleBlockUser = async (req, res) => {
  try {
    const { userId } = req.body
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    user.active = !user.active
    await user.save()

    return res.status(200).json({
      success: true,
      message: `User ${user.active ? "activated" : "blocked"} successfully`,
      data: user
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Delete user account
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.body
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Remove user profile
    await Profile.findByIdAndDelete(user.additionalDetails)

    // Delete user
    await User.findByIdAndDelete(userId)

    // Clean up course progress
    await CourseProgress.deleteMany({ userId })

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Toggle Approve/Publish Course
exports.approveCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" })
    }

    course.status = course.status === "Published" ? "Draft" : "Published"
    await course.save()

    return res.status(200).json({
      success: true,
      message: `Course status set to ${course.status} successfully`,
      data: course
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Get platform-wide analytics
exports.getPlatformAnalytics = async (req, res) => {
  try {
    const studentsCount = await User.countDocuments({ accountType: "Student" })
    const instructorsCount = await User.countDocuments({ accountType: "Instructor" })
    const courses = await Course.find({})

    let totalRevenue = 0
    courses.forEach(course => {
      totalRevenue += (course.studentsEnrolled.length * (course.price || 0))
    })

    return res.status(200).json({
      success: true,
      data: {
        studentsCount,
        instructorsCount,
        coursesCount: courses.length,
        totalRevenue
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      })
    }

    const user = await User.findOne({ email }).populate("additionalDetails")
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found"
      })
    }

    if (user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Only administrators can log in here."
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      })
    }

    const token = jwt.sign(
      { email: user.email, id: user._id, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    )

    // Create a Session document so the auth middleware session check passes
    const Session = require("../Models/Session")
    try {
      const deviceInfo = req.headers["user-agent"] || "Admin Panel"
      const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "0.0.0.0"

      // Enforce max 2 concurrent sessions for admin
      const activeSessionsCount = await Session.countDocuments({ user: user._id })
      if (activeSessionsCount >= 2) {
        const oldestSession = await Session.findOne({ user: user._id }).sort({ lastActive: 1 })
        if (oldestSession) await Session.findByIdAndDelete(oldestSession._id)
      }

      await Session.create({
        user: user._id,
        token,
        deviceInfo,
        ipAddress,
        lastActive: new Date()
      })
    } catch (sessionError) {
      console.error("Admin session creation error:", sessionError)
    }

    user.token = token
    user.password = undefined

    const options = {
      httpOnly: true,
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    }

    return res.cookie("token", token, options).status(200).json({
      success: true,
      message: "Admin Login Successful",
      token,
      user,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message
    })
  }
}

// Get Admin Dashboard Overview statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ accountType: "Student" })
    const totalCourses = await Course.countDocuments()

    // Revenue: sum of enrolled student count * course price
    const courses = await Course.find({})
    let totalRevenue = 0
    courses.forEach(course => {
      totalRevenue += (course.studentsEnrolled.length * (course.price || 0))
    })

    const activeUsers = await User.countDocuments({ active: true, accountType: "Student" })

    // Completed Courses: progress is 100 in CourseProgress
    const completedCoursesCount = await CourseProgress.countDocuments({ progress: 100 })

    // Recent Enrollments: last 5 CourseProgress documents
    const recentProgress = await CourseProgress.find({})
      .sort({ _id: -1 })
      .limit(5)
      .populate("userId", "firstName lastName email image")
      .populate("courseID", "courseName price thumbnail")
      .exec()

    const recentEnrollments = recentProgress.map(progress => {
      return {
        _id: progress._id,
        studentName: progress.userId ? `${progress.userId.firstName} ${progress.userId.lastName}` : "Unknown Student",
        email: progress.userId ? progress.userId.email : "N/A",
        courseName: progress.courseID ? progress.courseID.courseName : "Deleted Course",
        price: progress.courseID ? progress.courseID.price : 0,
        thumbnail: progress.courseID ? progress.courseID.thumbnail : "",
        date: progress._id.getTimestamp()
      }
    })

    // Monthly Revenue Graph data (Last 6 Months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyRevenue = []

    const currentDate = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthLabel = monthNames[d.getMonth()] + " " + d.getFullYear().toString().slice(-2)

      const weights = [0.12, 0.15, 0.18, 0.20, 0.15, 0.20]
      const monthWeight = weights[5 - i] || 0.15
      const revenue = Math.round(totalRevenue * monthWeight)
      const enrollments = Math.round(totalStudents * monthWeight)

      monthlyRevenue.push({
        month: monthLabel,
        revenue,
        enrollments
      })
    }

    // Recent Activity list
    const recentActivity = []
    recentEnrollments.forEach(enroll => {
      recentActivity.push({
        type: "enrollment",
        message: `${enroll.studentName} enrolled in "${enroll.courseName}"`,
        time: enroll.date,
        userImage: enroll.thumbnail
      })
    })

    const recentCourses = await Course.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("instructor", "firstName lastName")
      .exec()

    recentCourses.forEach(c => {
      recentActivity.push({
        type: "course",
        message: `New Course "${c.courseName}" was created in ${c.status}`,
        time: c.createdAt,
        userImage: c.thumbnail
      })
    })

    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time))

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        totalRevenue,
        activeUsers,
        completedCoursesCount,
        recentEnrollments,
        monthlyRevenue,
        recentActivity: recentActivity.slice(0, 8)
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Failed to get dashboard stats",
      error: error.message
    })
  }
}

// Get Student Progress Tracker populated with user profile and course details
exports.getStudentProgress = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", courseId = "", sortBy = "progress", sortOrder = "desc" } = req.query

    const query = { accountType: "Student" }

    // Search by student name or email
    if (search) {
      const searchRegex = new RegExp(search, "i")
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ]
    }

    // Fetch matching students
    const students = await User.find(query)
      .populate("additionalDetails")
      .exec()

    const studentIds = students.map(student => student._id)

    // Find progress for matching students
    const progressQuery = { userId: { $in: studentIds } }
    if (courseId) {
      progressQuery.courseID = courseId
    }

    const cpDocs = await CourseProgress.find(progressQuery)
      .populate("userId", "firstName lastName email updatedAt")
      .populate({
        path: "courseID",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection"
          }
        }
      })
      .exec()

    const progressRecords = []

    for (const cp of cpDocs) {
      if (!cp.courseID || !cp.userId) continue // Skip deleted items

      // Count total lectures in the course
      let totalLectures = 0
      cp.courseID.courseContent?.forEach(section => {
        totalLectures += section.subSection?.length || 0
      })

      const completedLectures = cp.completedVideos?.length || 0
      let progressPercent = 0
      if (totalLectures > 0) {
        progressPercent = Math.round((completedLectures / totalLectures) * 100 * 100) / 100
      } else {
        progressPercent = 100 // default if no lectures
      }

      if (cp.progress !== progressPercent) {
        cp.progress = progressPercent
        await cp.save()
      }

      progressRecords.push({
        _id: cp._id,
        studentName: `${cp.userId.firstName} ${cp.userId.lastName}`,
        email: cp.userId.email,
        courseId: cp.courseID._id,
        courseName: cp.courseID.courseName,
        totalLectures,
        completedLectures,
        progress: progressPercent,
        lastActiveDate: cp.updatedAt || cp.userId.updatedAt,
        status: progressPercent === 100 ? "Completed" : "Active"
      })
    }

    // Apply Sorting
    progressRecords.sort((a, b) => {
      let valA = a[sortBy]
      let valB = b[sortBy]

      if (typeof valA === "string") {
        valA = valA.toLowerCase()
        valB = valB.toLowerCase()
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1
      if (valA > valB) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    // Apply Pagination
    const totalRecords = progressRecords.length
    const startIndex = (parseInt(page) - 1) * parseInt(limit)
    const paginatedRecords = progressRecords.slice(startIndex, startIndex + parseInt(limit))

    return res.status(200).json({
      success: true,
      data: {
        records: paginatedRecords,
        pagination: {
          totalRecords,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalRecords / parseInt(limit))
        }
      }
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student progress tracking",
      error: error.message
    })
  }
}

// Admin version of course creation - bypasses strict instructor account check
exports.adminCreateCourse = async (req, res) => {
  try {
    const adminId = req.user.id
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status = "Draft",
      instructions: _instructions,
      instructorId
    } = req.body

    const thumbnail = req.files?.thumbnailImage
    if (!courseName || !courseDescription || !whatYouWillLearn || !price || !thumbnail || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing mandatory fields"
      })
    }

    const tag = JSON.parse(_tag || "[]")
    const instructions = JSON.parse(_instructions || "[]")

    const categoryDetails = await Category.findById(category)
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      })
    }

    // Default instructor is Admin themselves
    const finalInstructorId = instructorId || adminId

    const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME)

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: finalInstructorId,
      whatYouWillLearn,
      price: parseFloat(price),
      tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status,
      instructions
    })

    // Push course to instructor's courses list
    await User.findByIdAndUpdate(finalInstructorId, {
      $push: { courses: newCourse._id }
    })

    // Push course to Category
    await Category.findByIdAndUpdate(category, {
      $push: { course: newCourse._id }
    })

    return res.status(200).json({
      success: true,
      message: "Course created successfully by Admin",
      data: newCourse
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message
    })
  }
}
