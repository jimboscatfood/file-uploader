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

//set up multer middleware for process user's uploaded file
const multer = require("multer");
// set up Multer to use Memory Storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

appRouter.post(
  "{/folder{/:folderId}}/upload",
  upload.single("upload"),
  appController.uploadFilePost,
);

appRouter.get("/file/:fileId", appController.readFileInfoGet);
appRouter.get("/file/:fileId/delete", appController.deleteFilePost);
appRouter.get("/file/:fileId/download", appController.downloadFileGet);

appRouter.post("{/folder{/:folderId}}/share", appController.shareFolderPost);

appRouter.get("/shared/:token", appController.getSharedFolderGet);
