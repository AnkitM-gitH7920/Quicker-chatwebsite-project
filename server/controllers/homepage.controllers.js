import express from "express";
import asyncHandler from "../utilities/asyncHandler.js";
import APIResponse from "../utilities/APIResponse.js";
import APIError from "../utilities/APIError.js";
import { redis } from "../utilities/redisClient.js";

// model imports
import RecentChats from "../models/recentChats.model.js";


const loadHomePageUserData = asyncHandler(async (req, res, next) => {
     const accessToken = req.cookies?.accessToken;
     if (!accessToken) throw new APIError(401, "Access token not found", "ACCESS_TOKEN_EXPIRED", { accessToken });


     // Start by add data into redis and finding data from both redis and main db

     try {


     } catch (dbError) {
          console.log("Mongo Db error at homepage.controller :-");
          console.log(dbError.message);
     }



     return res
          .status(200)
          .json(new APIResponse(true, 200, "/home API hit success", null, { accessToken }));
})


export {
     loadHomePageUserData
}
