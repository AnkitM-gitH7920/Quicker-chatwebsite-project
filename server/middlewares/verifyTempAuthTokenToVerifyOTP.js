import asyncHandler from "../utilities/asyncHandler.js";
import jwt from "jsonwebtoken";
import APIError from "../utilities/APIError.js";


const verifyJWTToVerifyOTP = asyncHandler(async (req, res, next) => {
    const verifyOTPSession = req.cookies?.verifyOtpSession;

    if (!verifyOTPSession || verifyOTPSession === undefined) { throw new APIError(401, "Your session to verify OTP has been expired, please login again to request a new OTP", "UNAUTHORIZED") }

    const decodedVerifyOtpSession = jwt.verify(verifyOTPSession, process.env.JWT_SECRET, function (jwtError, decoded) {
        if (jwtError) {
            if (jwtError.name === "TokenExpiredError") throw new APIError(401, "Your session has expired. Please log in again and request a new OTP", "UNAUTHORIZED");
            if (jwtError.name === "JsonWebTokenError") throw new APIError(401, "For security reasons, please log in again", "AUTHORIZATION_ERROR");
            if (jwtError.name === "NotBeforeError") throw new APIError(401, "If the issue persists, try refreshing the page or contact support", "AUTHORIZATION_ERROR");

            throw new APIError(401, "For security reasons, please log in again", "AUTHORIZATION_ERROR");
        }

        return decoded;
    })

    if (!decodedVerifyOtpSession?.otpVerificationPending) throw new APIError(401, "For security reasons, you have to login again", "AUTHORIZATION_ERROR")
    if (!decodedVerifyOtpSession?.purpose || decodedVerifyOtpSession.purpose !== "SIGNUP_OTP") throw new APIError(401, "For security reasons, you have to login again", "AUTHORIZATION_ERROR")

    req.verifyOTPDecodedToken = decodedVerifyOtpSession;
    next();
});

export default verifyJWTToVerifyOTP;