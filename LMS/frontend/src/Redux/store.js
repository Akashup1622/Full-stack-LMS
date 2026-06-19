import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./Slices/authSlice"
import courseReducer from "./Slices/courseSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
  },
})
