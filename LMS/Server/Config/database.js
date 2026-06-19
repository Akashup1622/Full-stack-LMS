const mongoose=require("mongoose")
const User = require("../Models/User")
const Profile = require("../Models/Profile")
const bcrypt = require("bcrypt")
require("dotenv").config();

exports.connect=()=>{
    mongoose.connect(process.env.MONGODB_URL,{
    })
    .then(async () => {
        console.log("db connected successfully")
        try {
            const adminExist = await User.findOne({ accountType: "Admin" })
            if (!adminExist) {
                const hashedPassword = await bcrypt.hash("admin123", 10)
                const profile = await new Profile({
                    gender: "Male",
                    dateOfBirth: "1990-01-01",
                    about: "LMS System Administrator",
                    contactNumber: "1234567890"
                }).save()
                
                await new User({
                    firstName: "System",
                    lastName: "Admin",
                    email: "admin@lms.com",
                    password: hashedPassword,
                    accountType: "Admin",
                    active: true,
                    approved: true,
                    additionalDetails: profile._id,
                    image: `https://api.dicebear.com/9.x/initials/svg?seed=System Admin`
                }).save()
                console.log("Default Admin seeded successfully: admin@lms.com / admin123")
            }
        } catch (err) {
            console.error("Error seeding default admin user:", err)
        }
    })
    .catch(err=>{console.log("db connection failed")
        console.error(err)
        process.exit(1)
    } )
}