import asyncHandler from "../utilities/asyncHandler.js";
import APIError from "../utilities/APIError.js";

const basicRequest = asyncHandler(async(req, res) => {
    throw new APIError(500, "Example APIError class output", "EXAMPLE_ERROR_CODE");
})

export { basicRequest }