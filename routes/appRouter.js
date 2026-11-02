const { Router } = require("express");
const appRouter = Router();
const appController = require("../controllers/appController");
module.exports = appRouter;

appRouter.get("/", appController.showIndexGet);

appRouter.get("/sign-up", appController.userSignUpGet);
appRouter.post("/sign-up", appController.userSignUpPost);

appRouter.get("/log-in", appController.userLogInGet);
appRouter.post("/log-in", appController.userLogInPost);

appRouter.get("/log-out", appController.userLogoutGet);

// appRouter.post("/upload", appController.uploadFilePost);

appRouter.get("{/folder{/:folderId}}/new-folder", appController.newFolderGet);
appRouter.post("{/folder{/:folderId}}/new-folder", appController.newFolderPost);

appRouter.get("/folder/:folderId", appController.showFolderGet);

appRouter.post("/delete/:folderId", appController.deleteFolderPost);
