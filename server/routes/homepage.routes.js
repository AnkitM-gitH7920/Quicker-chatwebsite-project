import express from "express";

// controller imports
import { landingPageRedirectionController } from "../controllers/landingPage.controllers.js";
import { loadHomePageUserData } from "../controllers/homepage.controllers.js";

// middleware imports
import verifyAndDecodeAccessToken from "../middlewares/verifyAccessToken.js";

const mainAppRouter = express.Router();

mainAppRouter.route("/")
.get(verifyAndDecodeAccessToken, landingPageRedirectionController);

mainAppRouter.route("/home")
.get(loadHomePageUserData)



export default mainAppRouter;
