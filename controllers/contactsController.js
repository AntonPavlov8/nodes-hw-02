const Contacts = require("../models/Schema.js");
async function updateStatusContact(id, owner, body) {
  const update = await Contacts.findOneAndUpdate(
    {
      _id: id,
      owner: owner,
    },
    { $set: body },
    { new: true }
  );
  return update;
}
const contactsController = {
  async getContacts(req, res) {
    try {
      const data = await Contacts.find({ owner: req.user._id }).select(
        "-__v -owner"
      );
      res.json(data);
    } catch (err) {
      console.log(err);
      res.status(404).json(err);
    }
  },
  async getSingleContact(req, res) {
    const contactId = req.params.id;
    try {
      const data = await Contacts.findOne({
        _id: contactId,
        owner: req.user._id,
      }).select("-__v -owner");
      if (!data) throw Error(data);
      res.status(200).json(data);
    } catch (err) {
      console.log(err);
      res.status(404).json({ message: "Not found" });
    }
  },
  async addContact(req, res) {
    try {
      const newContact = await Contacts.create({
        owner: req.user._id,
        ...req.body,
      });
      res.status(201).json(newContact);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "unexpected error occured" });
    }
  },
  async deleteContact(req, res) {
    try {
      const id = req.params.id;
      const result = await Contacts.findOneAndDelete({
        _id: id,
        owner: req.user._id,
      });
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
      const result = await updateStatusContact(
        id,
        (owner = req.user._id),
        body
      );
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
      const result = await updateStatusContact(
        id,
        (owner = req.user._id),
        body
      );
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
