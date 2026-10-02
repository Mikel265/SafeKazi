const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { get, run } = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, error: 'All fields (name, email, phone, password) are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${uuidv4()}`;

    await run(
      `INSERT INTO users (id, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)`,
      [userId, name.trim(), email.toLowerCase().trim(), phone.trim(), passwordHash]
    );

    const token = jwt.sign({ id: userId, email: email.toLowerCase().trim(), name: name.trim() }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim()
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Server error during registration. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Server error during login.' });
  }
});

// GET /api/auth/me (Get current authenticated user info)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await get('SELECT id, name, email, phone, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error fetching user profile.' });
  }
});

module.exports = router;
