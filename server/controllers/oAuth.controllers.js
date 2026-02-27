import asyncHandler from "../utilities/asyncHandler.js";
import APIError from "../utilities/APIError.js";
import axios from "axios";
import User from "../models/users.models.js";
import generateAccessAndRefreshTokens from "../utilities/genAccessAndRefToken.js";
import { secureCookieOptions } from "../utilities/secureCookieOptions.js";

const googleLogin = asyncHandler(async (req, res) => {
    const oAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.OAUTH_REDIRECT_URI,
        response_type: "code",
        scope: "profile email"
    });

    res.redirect(oAuthURL);
});

const googleLoginCallback = asyncHandler(async (req, res, next) => {
    const { code } = req.query;
    if (!code) throw new APIError();

    let googleLoggedInUser;
    try {
        const tokenFetchResponse = await axios.post(`https://oauth2.googleapis.com/token`,
            {
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.OAUTH_REDIRECT_URI,
                grant_type: "authorization_code",
                code
            });
        const fetchUser = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo`,
            {
                headers: {
                    "Authorization": `Bearer ${tokenFetchResponse.data.access_token}`
                }
            }
        );

        googleLoggedInUser = await User.findOneAndUpdate(
            { email: fetchUser.data.email },
            {
                provider: "google",
                fullName: fetchUser.data.name
            },
            {
                upsert: true,
                new: true
            }
        )
        if (!googleLoggedInUser) {
            throw new APIError(500, "Something went wrong while trying to log in", "SERVER_ERROR");
        }

    } catch (error) { return next(error) }

    let { accessToken, refreshToken } = await generateAccessAndRefreshTokens(googleLoggedInUser);
    if (!accessToken || !refreshToken) { throw new APIError(500, "Something went wrong while providing session ID", "SERVER_ERROR") }

    return res
        .status(200)
        .cookie("accessToken", accessToken, { ...secureCookieOptions, maxAge: 45 * 60 * 1000, })
        .cookie("refreshToken", refreshToken, { ...secureCookieOptions, maxAge: 90 * 24 * 60 * 60 * 1000, })
        .redirect(`${process.env.DEPLOYED_FRONTEND_URL}/home`)
});

export {
    googleLogin,
    googleLoginCallback
}
