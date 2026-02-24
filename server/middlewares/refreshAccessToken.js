import jwt from "jsonwebtoken";
import asyncHandler from "../utilities/asyncHandler.js";
import APIError from "../utilities/APIError.js";
import User from "../models/users.models.js";
import APIResponse from "../utilities/APIResponse.js";
import { secureCookieOptions } from "../utilities/secureCookieOptions.js";

const refreshAccessToken = asyncHandler(async (req, res, next) => {
     let refreshToken = req.cookies?.refreshToken;

     if (!refreshToken) { throw new APIError(401, "Your session has expired, login again to proceed", "REFRESH_TOKEN_EXPIRED") }

     let decodedData;
     try {
          decodedData = jwt.verify(refreshToken, process.env.JWT_REFRESHTOKEN_SECRET);
          if (!decodedData) {
               throw new APIError();
          }

          if (decodedData.purpose !== "ACCESS") { throw new APIError(403, "You are not allowed to access this resource", "ACCESS_DENIED") }

     } catch (JWTError) {
          if (JWTError.name === "TokenExpiredError") throw new APIError(401, "Your session has been expired, please login again to use the resource", "REFRESH_TOKEN_EXPIRED")
          if (JWTError.name === "JsonWebTokenError") throw new APIError(401, "For security reasons, please log in again", "AUTHORIZATION_ERROR")
          if (JWTError.name === "NotBeforeError") throw new APIError(401, "If the issue persists, try refreshing the page or contact support", "AUTHORIZATION_ERROR")

          return next(JWTError);
     }

     let newAccessToken;
     try {
          let storedUser = await User.findById(decodedData.userID);
          if (!storedUser || storedUser.refreshToken !== refreshToken) { throw new APIError(401, "Your session has been expired, please login again to use this resource", "REFRESH_TOKEN_EXPIRED"); }

          newAccessToken = jwt.sign(
               {
                    userID: storedUser._id,
                    email: storedUser.email,
                    purpose: "ACCESS"
               }, process.env.JWT_ACCESSTOKEN_SECRET, { expiresIn: "45m" }
          )
          if (!newAccessToken) throw new APIError(500, "Something went wrong while generating new access token", "AUTHORIZATION_ERROR")


     } catch (mongoDBError) {
          console.log("Error at refreshAccessToken in catch block :- ")
          console.log(mongoDBError.message)
          return next(mongoDBError);
     }

     return res
          .status(200)
          .cookie("accessToken", newAccessToken, { ...secureCookieOptions, maxAge: 45 * 60 * 1000 })
          .json(new APIResponse(true, 200, "New access token provided", null, { accessToken: newAccessToken }));
})

export default refreshAccessToken;
