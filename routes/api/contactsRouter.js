const router = require("express").Router();
const {
  getContacts,
  getSingleContact,
  addContact,
  deleteContact,
  favoriteContactToggle,
  contactUpdate,
} = require("../../controllers/contactsController");
const auth = require("../../utils/auth");

router.route("/").get(auth, getContacts).post(auth, addContact);
router
  .route("/:id")
  .get(auth, getSingleContact)
  .put(auth, contactUpdate)
  .delete(auth, deleteContact);
router.route("/:id/favorite").patch(auth, favoriteContactToggle);

module.exports = router;
