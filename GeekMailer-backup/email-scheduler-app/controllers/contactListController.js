const contactListService = require('../services/contactListService');

module.exports = {
  // Create a new contact list
  async createContactList(req, res) {
    try {
      const { listName } = req.body;
      const { adminId } = req.query; // Extract adminId from query
      const contactList = await contactListService.createContactList(listName, adminId);
      res.status(201).json(contactList);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Edit an existing contact list name
  async editContactList(req, res) {
    try {
      const { listId } = req.query; // Extract listId from query
      const { listName } = req.body;
      const { adminId } = req.query; // Extract adminId from query
      const updatedContactList = await contactListService.editContactList(listId, listName, adminId);
      res.status(200).json(updatedContactList);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // View a contact list and its contacts
  async viewContactList(req, res) {
    try {
      const { listId } = req.query; // Extract listId from query
      const { adminId } = req.query; // Extract adminId from query
      const contactList = await contactListService.viewContactList(listId, adminId);
      res.status(200).json(contactList);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all contact lists (names and lengths only)
  async getAllContactLists(req, res) {
    try {
      const { adminId } = req.query; // Extract adminId from query
      const contactLists = await contactListService.getAllContactLists(adminId);
      res.status(200).json(contactLists);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Create a contact independently (without being added to a list immediately)
  async createContact(req, res) {
    try {
      const { adminId } = req.query;
      const contact = req.body; // Expecting { name, username, email }
      const newContact = await contactListService.createContact(contact,adminId);
      res.status(201).json(newContact);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Add a contact to a contact list
  async addContactToList(req, res) {
    try {
      const { listId, contactId } = req.query; // Extract listId and contactId from query
      const { adminId } = req.query; // Extract adminId from query
      const updatedContactList = await contactListService.addContactToList(listId, contactId, adminId);
      res.status(200).json(updatedContactList);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Edit an existing contact in a contact list
  async editContact(req, res) {
    try {
      const { listId, username } = req.query; // Extract listId and username from query
      const { adminId } = req.query; // Extract adminId from query
      const updatedContact = req.body; // Expecting { name, email }
      const updatedContactList = await contactListService.editContact(listId, username, updatedContact, adminId);
      res.status(200).json(updatedContactList);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete a contact from a contact list
  async deleteContact(req, res) {
    try {
      const { listId, username } = req.query; // Extract listId and username from query
      const { adminId } = req.query; // Extract adminId from query
      const updatedContactList = await contactListService.deleteContact(listId, username, adminId);
      res.status(200).json(updatedContactList);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all contacts across all lists for the authenticated admin
  async getAllContacts(req, res) {
    try {
      const { adminId } = req.query; // Extract adminId from query
      const contacts = await contactListService.getAllContacts(adminId);
      res.status(200).json(contacts);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};
