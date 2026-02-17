import jwt from "jsonwebtoken";
import asyncHandler from "../utilities/asyncHandler.js";
import APIError from "../utilities/APIError.js";
import APIResponse from "../utilities/APIResponse.js";

// const checkAlreadyLoggedInSession = asyncHandler(async (req, res, next) => {
//     let accessToken = req.cookies?.accessToken;
//     // console.log(accessToken);
// 
//     // !! rewrite this middleware
// 
//     if (!accessToken) {
//         return next()
//     } else {
//         try {
//             const decoded = jwt.verify(accessToken, process.env.JWT_ACCESSTOKEN_SECRET);
//             if (decoded.purpose !== "ACCESS") {
//                 throw new APIError(403, "You are not allowed to access this resource", "ACCESS_DENIED")
//             }
//             if (!decoded) { return next() }
// 
//             return res.json({ redirectURL: "http://localhost:5173/" })
// 
//         } catch (JWTError) {
//             console.log("JWT ERROR AT preventAuthorizedUser : " + JWTError);
//             if (
//                 JWTError.name === "TokenExpiredError" ||
//                 JWTError.name === "JsonWebTokenError" ||
//                 JWTError.name === "NotBeforeError"
//             ) { return next() }
// 
// 
//         }
//     }
// })

const checkAlreadyLoggedInSession = asyncHandler(async (req, res, next) => {
    let accessToken = req.cookies?.accessToken;
    if (!accessToken || accessToken === undefined) return next();

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESSTOKEN_SECRET);

        if (decoded.purpose !== "ACCESS") throw new APIError(403, "You are not allowed to access this resource", "ACCESS_DENIED")
        if (!decoded) return next()

        return res
            .status(200)
            .json(new APIResponse(true, 200, "User verified", "http://localhost:5173/home"))

    } catch (sessionVerificationError) {
        console.log(sessionVerificationError)

        if (
            sessionVerificationError.name === "TokenExpiredError" ||
            sessionVerificationError.name === "JsonWebTokenError" ||
            sessionVerificationError.name === "NotBeforeError"

        ) return next(sessionVerificationError)
    }
})

export default checkAlreadyLoggedInSession;