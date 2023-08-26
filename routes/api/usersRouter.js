const router = require("express").Router();
const {
  signupUser,
  loginUser,
  logoutUser,
  currentUser,
  updateAvatar,
} = require("../../controllers/usersController");
const auth = require("../../utils/auth");

router.route("/signup").post(signupUser);
router.route("/login").post(loginUser);
router.route("/logout").get(auth, logoutUser);
router.route("/current").get(auth, currentUser);
router.route("/avatars").patch(auth, updateAvatar);

module.exports = router;
