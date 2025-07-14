const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../database/supabase');
const { authenticateClient, logActivity } = require('../middleware/auth');
const router = express.Router();

// Get client profile
router.get('/profile', authenticateClient, async (req, res) => {
  try {
    const client = await database.get(
      'SELECT * FROM clients WHERE id = ?',
      [req.client.id]
    );

    if (!client) {
      return res.status(404).json({ error: { message: 'Client not found' } });
    }

    res.json({
      client: {
        id: client.id,
        companyName: client.company_name,
        contactName: client.contact_name,
        email: client.email,
        phone: client.phone,
        website: client.website,
        industry: client.industry,
        goals: client.goals,
        createdAt: client.created_at,
        updatedAt: client.updated_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: { message: 'Failed to get profile' } });
  }
});

// Update client profile
router.put('/profile', [
  authenticateClient,
  body('companyName').optional().trim().isLength({ min: 2 }).withMessage('Company name must be at least 2 characters'),
  body('contactName').optional().trim().isLength({ min: 2 }).withMessage('Contact name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('website').optional().isURL().withMessage('Valid website URL required'),
  logActivity('update_profile', 'client')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', details: errors.array() } });
    }

    const { companyName, contactName, email, phone, website, industry, goals } = req.body;
    const updates = [];
    const values = [];

    if (companyName !== undefined) {
      updates.push('company_name = ?');
      values.push(companyName);
    }
    if (contactName !== undefined) {
      updates.push('contact_name = ?');
      values.push(contactName);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (website !== undefined) {
      updates.push('website = ?');
      values.push(website);
    }
    if (industry !== undefined) {
      updates.push('industry = ?');
      values.push(industry);
    }
    if (goals !== undefined) {
      updates.push('goals = ?');
      values.push(goals);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: { message: 'No fields to update' } });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.client.id);

    await database.run(
      `UPDATE clients SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated client
    const updatedClient = await database.get(
      'SELECT * FROM clients WHERE id = ?',
      [req.client.id]
    );

    res.json({
      message: 'Profile updated successfully',
      client: {
        id: updatedClient.id,
        companyName: updatedClient.company_name,
        contactName: updatedClient.contact_name,
        email: updatedClient.email,
        phone: updatedClient.phone,
        website: updatedClient.website,
        industry: updatedClient.industry,
        goals: updatedClient.goals,
        updatedAt: updatedClient.updated_at
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: { message: 'Failed to update profile' } });
  }
});

// Get client onboarding progress
router.get('/progress', authenticateClient, async (req, res) => {
  try {
    // Get platform connections with platform details
    const connections = await database.all(`
      SELECT 
        pc.*,
        pt.name as platform_name,
        pt.display_name as platform_display_name,
        pt.description as platform_description,
        pt.category as platform_category
      FROM platform_connections pc
      JOIN platform_types pt ON pc.platform_type_id = pt.id
      WHERE pc.client_id = ?
      ORDER BY pt.category, pt.display_name
    `, [req.client.id]);

    // Calculate overall progress
    const totalPlatforms = connections.length;
    const completedPlatforms = connections.filter(c => c.status === 'completed').length;
    const overallProgress = totalPlatforms > 0 ? Math.round((completedPlatforms / totalPlatforms) * 100) : 0;

    // Group by category
    const categorizedConnections = connections.reduce((acc, connection) => {
      const category = connection.platform_category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: connection.id,
        platformName: connection.platform_name,
        platformDisplayName: connection.platform_display_name,
        platformDescription: connection.platform_description,
        status: connection.status,
        progressPercentage: connection.progress_percentage,
        accessGranted: connection.access_granted,
        credentialsProvided: connection.credentials_provided,
        validationStatus: connection.validation_status,
        notes: connection.notes,
        errorMessage: connection.error_message,
        lastUpdated: connection.last_updated,
        completedAt: connection.completed_at
      });
      return acc;
    }, {});

    res.json({
      overallProgress,
      totalPlatforms,
      completedPlatforms,
      connections: categorizedConnections
    });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: { message: 'Failed to get progress' } });
  }
});

// Get client activity log
router.get('/activity', authenticateClient, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const activities = await database.all(`
      SELECT *
      FROM activity_logs
      WHERE client_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [req.client.id, limit, offset]);

    const totalCount = await database.get(
      'SELECT COUNT(*) as count FROM activity_logs WHERE client_id = ?',
      [req.client.id]
    );

    res.json({
      activities: activities.map(activity => ({
        id: activity.id,
        action: activity.action,
        resourceType: activity.resource_type,
        resourceId: activity.resource_id,
        details: activity.details ? JSON.parse(activity.details) : null,
        createdAt: activity.created_at
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount.count / limit),
        totalCount: totalCount.count,
        hasNext: page * limit < totalCount.count,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: { message: 'Failed to get activity log' } });
  }
});

module.exports = router;