import APIError from "../utilities/APIError.js"
import APIResponse from "../utilities/APIResponse.js"
import asyncHandler from "../utilities/asyncHandler.js"
import jwt from "jsonwebtoken"

// success, statusCode, message, redirectingURL = null, serverData = null
// statusCode, message, code
function jwtErrorHandler(err) {
    // Token missing
    if (!err) {
        return new APIError(401, "Token missing", "TOKEN_MISSING")
    }

    // Expired token
    if (err.name === "TokenExpiredError") {
        return new APIError(401, "Access token expired", "TOKEN_EXPIRED")
    }

    // Invalid signature / malformed token
    if (err.name === "JsonWebTokenError") {
        return new APIError(401, "Invalid access token", "INVALID_TOKEN")
    }

    // Token used before valid time
    if (err.name === "NotBeforeError") {
        return new APIError(401, "Token not active yet", "TOKEN_NOT_ACTIVE")
    }

    // Wrong algorithm attack
    if (err.message === "invalid algorithm") {
        return new APIError(401, "Invalid token algorithm", "INVALID_ALGORITHM")
    }

    // Fallback
    return new APIError(500, "Token verification failed", "UNKNOWN_AUTHORIZATION_ERROR")
}

const signupSessionCheckingController = asyncHandler(async (req, res, next) => {
    let accessToken = req.header("Authorization")?.replace("Bearer ", "")
    if (accessToken === undefined || !accessToken) {
        throw new APIError(401, "Access token not found", "AUTHORIZATION_ERROR")
    }

    let decodedAccessToken
    try {
        decodedAccessToken = await jwt.verify(accessToken, process.env.JWT_ACCESSTOKEN_SECRET)
        console.log(decodedAccessToken)

    } catch (jwtError) {
        console.log(jwtError)
        return next(jwtErrorHandler(jwtError))
    }

    return res
        .status(200)
        .json(new APIResponse(true, 200, "User verified", "http://localhost:5173/home"))
})

export default signupSessionCheckingController