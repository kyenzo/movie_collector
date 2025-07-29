const express = require('express');
const router = express.Router();
const { register, login, checkUsername, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/check-username/:username', checkUsername);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

module.exports = router;