// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../Models/User");
// Configuring dotenv to load environment variables from .env file
dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
// adminAuth — Stateless JWT middleware for Admin Panel routes.
// Does NOT perform a session DB lookup so it cannot fail due to missing/expired
// session records.  Only verifies the JWT signature and expiry.
// ─────────────────────────────────────────────────────────────────────────────
exports.adminAuth = async (req, res, next) => {
  try {
    // Extract token from cookie, body, or Authorization header
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin token missing. Please log in to the Admin Panel.",
      });
    }

    try {
      // Verify the JWT — this also validates expiry automatically
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ensure the token belongs to an Admin account
      if (decoded.accountType !== "Admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
      }

      req.user = decoded;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired admin token. Please log in again.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during admin token validation.",
    });
  }
};

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
  try {
    // Extracting JWT from request cookies, body or header
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log("token mila",req.header("Authorization"))
    // If JWT is missing, return	 401 Unauthorized response
    if (!token) {
      return res.status(401).json({ success: false, message: `Token Missing` });
    }

    try {
      // Verifying the JWT using the secret key stored in environment variables
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);

      // Session validation
      const Session = require("../Models/Session");
      const activeSession = await Session.findOne({ user: decode.id, token });
      if (!activeSession) {
        return res.status(401).json({
          success: false,
          message: "Session expired or logged out from this device"
        });
      }

      // Update last active asynchronously
      activeSession.lastActive = new Date();
      await activeSession.save().catch(err => console.error("Session update error:", err));

      // Storing the decoded JWT payload in the request object for further use
      req.user = decode;
    } catch (error) {
      // If JWT verification fails, return 401 Unauthorized response
      return res
        .status(401)
        .json({ success: false, message: "token is invalid or session expired" });
    }

    // If JWT is valid, move on to the next middleware or request handler
    next();
  } catch (error) {
    // If there is an error during the authentication process, return 401 Unauthorized response
    return res.status(401).json({
      success: false,
      message: `Something Went Wrong While Validating the Token`,
    });
  }
};
exports.isStudent = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });

    if (userDetails.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route for Students",
      });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `User Role Can't be Verified` });
  }
};
exports.isAdmin = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });

    if (userDetails.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route for Admin",
      });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `User Role Can't be Verified` });
  }
};
exports.isInstructor = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });
    console.log(userDetails);

    console.log(userDetails.accountType);

    if (userDetails.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route for Instructor",
      });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `User Role Can't be Verified` });
  }
};