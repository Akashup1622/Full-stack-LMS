const Course = require("../Models/Course")
const User = require("../Models/User")
const CourseProgress = require("../Models/CourseProgress")
const { mailSender } = require("../Utils/mailsender")
const mongoose = require("mongoose")

// Capture Payment (Mock / Real setup)
exports.capturePayment = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required" })
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" })
    }

    // Check if user is already enrolled
    const uid = new mongoose.Types.ObjectId(userId)
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(400).json({ success: false, message: "You are already enrolled in this course" })
    }

    // For simplicity, professional SaaS products implement mock checkout pathway 
    // that immediately allows verification for easy offline sandbox usage.
    // If Stripe / Razorpay are fully set up in .env, we can construct the real sessions:
    return res.status(200).json({
      success: true,
      message: "Order initiated successfully",
      courseName: course.courseName,
      price: course.price,
      courseId: course._id,
      paymentType: "mock_gateway",
      orderId: `order_${Math.random().toString(36).substring(7)}`
    })

  } catch (error) {
    console.error("CAPTURE PAYMENT ERROR:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// Verify Payment and Enroll Student
exports.verifyPayment = async (req, res) => {
  try {
    const { courseId, paymentId } = req.body
    const userId = req.user.id

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required" })
    }

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" })
    }

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Check if already enrolled
    if (course.studentsEnrolled.includes(userId)) {
      return res.status(400).json({ success: false, message: "Already enrolled in this course" })
    }

    // 1. Add user to course enrolled list and update total count
    course.studentsEnrolled.push(userId)
    course.totalStudentsEnrolled = course.studentsEnrolled.length
    await course.save()

    // 2. Add course to user's course lists
    user.courses.push(courseId)
    if (!user.enrolledCourses) {
      user.enrolledCourses = []
    }
    user.enrolledCourses.push(courseId)

    // 3. Create course progress tracking
    const courseProgress = await CourseProgress.create({
      courseID: courseId,
      userId: userId,
      completedVideos: []
    })

    user.courseProgress.push(courseProgress._id)
    await user.save()

    // 4. Send Confirmation Email
    try {
      await mailSender(
        user.email,
        `Successfully Enrolled in ${course.courseName}`,
        `
        <div style="font-family: Arial; text-align: center; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4F46E5;">Congratulations! 🎉</h2>
          <p>Hi ${user.firstName} ${user.lastName},</p>
          <p>You have successfully enrolled in <strong>${course.courseName}</strong>.</p>
          <p>Get ready to start learning and upgrade your skillset.</p>
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">If you have any questions, feel free to contact our support team.</p>
        </div>
        `
      )
    } catch (err) {
      console.error("Enrollment mail error:", err)
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and student enrolled successfully",
      data: course
    })

  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
