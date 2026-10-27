require("dotenv/config");

const express = require("express");
const app = express();
const path = require("node:path");

const session = require("express-session");
const passport = require("passport");

const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const prisma = require("./lib/prisma.js");

const appRouter = require("./routes/appRouter");

//configure session for passport using prisma to store session data
app.use(
  session({
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 7 * 24 * 60 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
    // Insert express-session options here
  }),
);
app.use(passport.session());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extend: true }));

app.use("/", appRouter);

//use port 3000 to listen to incoming requests
const PORT = 3000;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`File Uploader App is listening on port ${PORT}!`);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).send(err.message);
});
