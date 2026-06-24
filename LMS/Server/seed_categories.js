const mongoose = require("mongoose")
const Category = require("./Models/Category")
require("dotenv").config()

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/fullstackapp"

async function seed() {
  try {
    console.log("Connecting to MongoDB at:", MONGODB_URL)
    await mongoose.connect(MONGODB_URL)
    console.log("Connected successfully.")

    const count = await Category.countDocuments({})
    console.log("Current category count in DB:", count)

    if (count === 0) {
      console.log("Seeding default categories...")
      const defaultCategories = [
        { name: "Web Development", description: "Full stack, frontend, and backend technologies." },
        { name: "Mobile App Development", description: "iOS, Android, React Native, and Flutter development." },
        { name: "Data Science & AI", description: "Machine learning, python, analytics, and intelligence systems." },
        { name: "UI/UX Design", description: "Wireframing, prototyping, Figma, and human interface guidelines." },
        { name: "Digital Marketing", description: "SEO, search ads, and branding." },
      ]

      const docs = await Category.insertMany(defaultCategories)
      console.log("Successfully seeded categories:")
      console.log(docs)
    } else {
      const existing = await Category.find({})
      console.log("Existing categories:")
      console.log(existing)
    }
  } catch (err) {
    console.error("Seeding failed with error:", err)
  } finally {
    await mongoose.connection.close()
    console.log("Database connection closed.")
  }
}

seed()
