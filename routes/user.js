const express = require("express");
const app = express();
const router = express.Router({ mergeParams: true });
const path = require("path");
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

router
.route("/signup")
.get(userController.renderSignupForm)
.post(
    wrapAsync(userController.signup)
);

router
.route("/login")
.get(userController.renderLoginForm)
.post(
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: '/login',
        failureFlash: true
    }),
    userController.login
);

// Logout Route
router.get("/logout", userController.logout);

module.exports = router;
