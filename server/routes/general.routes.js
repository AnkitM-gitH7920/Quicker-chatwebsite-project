import express from "express";
import { landingPageRedirectionController } from "../controllers/landingPage.controllers.js";

// middleware
import verifyAndDecodeAccessToken from "../middlewares/verifyAccessToken.js";

const generalRouter = express.Router();

generalRouter.route("/").get(verifyAndDecodeAccessToken, landingPageRedirectionController);

export default generalRouter;
