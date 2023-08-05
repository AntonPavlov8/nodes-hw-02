const fs = require("fs/promises");

const contactsPath = __dirname + "/contacts.json";
function readContacts() {
  return fs.readFile(contactsPath).then((data) => {
    return JSON.parse(data);
  });
}

const listContacts = async () => {
  const allContacts = await readContacts();
  return allContacts;
};

const getContactById = async (contactId) => {
  const allContacts = await readContacts();
  const searchingContact = allContacts.find(
    (contact) => contact.id === contactId
  );
  return searchingContact ? searchingContact : null;
};

const removeContact = async (contactId) => {
  const allContacts = await readContacts();
  const searchingContact = allContacts.find(
    (contact) => contact.id === contactId
  );
  if (searchingContact) {
    const newData = allContacts.filter((contact) => contact.id !== contactId);
    fs.writeFile(contactsPath, JSON.stringify(newData));
    return true;
  } else return false;
};

const addContact = async (body) => {
  console.log(body);
  const allContacts = await readContacts();
  const newContact = body;
  allContacts.push(newContact);
  fs.writeFile(contactsPath, JSON.stringify(allContacts, null, 2));
  return true;
};

const updateContact = async (contactId, body) => {
  const allContacts = await readContacts();
  const index = allContacts.findIndex((contact) => contact.id === contactId);
  if (index !== -1) {
    const updatingContact = allContacts.find(
      (contact) => contact.id === contactId
    );

    const updatedContact = { ...updatingContact, ...body };
    allContacts[index] = updatedContact;
    fs.writeFile(contactsPath, JSON.stringify(allContacts));
    return true;
  } else return false;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
