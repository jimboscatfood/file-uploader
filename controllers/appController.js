//import env variables for configuring Cloudinary for uploader
require("dotenv/config");

const db = require("../db/queries");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const bcrypt = require("bcryptjs");

const crypto = require("crypto");
const ms = require("ms");

async function showIndexGet(req, res) {
  //if user is logged in
  if (req.user) {
    res.render("index", { user: req.user });
  } else {
    res.render("index");
  }
}

//show sign up page
async function userSignUpGet(req, res) {
  res.render("signup-form");
}

//validate user sign up info
const { body, validationResult, matchedData } = require("express-validator");
const { name } = require("ejs");
const usernameFormatErr = "Username must contain only letters and numbers.";
const usernameLengthErr = "Username must be between 1 and 50 characters.";
const passwordLengthErr = "Password must contain at least 6 characters.";
const passwordConfirmErr = "Password confirmation does not match password.";

const validateUserInfo = [
  body("username")
    .trim()
    .isAlphanumeric()
    .withMessage(usernameFormatErr)
    .isLength({ min: 1, max: 50 })
    .withMessage(usernameLengthErr),
  body("password").trim().isLength({ min: 6 }).withMessage(passwordLengthErr),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage(passwordConfirmErr),
];

const userSignUpPost = [
  validateUserInfo,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("signup-form", { errors: errors.array() });
    }
    const { username, password } = matchedData(req);
    const hashedPassword = await bcrypt.hash(password, 10);
    //create a new registered user in the database
    await db.createNewUser(username, hashedPassword);
    res.redirect("/");
  },
];

//show log in page
async function userLogInGet(req, res) {
  const messages = req.session.messages || [];
  req.session.messages = [];
  res.render("log-in", { errors: messages });
}

//log in logic - verify user with local strategy
// set up a strategy to authenticate user: username + password
// the done callback had been define in passport implementation to pass the checking results back to passport
async function verifyUser(username, password, done) {
  try {
    // find the user with the exact same unique username
    const user = await db.findUserByUsername(username);

    //1st case scenario: no users found
    if (!user) {
      return done(null, false, { message: "User does not exist" });
    }

    //2nd case scenario: wrong password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // passwords do not match!
      return done(null, false, { message: "Incorrect password" });
    }
    //3rd case scenario: success
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}

const strategy = new LocalStrategy(verifyUser);

passport.use(strategy);

//when a user successfully log in, a session is created
//this function receive the user object and store its id in the session data
passport.serializeUser((user, done) => {
  done(null, user.id);
});

//on the other hand, this function will retrieve the id we store in the session data
// and then query the database using that specific user id to get the corresponding user object
// and then attach it to req.user so we can access the user object via req.user

// which means we will have to attach the associated info to user returned from the findUserById function
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.findUserById(id);

    done(null, user);
  } catch (err) {
    done(err);
  }
});

const userLogInPost = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/log-in",
  failureMessage: true,
});

async function userLogoutGet(req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

async function newFolderGet(req, res) {
  if (req.user) {
    if (req.params.folderId) {
      const folderId = req.params.folderId;
      res.render("new-folder", { folderId: folderId });
    } else {
      res.render("new-folder");
    }
  } else {
    res.render("index");
  }
}

async function newFolderPost(req, res) {
  const userId = req.user.id;
  const folderName = req.body.folderName;
  const parentId = req.params.folderId || req.user.folders[0].id;
  await db.addNewFolder(userId, folderName, parentId);
  if (parentId != req.user.folders[0].id) {
    res.redirect(`/folder/${parentId}`);
  }
  res.redirect("/");
}

async function deleteFolderPost(req, res) {
  const folderId = req.params.folderId;
  const folder = await db.findFolderByFolderId(folderId);
  const parentId = folder.parentId || req.user.folders[0].id;
  await db.deleteFolder(folderId);
  if (parentId != req.user.folders[0].id) {
    res.redirect(`/folder/${parentId}`);
  }
  res.redirect("/");
}

async function showFolderGet(req, res) {
  const user = req.user;
  const folderId = req.params.folderId;
  const folder = await db.findFolderByFolderId(folderId);
  res.render("folder", {
    user: user,
    folder: folder,
  });
}

//set up Cloudinary for cloud upload
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const validateUploadedFile = [
  body("upload")
    .custom((value, { req }) => req.file)
    .withMessage("Upload file missing")
    .custom((value, { req }) => {
      if (!req.file) {
        return true;
      }
      return req.file.size <= 5 * 1024 * 1024;
    })
    .withMessage("File should not exceed 5MB"),
];

const uploadFilePost = [
  validateUploadedFile,
  async (req, res) => {
    const parentId = req.params.folderId || req.user.folders[0].id;
    const user = req.user;
    const errors = validationResult(req);
    if (!errors.isEmpty() && parentId !== req.user.folders[0].id) {
      const folder = await db.findFolderByFolderId(parentId);
      return res.status(400).render("folder", {
        user: user,
        folder: folder,
        errors: errors.array(),
      });
    } else if (!errors.isEmpty() && parentId == req.user.folders[0].id) {
      return res.status(400).render("index", {
        user: req.user,
        errors: errors.array(),
      });
    }
    const file = req.file;
    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          { folder: "my_uploads", resource_type: "auto", use_filename: true },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          },
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };
    const result = await streamUpload(req.file.buffer);
    const fileUrl = result.secure_url;
    const publicId = result.public_id;

    await db.addNewFile(parentId, file, fileUrl, publicId);

    //redirect after successful upload
    if (parentId !== req.user.folders[0].id) {
      res.redirect(`/folder/${parentId}`);
    } else {
      res.redirect("/");
    }
  },
];

async function readFileInfoGet(req, res) {
  const fileId = req.params.fileId;
  const file = await db.findFileByFileId(fileId);

  res.render("file-info", { user: req.user, file: file });
}

async function deleteFilePost(req, res) {
  const fileId = req.params.fileId;
  const file = await db.findFileByFileId(fileId);
  const parentId = file.parentId;
  const publicId = file.publicId;

  await cloudinary.uploader.destroy(publicId);
  await db.deleteFileById(fileId);
  if (parentId !== req.user.folders[0].id) {
    res.redirect(`/folder/${parentId}`);
  } else {
    res.redirect("/");
  }
}

async function downloadFileGet(req, res) {
  const fileId = req.params.fileId;
  const file = await db.findFileByFileId(fileId);
  const publicId = file.publicId;

  const downloadUrl = cloudinary.url(publicId, {
    flags: `attachment`,
    secure: true,
  });

  res.redirect(downloadUrl);
}

async function shareFolderPost(req, res) {
  const folderId = req.params.folderId || req.user.folders[0].id;
  const folder = await db.findFolderByFolderId(folderId);
  const token = crypto.randomBytes(32).toString("hex");
  const durationMins = parseInt(req.body.duration);
  const durationMs = durationMins * 60 * 1000;
  const expiresAt = new Date(Date.now() + durationMs);

  const sharedFolder = await db.createSharedFolder(token, folderId, expiresAt);
  const sharedLink = `${req.protocol}://${req.get("host")}/shared/${token}`;

  if (folderId !== req.user.folders[0].id) {
    return res.status(201).render("folder", {
      user: req.user,
      folder: folder,
      sharedLink: sharedLink,
      expiresAt: expiresAt,
    });
  } else {
    return res.status(201).render("index", {
      user: req.user,
      sharedLink: sharedLink,
      expiresAt: expiresAt,
    });
  }
}

async function getSharedFolderGet(req, res) {
  const token = req.params.token;
  const sharedFolder = await db.getSharedFolderGet(token);
  return res.render("shared", { folder: sharedFolder.folder });
}

module.exports = {
  showIndexGet,
  userSignUpGet,
  userSignUpPost,
  userLogInGet,
  userLogInPost,
  userLogoutGet,
  newFolderGet,
  newFolderPost,
  deleteFolderPost,
  showFolderGet,
  uploadFilePost,
  readFileInfoGet,
  deleteFilePost,
  downloadFileGet,
  shareFolderPost,
  getSharedFolderGet,
};
