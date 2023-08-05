const express = require("express");
const crypto = require("crypto");
const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
} = require("../../models/contacts");

const router = express.Router();

router.get("/", async (req, res, next) => {
  const getContacts = await listContacts();
  res.json(getContacts);
});

router.get("/:contactId", async (req, res, next) => {
  const id = req.params.contactId;
  const contactData = await getContactById(id);
  if (contactData) {
    res.json({ contactData });
  } else {
    res.status(404).json({ message: "Not found" });
  }
});

router.post("/", async (req, res, next) => {
  const { name, email, phone } = req.body;
  if (name.length === 0 || email.length === 0 || phone.length === 0)
    res.status(400).json({ message: "missing required name field" });
  else {
    const newContact = {
      id: crypto.randomBytes(16).toString("hex"),
      ...req.body,
    };
    const ifAddedSuccesfully = await addContact(newContact);
    ifAddedSuccesfully
      ? res.status(201).json({ newContact })
      : res.status(500).json({ message: "unexpected error occured" });
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const id = req.params.contactId;
  const ifDeletedSuccesfully = await removeContact(id);
  ifDeletedSuccesfully
    ? res.status(200).json({ message: "contact deleted" })
    : res.status(404).json({ message: "Not found" });
});

router.put("/:contactId", async (req, res, next) => {
  const id = req.params.contactId;
  const body = req.body;
  if (Object.keys(body).length === 0) {
    res.json({ message: "missing fields" });
  } else {
    const ifUpdatedSuccesfully = await updateContact(id, body);
    ifUpdatedSuccesfully
      ? res.status(200).json({ message: "contact updated" })
      : res.status(404).json({ message: "Not found" });
  }
});

module.exports = router;
