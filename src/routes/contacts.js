const { Router } = require('express');
const router = Router();
const { isAuthenticated } = require('../config/auth');

const { renderContactForm, createNewContact, renderContacts, renderEditForm, updateContact, deleteContact } = require('../controllers/contactsController');

router.get('/contacts', isAuthenticated, renderContacts);

router.get('/contacts/add', isAuthenticated, renderContactForm);

router.post('/contacts/add', isAuthenticated, createNewContact);

router.get('/contacts/edit/:id', isAuthenticated, renderEditForm);

router.post('/contacts/edit', isAuthenticated, updateContact);

router.get('/contacts/delete/:id', isAuthenticated, deleteContact);

module.exports = router;