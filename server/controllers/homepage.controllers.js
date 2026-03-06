import asyncHandler from "../utilities/asyncHandler.js";
import APIResponse from "../utilities/APIResponse.js";
import APIError from "../utilities/APIError.js";
import chalk from "chalk";
import { redis } from "../utilities/redisClient.js";

// model imports
import UserProfileInfo from "../models/registeredUsersMetaData.model.js";
import RecentChats from "../models/recentChats.model.js";

/*
 * @param {*} userID
 * @returns []
 */
async function retreiveRecentChats(userID) {
     try {
          let cachedUser = await redis.get(userID);
          cachedUser = JSON.parse(cachedUser)
          let cachedUserChats = cachedUser.recentChats;
          console.log(cachedUserChats)

          if (
               !cachedUserChats ||
               cachedUserChats === null ||
               !cachedUserChats.length
          ) {
               console.log("Inside db method")
               let storedUserChats = await RecentChats.find({ email: "ankitmehra7920@gmail.com" });
               if (!storedUserChats) {
                    console.log("Stored recent chats :- ")
                    return [];
               }
               console.log(storedUserChats)

               redis.append(userID, JSON.stringify(storedUserChats))
               storedUserChats = storedUserChats[0].recentChats;
               return storedUserChats; // if empty, returns []


          } else {
               console.log("Cached recent chats :- ")
               return cachedUserChats; //return chatListArray
          }

     } catch (err) {
          console.log(chalk.bgBlueBright("Error inside async function retreiveRecentChats!!!"))
          console.log(err)
          throw err;

     }

}
const loadHomePageUserData = asyncHandler(async (req, res, next) => {
     const decodedData = req?.decodedAccessTokenData;
     if (!decodedData) throw new APIError(500, "Something went wrong, while verifying the session", "SERVER_ERROR", {});


     let userData;
     try {
          const cachedData = await redis.get("69a7ed525f8d9383a1c62bcf");
          if (!cachedData) {
               // test commit only
               // find by userID: decoded?.userID <-- to be set

               const storedData = await UserProfileInfo.find({ _id: "69a7ed525f8d9383a1c62bcf" });
               if (!storedData) throw new APIError(404, "User info cannot be retreived", "NOT_FOUND", null);

               await redis.set("69a7ed525f8d9383a1c62bcf", JSON.stringify(storedData));
               userData = storedData; // parsed data

          } else {
               console.log("Error JSON :-");
               console.log(cachedData)
               userData = JSON.parse(cachedData)
          }

          const getAllRecentChats = await retreiveRecentChats("69a7ed525f8d9383a1c62bcf"); //pass @param userID
          userData.recentChats = getAllRecentChats;
          console.log("Fetch recent chats method results :- ", getAllRecentChats)

     } catch (dbError) {
          console.log(chalk.red("DB Error in (server/controllers/homepage.controllers.js) :-"))
          console.log(dbError);
          return next(dbError)
     }

     return res
          .status(200)
          .json(new APIResponse(true, 200, "/home API hit success", null, {
               userMetaData: { ...userData[0] },
               userRecentChats: userData.recentChats
          }));
})


export {
     loadHomePageUserData
}
