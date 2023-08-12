const router = require("express").Router();
const {
  getContacts,
  getSingleContact,
  addContact,
  deleteContact,
  favoriteContactToggle,
  contactUpdate,
} = require("../../controllers/index");

router.route("/").get(getContacts).post(addContact);
router
  .route("/:id")
  .get(getSingleContact)
  .put(contactUpdate)
  .delete(deleteContact);
router.route("/:id/favorite").patch(favoriteContactToggle);

module.exports = router;
