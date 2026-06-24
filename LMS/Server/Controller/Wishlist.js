const User = require("../Models/User")
const Course = require("../Models/Course")

// Add Course to Wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      })
    }

    // Verify course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check if course is already in enrolled courses
    if (user.courses.includes(courseId) || (user.enrolledCourses && user.enrolledCourses.includes(courseId))) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
      })
    }

    // Check if course is already in wishlist
    if (user.wishlist.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Course is already in your wishlist",
      })
    }

    // Add to wishlist
    user.wishlist.push(courseId)
    await user.save()

    return res.status(200).json({
      success: true,
      message: "Course added to wishlist successfully",
      wishlist: user.wishlist,
    })
  } catch (error) {
    console.error("ADD TO WISHLIST ERROR:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to add course to wishlist",
      error: error.message,
    })
  }
}

// Remove Course from Wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check if course exists in wishlist
    if (!user.wishlist.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Course is not in your wishlist",
      })
    }

    // Remove from wishlist
    user.wishlist = user.wishlist.filter((id) => id.toString() !== courseId)
    await user.save()

    return res.status(200).json({
      success: true,
      message: "Course removed from wishlist successfully",
      wishlist: user.wishlist,
    })
  } catch (error) {
    console.error("REMOVE FROM WISHLIST ERROR:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to remove course from wishlist",
      error: error.message,
    })
  }
}

// Get User's Wishlist Courses
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id

    const userDetails = await User.findById(userId)
      .populate({
        path: "wishlist",
        populate: {
          path: "instructor",
          select: "firstName lastName image",
        },
      })
      .exec()

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      wishlist: userDetails.wishlist,
    })
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist courses",
      error: error.message,
    })
  }
}
