const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/multer.js");
const { verify } = require("../middleware/auth");

const {
  registerUser,
  loginUser,
  logout,
  refreshAccToken
} = require("../controllers/user.controller.js");

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxcount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verify, logout);
router.route("/refresh").post(refreshAccToken)

module.exports = router;
