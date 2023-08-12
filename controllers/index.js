const Contacts = require("../models/Schema.js");
async function updateStatusContact(id, body) {
  const update = await Contacts.findOneAndUpdate(
    {
      _id: id,
    },
    { $set: body },
    { new: true }
  );
  return update;
}
const contactsController = {
  async getContacts(req, res) {
    try {
      const data = await Contacts.find().select("-__v");
      res.json(data);
    } catch (err) {
      console.log(err);
      res.status(404).json(err);
    }
  },
  async getSingleContact(req, res) {
    const contactId = req.params.id;
    try {
      const data = await Contacts.findOne({ _id: contactId });
      res.status(200).json(data);
    } catch (err) {
      console.log(err);
      res.status(404).json({ message: "Not found" });
    }
  },
  async addContact(req, res) {
    try {
      const newContact = await Contacts.create(req.body);
      res.status(201).json(newContact);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "unexpected error occured" });
    }
  },
  async deleteContact(req, res) {
    try {
      const id = req.params.id;
      const result = await Contacts.findOneAndDelete({ _id: id });
      if (result) {
        res.status(200).json({ message: "Employee was deleted" });
      } else throw new Error(result);
    } catch (err) {
      console.log(err);
      res.status(404).json({ message: "Not found" });
    }
  },
  async contactUpdate(req, res) {
    try {
      const id = req.params.id;
      const body = req.body;
      if (!body) {
        res.json({ message: "missing updating fields" });
      }
      const result = await updateStatusContact(id, body);
      if (result) {
        res.status(200).json(result);
      } else throw new Error(result);
    } catch (err) {
      console.log(err);
      res.status(404).json({ message: "Not found" });
    }
  },

  async favoriteContactToggle(req, res) {
    try {
      const id = req.params.id;
      const body = req.body;
      if (!body) {
        res.json({ message: "missing field favorite" });
      }
      const result = await updateStatusContact(id, body);
      if (result) {
        res.status(200).json(result);
      } else throw new Error(result);
    } catch (err) {
      console.log(err);
      res.status(404).json({ message: "Not found" });
    }
  },
};

module.exports = contactsController;
