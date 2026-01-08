const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/authMiddleware');
const contactListController = require('../controllers/contactListController');

/**
 * Route to create a new contact list.
 * - HTTP Method: POST
 * - URL: /create
 * - Request Body: { name: string }
 * - Query Parameters: ?adminId=string
 * - Description: Creates a new contact list with the given name for the specified admin.
 * - Middleware: isAuthenticated
 */
router
  .route('/create')
  .post(isAuthenticated, contactListController.createContactList);

/**
 * Route to edit the name of an existing contact list.
 * - HTTP Method: PUT
 * - URL: /edit
 * - Request Body: { newName: string }
 * - Query Parameters: ?listId=string&adminId=string
 * - Description: Updates the name of the contact list identified by `listId` for the given admin.
 * - Middleware: isAuthenticated
 */
router
  .route('/edit')
  .put(isAuthenticated, contactListController.editContactList);

/**
 * Route to view a specific contact list and its associated contacts.
 * - HTTP Method: GET
 * - URL: /view
 * - Query Parameters: ?listId=string&adminId=string
 * - Description: Retrieves the details of the contact list and all its associated contacts.
 * - Middleware: isAuthenticated
 */
router
  .route('/view')
  .get(isAuthenticated, contactListController.viewContactList);

/**
 * Route to fetch all contact lists for the authenticated admin.
 * - HTTP Method: GET
 * - URL: /all
 * - Query Parameters: ?adminId=string
 * - Description: Retrieves all contact lists with their names and the number of contacts in each list.
 * - Middleware: isAuthenticated
 */
router
  .route('/all')
  .get(isAuthenticated, contactListController.getAllContactLists);

/**
 * Route to create a contact independently (without adding it to any list).
 * - HTTP Method: POST
 * - URL: /contacts
 * - Request Body: { name: string, username: string, email: string }
 * - Description: Creates a new contact with the provided details.
 * - Middleware: isAuthenticated
 *
 * Route to fetch all contacts across all lists for the authenticated admin.
 * - HTTP Method: GET
 * - URL: /contacts
 * - Query Parameters: ?adminId=string
 * - Description: Retrieves all contacts belonging to any contact list of the specified admin.
 * - Middleware: isAuthenticated
 */
router
  .route('/contacts')
  .post(isAuthenticated, contactListController.createContact)
  .get(isAuthenticated, contactListController.getAllContacts);

/**
 * Route to add an existing contact to a specific contact list.
 * - HTTP Method: PUT
 * - URL: /contacts/add-to-list
 * - Query Parameters: ?listId=string&contactId=string&adminId=string
 * - Description: Adds the contact identified by `contactId` to the contact list identified by `listId`.
 * - Middleware: isAuthenticated
 */
router
  .route('/contacts/add-to-list')
  .put(isAuthenticated, contactListController.addContactToList);

/**
 * Route to edit an existing contact in a specific contact list.
 * - HTTP Method: PUT
 * - URL: /contacts/edit-contact
 * - Request Body: { updatedDetails: object }
 * - Query Parameters: ?listId=string&username=string&adminId=string
 * - Description: Updates the details of the contact identified by `username` in the specified contact list.
 * - Middleware: isAuthenticated
 */
router
  .route('/contacts/edit-contact')
  .put(isAuthenticated, contactListController.editContact);

/**
 * Route to delete a contact from a specific contact list.
 * - HTTP Method: DELETE
 * - URL: /contacts/delete-contact
 * - Query Parameters: ?listId=string&username=string&adminId=string
 * - Description: Removes the contact identified by `username` from the contact list identified by `listId`.
 * - Middleware: isAuthenticated
 */
router
  .route('/contacts/delete-contact')
  .delete(isAuthenticated, contactListController.deleteContact);

module.exports = router;
