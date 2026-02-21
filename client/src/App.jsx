import UserDashboard from "./components/Home/Home";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import OTPVerificationPage from "./components/OTPVerificationPage/OTPVerifcation.jsx";
import NotFoundPage from "./components/ErrorPages/NotFound.jsx";
import ServerErrorPage from "./components/ErrorPages/Error.jsx";
import LandingPage from "./components/LandingPage/LandingPage.jsx";

import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* Protected routes */}
        <Route path="/home" element={<UserDashboard />}></Route>


        {/* General routes */}
        <Route path="/" element={ <LandingPage />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/verify-otp" element={<OTPVerificationPage />}></Route>

        {/* Error routes */}
        <Route path="/server-error" element={<ServerErrorPage />}></Route>
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </QueryClientProvider>
  )
}

export default App;
