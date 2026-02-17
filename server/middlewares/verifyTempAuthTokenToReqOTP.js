import asyncHandler from "../utilities/asyncHandler.js";
import jwt from "jsonwebtoken";
import APIError from "../utilities/APIError.js";


const verifyJWTToRequestOTP = asyncHandler(async (req, res, next) => {
    let requestOtpSession = req.cookies?.requestOtpSession;

    if (!requestOtpSession || requestOtpSession === undefined) throw new APIError(401, "Your OTP requesting session has been expired, please login again", "UNAUTHORIZED");

    const decodedRequestOtpSession = jwt.verify(requestOtpSession, process.env.JWT_SECRET, function (jwtError, decoded) {
        if (jwtError) {
            if (jwtError.name === "TokenExpiredError") throw new APIError(401, "Your session has expired. Please log in again to request a new OTP", "UNAUTHORIZED");
            if (jwtError.name === "JsonWebTokenError") throw new APIError(401, "For security reasons, please log in again", "AUTHORIZATION_ERROR");
            if (jwtError.name === "NotBeforeError") throw new APIError(401, "If the issue persists, try refreshing the page or contact support", "AUTHORIZATION_ERROR");

            throw new APIError(401, "For security reasons, please log in again", "AUTHORIZATION_ERROR");
        }

        return decoded;
    });

    if (!decodedRequestOtpSession?.otpVerificationPending) throw new APIError(401, "For security reasons, you have to login again", "AUTHORIZATION_ERROR")
    if (!decodedRequestOtpSession?.purpose || decodedRequestOtpSession.purpose !== "SIGNUP_OTP") throw new APIError(401, "For security reasons, you have to login again", "AUTHORIZATION_ERROR")

    req.requestOTPDecodedToken = decodedRequestOtpSession;
    next();
})

export default verifyJWTToRequestOTP;