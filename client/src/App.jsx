import UserDashboard from "./components/Home/Home";
import Login from "./components//Login";
import Signup from "./components/Signup";
import OTPVerificationPage from "./components/OTPVerification.jsx";
import NotFoundPage from "./components/ErrorPages/NotFound.jsx";
import ServerErrorPage from "./components/ErrorPages/Error.jsx";
import LandingPage from "./components/LandingPage.jsx";

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
        <Route path="/error" element={<ServerErrorPage />}></Route>
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </QueryClientProvider>
  )
}

export default App;
