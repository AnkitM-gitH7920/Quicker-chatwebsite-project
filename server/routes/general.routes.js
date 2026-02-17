import express from "express";
import { basicRequest } from "../controllers/generalController.controllers.js";

// middleware
import verifySecuredJWTTokens from "../middlewares/verifySecuredJWTTokens.js";

const generalRouter = express.Router();

generalRouter.route("/").get(basicRequest);

export default generalRouter;