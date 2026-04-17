import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom"
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import OTP from "./Pages/sendotp";
import ResetPassword from "./Pages/ResetPassword";
import CheckEmail from "./Pages/CheckEmail";
import NewPassword from "./Pages/ChooseNewPassword";
import ResetSuccess from "./Pages/Resetsuccess";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<OTP />} />

        {/* 🔥 Forgot Password Flow */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/reset-success" element={<ResetSuccess />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;