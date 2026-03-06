import APIError from "../utilities/APIError.js";
import asyncHandler from "../utilities/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyAndDecodeAccessToken = asyncHandler(async (req, res, next) => {
     let accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

     if (!accessToken) { throw new APIError(401, "Your session has been expired", "ACCESS_TOKEN_EXPIRED") }

     let decodedData;
     try {
          decodedData = jwt.verify(accessToken, process.env.JWT_ACCESSTOKEN_SECRET);
          if (decodedData.purpose !== "ACCESS") {
               throw new APIError(403, "You are not allowed to access this resource", "ACCESS_DENIED");
          }

     } catch (JWTError) {
          if (JWTError.name === "TokenExpiredError") {
               throw new APIError(401, "Your session has been expired", "ACCESS_TOKEN_EXPIRED");
               // Front end will call /refresh after this to get a new access token
          }
          if (JWTError.name === "JsonWebTokenError") {
               throw new APIError(401, "For security reasons, please log in again", "AUTHORIZATION_ERROR");
          }
          if (JWTError.name === "NotBeforeError") {
               throw new APIError(401, "If the issue persists, try refreshing the page or contact support", "AUTHORIZATION_ERROR");
          }

          throw new APIError(500, `Error : ${JWTError.message}` || "Something went wrong, please try again later", "SERVER_ERROR");
     }

     req.decodedAccessTokenData = decodedData;
     next();
});


export default verifyAndDecodeAccessToken;
