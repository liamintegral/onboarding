const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const database = require('../database/supabase');
const router = express.Router();

// Register new client
router.post('/register', [
  body('companyName').trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters'),
  body('contactName').trim().isLength({ min: 2 }).withMessage('Contact name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('website').optional().isURL().withMessage('Valid website URL required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', details: errors.array() } });
    }

    const { companyName, contactName, email, phone, website, industry, goals } = req.body;

    // Check if client already exists
    const existingClient = await database.get('SELECT id FROM clients WHERE email = ?', [email]);
    if (existingClient) {
      return res.status(409).json({ error: { message: 'Client with this email already exists' } });
    }

    // Create new client
    const result = await database.run(
      `INSERT INTO clients (company_name, contact_name, email, phone, website, industry, goals)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [companyName, contactName, email, phone, website, industry, goals]
    );

    const clientId = result.id;

    // Create platform connections for the new client
    const platformTypes = await database.all('SELECT id FROM platform_types');
    for (const platform of platformTypes) {
      await database.run(
        `INSERT INTO platform_connections (client_id, platform_type_id, status, progress_percentage)
         VALUES (?, ?, 'pending', 0)`,
        [clientId, platform.id]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { clientId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Store session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await database.run(
      `INSERT INTO user_sessions (client_id, session_token, expires_at)
       VALUES (?, ?, ?)`,
      [clientId, token, expiresAt.toISOString()]
    );

    // Log activity
    await database.run(
      `INSERT INTO activity_logs (client_id, action, resource_type, details, ip_address)
       VALUES (?, 'register', 'client', ?, ?)`,
      [clientId, JSON.stringify({ company_name: companyName }), req.ip]
    );

    res.status(201).json({
      message: 'Client registered successfully',
      client: {
        id: clientId,
        companyName,
        contactName,
        email
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: { message: 'Registration failed' } });
  }
});

// Login existing client
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', details: errors.array() } });
    }

    const { email } = req.body;

    // Find client
    const client = await database.get('SELECT * FROM clients WHERE email = ?', [email]);
    if (!client) {
      return res.status(404).json({ error: { message: 'Client not found' } });
    }

    // Generate new JWT token
    const token = jwt.sign(
      { clientId: client.id, email: client.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Update or create session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await database.run(
      `INSERT OR REPLACE INTO user_sessions (client_id, session_token, expires_at)
       VALUES (?, ?, ?)`,
      [client.id, token, expiresAt.toISOString()]
    );

    // Log activity
    await database.run(
      `INSERT INTO activity_logs (client_id, action, resource_type, ip_address)
       VALUES (?, 'login', 'client', ?)`,
      [client.id, req.ip]
    );

    res.json({
      message: 'Login successful',
      client: {
        id: client.id,
        companyName: client.company_name,
        contactName: client.contact_name,
        email: client.email
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: 'Login failed' } });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: { message: 'No token provided' } });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if session exists and is valid
    const session = await database.get(
      'SELECT * FROM user_sessions WHERE session_token = ? AND expires_at > ?',
      [token, new Date().toISOString()]
    );

    if (!session) {
      return res.status(401).json({ error: { message: 'Invalid or expired session' } });
    }

    // Get client details
    const client = await database.get('SELECT * FROM clients WHERE id = ?', [decoded.clientId]);
    if (!client) {
      return res.status(404).json({ error: { message: 'Client not found' } });
    }

    res.json({
      valid: true,
      client: {
        id: client.id,
        companyName: client.company_name,
        contactName: client.contact_name,
        email: client.email
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: { message: 'Invalid token' } });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      // Remove session
      await database.run('DELETE FROM user_sessions WHERE session_token = ?', [token]);
      
      // Log activity
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      await database.run(
        `INSERT INTO activity_logs (client_id, action, resource_type, ip_address)
         VALUES (?, 'logout', 'client', ?)`,
        [decoded.clientId, req.ip]
      );
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.json({ message: 'Logged out successfully' }); // Always return success for logout
  }
});

module.exports = router;