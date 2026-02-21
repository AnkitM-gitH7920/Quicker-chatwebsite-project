import asyncHandler from "../utilities/asyncHandler.js";
import APIError from "../utilities/APIError.js";
import APIResponse from "../utilities/APIResponse.js";

const landingPageRedirectionController = asyncHandler(async(req, res) => {
     const decodedata = req?.decodedAccessTokenData;
     if(!decodedata || decodedata === undefined) throw new APIError(500, "Something went wrong, while verifying user", "SERVER_ERROR");

     
    return res
    .status(200)
    .json(new APIResponse(true, 200, "All good", "http://localhost:5173/home", { serverStatus: "Healthy" }))
})

export { landingPageRedirectionController }
