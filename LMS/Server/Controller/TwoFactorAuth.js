const { authenticator } = require("otplib");
const qrcode = require("qrcode");
const User = require("../Models/User");
const Session = require("../Models/Session");
const jwt = require("jsonwebtoken");

// 1. Generate 2FA Secret & QR Code
exports.setup2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Generate secret
        const secret = authenticator.generateSecret();
        // Generate otpauth URL
        const otpauthUrl = authenticator.keyuri(user.email, "StudyNotion LMS", secret);

        // Generate QR code data URL
        const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

        // Store temporary secret (don't enable until verified)
        user.twoFactorSecret = secret;
        await user.save();

        return res.status(200).json({
            success: true,
            qrCodeUrl,
            secret
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Verify and Enable 2FA
exports.verify2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: "Token is required" });
        }

        const user = await User.findById(userId);
        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({ success: false, message: "2FA setup has not been initiated" });
        }

        // Verify token
        const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid 2FA token" });
        }

        user.twoFactorEnabled = true;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Two-factor authentication enabled successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Disable 2FA
exports.disable2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Verify token before disabling
        const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid 2FA token" });
        }

        user.twoFactorEnabled = false;
        user.twoFactorSecret = "";
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Two-factor authentication disabled successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Verify 2FA at login
exports.loginVerify2FA = async (req, res) => {
    try {
        const { tempToken, token } = req.body;
        if (!tempToken || !token) {
            return res.status(400).json({ success: false, message: "tempToken and token are required" });
        }

        // Verify tempToken
        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid or expired temporary token" });
        }

        if (decoded.action !== "2fa_verify") {
            return res.status(400).json({ success: false, message: "Invalid token action" });
        }

        const user = await User.findById(decoded.id).populate("additionalDetails");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Verify OTP
        const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid 2FA code" });
        }

        // 2FA Verified! Issue final token
        const finalToken = jwt.sign(
            { email: user.email, id: user._id, accountType: user.accountType },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Record active session
        const deviceInfo = req.headers["user-agent"] || "Unknown Device";
        const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0";

        const activeSessionsCount = await Session.countDocuments({ user: user._id });
        if (activeSessionsCount >= 2) {
            const oldestSession = await Session.findOne({ user: user._id }).sort({ lastActive: 1 });
            if (oldestSession) {
                await Session.findByIdAndDelete(oldestSession._id);
            }
        }
        await Session.create({
            user: user._id,
            token: finalToken,
            deviceInfo,
            ipAddress,
            lastActive: new Date()
        });

        const options = {
            httpOnly: true,
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        };

        user.token = finalToken;
        user.password = undefined;

        return res.cookie("token", finalToken, options).status(200).json({
            success: true,
            message: "Login Successful",
            token: finalToken,
            user,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
