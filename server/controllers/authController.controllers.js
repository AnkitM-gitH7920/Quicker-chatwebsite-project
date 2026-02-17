import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/users.models.js";
import OtpStorage from "../models/otpStorage.model.js";
import asyncHandler from "../utilities/asyncHandler.js";
import APIResponse from "../utilities/APIResponse.js";
import APIError from "../utilities/APIError.js";
import generalPasswordFormatSchema from "../utilities/passwordValidator.js";
import generateAccessAndRefreshTokens from "../utilities/genAccessAndRefToken.js";
import { sendHtmlMail } from "../utilities/sendMails.js";
import { validationResult } from "express-validator";
import { secureCookieOptions } from "../utilities/secureCookieOptions.js";

const convertOTPToString = (enteredOTP) => { return typeof (enteredOTP) === "string" ? enteredOTP : enteredOTP.toString(); }

// @To handle registering the user after validating and filtering user input from mallicious scripts
const signupController = asyncHandler(async (req, res, next) => {
  let { email, password } = req.body;

  if (email === undefined || password === undefined) {
    throw new APIError(400, "Important fields are required", "USER_ERROR");
  }

  email = email.trim();
  password = password.trim();

  let errors = validationResult(req);
  if (!errors.isEmpty() && errors.errors[0].path === "email") {
    throw new APIError(400, errors.errors[0].msg, "USER_ERROR");
  }

  if (!generalPasswordFormatSchema.validate(password)) {
    throw new APIError(400, "Password is weak, keep a password with atleast 10 characters", "USER_ERROR");
  }

  try {
    await User.create({
      email: email,
      password: password
    })

  } catch (signupAttemptError) {
    if (signupAttemptError.code === 11000) {
      if (signupAttemptError.keyValue?.email) {
        let alreadyRegisteredMailAddress = signupAttemptError.keyValue?.email;
        throw new APIError(409, `${alreadyRegisteredMailAddress} is already registered`, "CONFLICT")
      }
    }

    return next(signupAttemptError);
  }

  return res
    .status(200)
    .json(new APIResponse(true, 200, "User registered successfully"));
})

// @Provide temporary authorization token to the user, to allow the user to proceed further and request otp from server
const loginController = asyncHandler(async (req, res, next) => {
  let { email, password } = req.body;

  if (!email || !password) { throw new APIError(400, "Important fields are required", "USER_ERROR"); }

  const errors = validationResult(req);
  if (!errors.isEmpty() && errors.errors[0].path === "email") { throw new APIError(400, errors.errors[0].msg, "USER_ERROR"); }

  let loggedInUser;
  try {
    loggedInUser = await User.findOne({ email });
    if (!loggedInUser) {
      loggedInUser = null;
      throw new APIError(404, "User is not registered", "NOT_FOUND");
    }

    if (loggedInUser.provider === "google") { throw new APIError(400, "This account was created using Google. Please continue with Google sign-in", "USER_ERROR") }

    const compareResult = await loggedInUser.compareEncryptedPassword(password)
    if (!compareResult) { throw new APIError(401, "Email and password combination is incorrect", "USER_ERROR") }

  } catch (loginAttemptError) {
    console.log(loginAttemptError);
    return next(loginAttemptError);
  }

  const requestOtpSession = jwt.sign({
    userID: loggedInUser._id,
    email: email,
    purpose: "SIGNUP_OTP",
    otpVerificationPending: true
  }, process.env.JWT_SECRET,

    { expiresIn: "5m" });

  if (!requestOtpSession) { throw new APIError(500, "Something went wrong, cannot request OTP at the moment", "SERVER_ERROR") }

  return res
    .status(200)
    .cookie("requestOtpSession", requestOtpSession, { ...secureCookieOptions, maxAge: 5 * 60 * 1000 })
    .json(new APIResponse(true, 200, "User found", process.env.DEPLOYED_FRONTEND_URL + "/verify-otp"))
});

// @To handle request for providing the OTP to the user via nodemailer and storing otp in the database
const requestOTP = asyncHandler(async (req, res, next) => {
  let decodedData = req?.requestOTPDecodedToken;

  if (!decodedData) throw new APIError(500, "Something went wrong while verifying user, please try again later", "SERVER_ERROR");
  if (decodedData.email === undefined || !decodedData?.email) { throw new APIError(400, "Email not provided, cannot send mail at the moment :(") }


  let userID = decodedData.userID;
  let OTP = (crypto.randomInt(100000, 1000000)).toString();
  let OTPHash = await bcrypt.hash(OTP, 10);
  try {
    const storedHashedOTPDocument = await OtpStorage.findOneAndUpdate(
      { userID },
      {
        OTPHash: OTPHash,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000)
      },
      {
        upsert: true,
        new: true
      }
    );

    if (!storedHashedOTPDocument) {
      throw new APIError();
    }

  } catch (otpStorageError) { return next(otpStorageError) }

  const subject = `Your OTP for login is : ${OTP}`;
  const OTPMailBody = `
            <!DOCTYPE html>
            <html>
              <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
                <div style="width:100%;padding:40px 0;background-color:#f4f6f8;">
                  <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,0.08);overflow:hidden;">

                    <!-- Header -->
                    <div style="background-color:#4f46e5;padding:30px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:26px;">OTP Verification</h1>
                    </div>

                    <!-- Body -->
                    <div style="padding:30px;color:#333333;line-height:1.6;">
                      <h2 style="margin-top:0;font-size:22px;color:#111827;">Verify Your Email Address</h2>

                      <p style="font-size:15px;">
                        Hello,
                      </p>

                      <p style="font-size:15px;">
                        We received a request to verify your email address. Please use the One-Time Password (OTP) below to complete your verification process.
                      </p>

                      <!-- OTP -->
                      <div style="margin:30px 0;text-align:center;">
                        <div style="display:inline-block;padding:16px 32px;font-size:32px;font-weight:bold;letter-spacing:6px;color:#4f46e5;background-color:#eef2ff;border-radius:6px;">
                          ${OTP}
                        </div>
                      </div>

                      <p style="font-size:15px;">
                        This OTP is valid for <strong>5 minutes</strong>. Please do not share this code with anyone for security reasons.
                      </p>

                      <div style="margin-top:25px;padding:16px;background-color:#f9fafb;border-left:4px solid #4f46e5;">
                        <p style="margin:6px 0;font-size:14px;">
                          • If you did not request this verification, please ignore this email.
                        </p>
                        <p style="margin:6px 0;font-size:14px;">
                          • For your security, our team will never ask for your OTP.
                        </p>
                      </div>

                      <p style="margin-top:25px;font-size:14px;color:#6b7280;">
                        If you are having trouble, please contact our support team, by contacting us @ ankitmehra7920@gmail.com
                      </p>
                    </div>

                    <!-- Footer -->
                    <div style="padding:20px;text-align:center;background-color:#f9fafb;color:#6b7280;font-size:13px;">
                      © 2026 Your Company. All rights reserved.
                    </div>

                  </div>
                </div>
              </body>
            </html>
            `;
  try {
    await sendHtmlMail(decodedData?.email, subject, OTPMailBody);

  } catch (nodemailerError) {
    await OtpStorage.findByIdAndDelete(userID);
    return next(nodemailerError);
  }

  const verifyOtpSession = jwt.sign({
    userID: userID,
    purpose: "SIGNUP_OTP",
    email: decodedData?.email,
    otpVerificationPending: true

  }, process.env.JWT_SECRET,
    { expiresIn: "5m" }
  );

  return res
    .status(200)
    .cookie("verifyOtpSession", verifyOtpSession, { ...secureCookieOptions, maxAge: 5 * 60 * 1000 })
    .json(new APIResponse(true, 200, "OTP Provided and stored"));

});

// @To handle for verifying the entered OTP
const verifyOTP = asyncHandler(async (req, res, next) => {
  const { enteredOTP } = req.body;

  if (!enteredOTP || isNaN(enteredOTP) || enteredOTP.toString().length !== 6) { throw new APIError(400, "Invalid OTP format", "USER_ERROR") }

  const decodedData = req?.verifyOTPDecodedToken;
  if (!decodedData) { throw new APIError(500, "Something went wrong while verifying user", "SERVER_ERROR") }

  let user;
  try {
    const OTP = convertOTPToString(enteredOTP);
    const storedOTP = await OtpStorage.findOne({
      userID: decodedData.userID
    });

    if (!storedOTP || storedOTP.expiresAt < Date.now()) { throw new APIError(410, "Entered OTP has been expired. Please login again to request a new one", "OTP_EXPIRED"); }

    const isOTPCorrect = await storedOTP.compareHashedOTP(OTP)
    if (!isOTPCorrect) { throw new APIError(400, "Incorrect OTP", "INVALID_OTP") }

    user = await User.findById(decodedData.userID);
    if (!user) { throw new APIError(404, "User not found", "NOT_FOUND") }

  } catch (err) { return next(err) }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);
  if (!accessToken || !refreshToken) { throw new APIError(500, "Something went wrong while generating access and refresh tokens", "SERVER_ERROR") }

  return res
    .status(200)
    .cookie("accessToken", accessToken, { ...secureCookieOptions, maxAge: 45 * 60 * 1000 })
    .cookie("refreshToken", refreshToken, { ...secureCookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 })
    .json(new APIResponse(true, 200, "User logged in successfully", process.env.DEPLOYED_FRONTEND_URL + "/home", { accessToken }))
});

// @To securely logout user from the website
const logoutUser = asyncHandler(async (req, res, next) => {
  let decodedData = req.decodedAccessTokenData;
  if (!decodedData) {
    throw new APIError(500, "Something went wrong while verifying user, please try again later", "SERVER_ERROR");
  }

  let updatedUser;
  try {
    updatedUser = await User.findOneAndUpdate(
      { _id: decodedData.userID },
      {
        refreshToken: null,
        loggedOffOn: new Date(Date.now())
      }
    )
  } catch (logoutAttemptError) {
    console.log(mongoDBError.message);
    return next(logoutAttemptError);
  }

  if (!updatedUser) {
    throw new APIError(500, "Something went wrong while fetching data from the server", "SERVER_ERROR");
  }

  return res
    .status(200)
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000
    })
    .json(new APIResponse(true, 200, "User logged out successfully"));
})

export {
  signupController,
  loginController,
  requestOTP,
  verifyOTP,
  logoutUser
}