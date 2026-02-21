import express from "express";
import { rateLimit } from "express-rate-limit";
import APIResponse from "../utilities/APIResponse.js";

// Authorization controllers
import { signupController, loginController, requestOTP, verifyOTP, logoutUser } from "../controllers/authController.controllers.js";
import refreshAccessToken from "../middlewares/refreshAccessToken.js";
import signupSessionCheckingController from "../controllers/signupPageSessionCheck.js";

// OAuth controllers
import { googleLogin, googleLoginCallback } from "../controllers/oAuth.controller.js";

// middlewares
import expressFormatValidator from "../middlewares/expressValidator.js";
import verifyJWTToRequestOTP from "../middlewares/verifyTempAuthTokenToReqOTP.js";
import verifyJWTToVerifyOTP from "../middlewares/verifyTempAuthTokenToVerifyOTP.js";
import verifyAndDecodeAccessToken from "../middlewares/verifyAccessToken.js";
import checkAlreadyLoggedInSession from "../middlewares/checkLoggedInSession.js";

const authRouter = express.Router();

const loginAttemptLimiter = rateLimit({
     windowMs: 60 * 15 * 1000,
     limit: 5
})
const requestOTPAttemptLimiter = rateLimit({
     windowMs: 10 * 60 * 1000,
     limit: 10
})
const verifyOTPAttemptLimiter = rateLimit({
     windowMs: 10 * 60 * 1000,
     limit: 10
})
const refreshAccessTokenAttemptLimiter = rateLimit({
     windowMs: 1 * 60 * 1000,
     limit: 5
})
const logOutAttemptLimiter = rateLimit({
     windowMs: 10 * 60 * 1000,
     limit: 5
});


authRouter.route("/signup")
     .get(signupSessionCheckingController)
     .post(expressFormatValidator, signupController);

authRouter.route("/login")
     .get(checkAlreadyLoggedInSession, (req, res) => {
          return res
               .status(200)
               .json(new APIResponse(true, 200, "Verification complete"))
     })
     .post(
          // loginAttemptLimiter,
          expressFormatValidator,
          loginController
     )

authRouter.route("/login/request-otp")
     .get(
          // requestOTPAttemptLimiter,
          verifyJWTToRequestOTP,
          requestOTP
     );

authRouter.route("/login/verify-otp")
     .post(
          verifyOTPAttemptLimiter,
          verifyJWTToVerifyOTP,
          verifyOTP);

authRouter.route("/login/refresh")
     .post(
          // refreshAccessTokenAttemptLimiter,
          refreshAccessToken);

authRouter.route("/logout")
     .post(
          logOutAttemptLimiter,
          verifyAndDecodeAccessToken,
          logoutUser
     );

// Open Authorization (OAuth 2.0)
authRouter.route("/google")
     .get(
          googleLogin
     );
authRouter.route("/google/callback")
     .get(
          googleLoginCallback
     );

export default authRouter;
