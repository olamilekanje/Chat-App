const express = require('express');
const { register, login, activate,  getUserStatus, logout, getAllUsers, getUserDetails } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.get('/activate/:activationToken', activate);
router.post('/login', login);
router.post('/logout', logout);
router.get('/user-status/:userId', getUserStatus);
router.get('/user-details/:userId', getUserDetails);
router.get('/all-users', getAllUsers);


module.exports = router;
