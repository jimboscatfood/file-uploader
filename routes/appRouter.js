const { Router } = require("express");
const appRouter = Router();
const appController = require("../controllers/appController");
module.exports = appRouter;

appRouter.get("/", appController.showIndexGet);

appRouter.get("/sign-up", appController.userSignUpGet);
appRouter.post("/sign-up", appController.userSignUpPost);

appRouter.get("/log-in", appController.userLogInGet);
appRouter.post("/log-in", appController.userLogInPost);
