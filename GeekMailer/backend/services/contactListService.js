const ContactList = require('../models/ContactList');
const Contact = require('../models/Contact');  // Import the Contact model

module.exports = {
  // Create a new contact list
  async createContactList(listName, adminId) {
    if (!adminId) {
      throw new Error('Admin ID is required');
    }
    const contactList = new ContactList({
      listName,
      contacts: [],  // Start with an empty list of contacts (referenced by ObjectId)
      createdBy: adminId,
    });
    await contactList.save();
    return contactList;
  },

  // Create a contact independently (not in a list initially)
  async createContact(contactDetails,adminId) {
    const existingContact = await Contact.findOne({
      $or: [{ username: contactDetails.username }, { email: contactDetails.email }],
    });
    if (existingContact) {
      throw new Error('A contact with this username or email already exists.');
    }

    const contact = new Contact({
      username: contactDetails.username,
      email: contactDetails.email,
      name: contactDetails.name,
      createdBy: adminId,
    });
    await contact.save();
    return contact;
  },

  // Edit an existing contact list name
  async editContactList(listId, listName, adminId) {
    const contactList = await ContactList.findOne({ _id: listId, createdBy: adminId });
    if (!contactList) {
      throw new Error('Contact list not found or unauthorized access.');
    }
    contactList.listName = listName;
    await contactList.save();
    return contactList;
  },

  // View a contact list and its contacts (populate the references)
  async viewContactList(listId, adminId) {
    const contactList = await ContactList.findOne({ _id: listId, createdBy: adminId }).populate('contacts');
    if (!contactList) {
      throw new Error('Contact list not found or unauthorized access.');
    }
    return contactList;
  },

  // Add an existing contact to a contact list
  async addContactToList(listId, contactId, adminId) {
    const contactList = await ContactList.findOne({ _id: listId, createdBy: adminId });
    if (!contactList) {
      throw new Error('Contact list not found or unauthorized access.');
    }

    // Check if the contact already exists in the list
    if (contactList.contacts.includes(contactId)) {
      throw new Error('Contact is already in the list.');
    }

    contactList.contacts.push(contactId);
    await contactList.save();
    return contactList;
  },

  // Edit an existing contact in a contact list
  async editContact(listId, username, updatedContact, adminId) {
    const contactList = await ContactList.findOne({ _id: listId, createdBy: adminId });
    if (!contactList) {
      throw new Error('Contact list not found or unauthorized access.');
    }

    const contact = await Contact.findOne({ username });
    if (!contact) {
      throw new Error('Contact not found.');
    }

    // Update contact details
    contact.name = updatedContact.name || contact.name;
    contact.email = updatedContact.email || contact.email;
    await contact.save();

    return contactList;
  },

  // Delete a contact from a contact list
  async deleteContact(listId, contactId, adminId) {
    const contactList = await ContactList.findOne({ _id: listId, createdBy: adminId });
    if (!contactList) {
      throw new Error('Contact list not found or unauthorized access.');
    }

    // Remove the contact from the contact list's contacts array
    contactList.contacts = contactList.contacts.filter(contactRefId => !contactRefId.equals(contactId));
    await contactList.save();

    return contactList;
  },
  
  // Get all contacts across all lists for a specific admin (populate references)
  async getAllContacts(adminId) {
    const contacts = await Contact.find({ createdBy: adminId });
    return contacts; 
  },
  async getAllContactsCount(adminId) {
    const contacts = await Contact.find({ createdBy: adminId });
    return contacts.length; 
  },
  // Get all contact lists with their names and lengths
  async getAllContactLists(adminId) {
    const contactLists = await ContactList.find({createdBy: adminId}, { listName: 1, contacts: 1, createdAt: 1, updatedAt: 1 });
    return contactLists.map(list => ({
      _id: list._id,
      listName: list.listName,
      numberOfContacts: list.contacts.length,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    }));
  },
  async getContactListsCount(adminId) {
    const contactLists = await ContactList.find({createdBy: adminId}, { listName: 1, contacts: 1 });
    return contactLists.length;
  }
};
