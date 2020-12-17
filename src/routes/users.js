const { Router } = require('express');
const router = Router();

const { renderSignInForm, renderSignUpForm, signin, signup, logout } = require('../controllers/usersController');

router.get('/signup', renderSignUpForm);

router.post('/signup', signup);

router.get('/signin', renderSignInForm);

router.post('/signin', signin);

router.get('/logout', logout);

module.exports = router;