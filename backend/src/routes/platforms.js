const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../database/supabase');
const { authenticateClient, logActivity } = require('../middleware/auth');
const router = express.Router();

// Get all platform types
router.get('/types', async (req, res) => {
  try {
    const platformTypes = await database.all(
      'SELECT * FROM platform_types ORDER BY category, display_name'
    );

    // Group by category
    const categorized = platformTypes.reduce((acc, platform) => {
      const category = platform.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: platform.id,
        name: platform.name,
        displayName: platform.display_name,
        description: platform.description,
        setupSteps: JSON.parse(platform.setup_steps || '[]'),
        validationCriteria: JSON.parse(platform.validation_criteria || '{}')
      });
      return acc;
    }, {});

    res.json({ platformTypes: categorized });
  } catch (error) {
    console.error('Get platform types error:', error);
    res.status(500).json({ error: { message: 'Failed to get platform types' } });
  }
});

// Get client's platform connections
router.get('/connections', authenticateClient, async (req, res) => {
  try {
    const connections = await database.all(`
      SELECT 
        pc.*,
        pt.name as platform_name,
        pt.display_name as platform_display_name,
        pt.description as platform_description,
        pt.category as platform_category,
        pt.setup_steps,
        pt.validation_criteria
      FROM platform_connections pc
      JOIN platform_types pt ON pc.platform_type_id = pt.id
      WHERE pc.client_id = $1
      ORDER BY pt.category, pt.display_name
    `, [req.client.id]);

    // Group by category
    const categorized = connections.reduce((acc, connection) => {
      const category = connection.platform_category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: connection.id,
        platformId: connection.platform_type_id,
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
        completedAt: connection.completed_at,
        setupSteps: JSON.parse(connection.setup_steps || '[]'),
        validationCriteria: JSON.parse(connection.validation_criteria || '{}')
      });
      return acc;
    }, {});

    res.json({ connections: categorized });
  } catch (error) {
    console.error('Get platform connections error:', error);
    res.status(500).json({ error: { message: 'Failed to get platform connections' } });
  }
});

// Update platform connection status
router.put('/connections/:id', [
  authenticateClient,
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'error', 'skipped']),
  body('progressPercentage').optional().isInt({ min: 0, max: 100 }),
  body('accessGranted').optional().isBoolean(),
  body('credentialsProvided').optional().isBoolean(),
  body('validationStatus').optional().isIn(['pending', 'validating', 'valid', 'invalid', 'error']),
  body('notes').optional().trim(),
  body('errorMessage').optional().trim(),
  logActivity('update_platform_connection', 'platform_connection')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { message: 'Validation failed', details: errors.array() } });
    }

    const connectionId = req.params.id;
    const { 
      status, 
      progressPercentage, 
      accessGranted, 
      credentialsProvided, 
      validationStatus, 
      notes, 
      errorMessage 
    } = req.body;

    // Verify connection belongs to client
    const connection = await database.get(
      'SELECT * FROM platform_connections WHERE id = $1 AND client_id = $2',
      [connectionId, req.client.id]
    );

    if (!connection) {
      return res.status(404).json({ error: { message: 'Platform connection not found' } });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (progressPercentage !== undefined) {
      updates.push(`progress_percentage = $${paramCount++}`);
      values.push(progressPercentage);
    }
    if (accessGranted !== undefined) {
      updates.push(`access_granted = $${paramCount++}`);
      values.push(accessGranted);
    }
    if (credentialsProvided !== undefined) {
      updates.push(`credentials_provided = $${paramCount++}`);
      values.push(credentialsProvided);
    }
    if (validationStatus !== undefined) {
      updates.push(`validation_status = $${paramCount++}`);
      values.push(validationStatus);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }
    if (errorMessage !== undefined) {
      updates.push(`error_message = $${paramCount++}`);
      values.push(errorMessage);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: { message: 'No fields to update' } });
    }

    // Add completion timestamp if status is completed
    if (status === 'completed') {
      updates.push(`completed_at = NOW()`);
    }

    updates.push(`last_updated = NOW()`);
    values.push(connectionId, req.client.id);

    await database.run(
      `UPDATE platform_connections SET ${updates.join(', ')} WHERE id = $${paramCount++} AND client_id = $${paramCount++}`,
      values
    );

    // Get updated connection
    const updatedConnection = await database.get(`
      SELECT 
        pc.*,
        pt.name as platform_name,
        pt.display_name as platform_display_name
      FROM platform_connections pc
      JOIN platform_types pt ON pc.platform_type_id = pt.id
      WHERE pc.id = $1 AND pc.client_id = $2
    `, [connectionId, req.client.id]);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`client-${req.client.id}`).emit('platform-status-updated', {
      connectionId,
      platformName: updatedConnection.platform_name,
      status: updatedConnection.status,
      progressPercentage: updatedConnection.progress_percentage,
      lastUpdated: updatedConnection.last_updated
    });

    res.json({
      message: 'Platform connection updated successfully',
      connection: {
        id: updatedConnection.id,
        platformName: updatedConnection.platform_name,
        platformDisplayName: updatedConnection.platform_display_name,
        status: updatedConnection.status,
        progressPercentage: updatedConnection.progress_percentage,
        accessGranted: updatedConnection.access_granted,
        credentialsProvided: updatedConnection.credentials_provided,
        validationStatus: updatedConnection.validation_status,
        notes: updatedConnection.notes,
        errorMessage: updatedConnection.error_message,
        lastUpdated: updatedConnection.last_updated,
        completedAt: updatedConnection.completed_at
      }
    });

  } catch (error) {
    console.error('Update platform connection error:', error);
    res.status(500).json({ error: { message: 'Failed to update platform connection' } });
  }
});

// Start platform setup process
router.post('/connections/:id/start', [
  authenticateClient,
  logActivity('start_platform_setup', 'platform_connection')
], async (req, res) => {
  try {
    const connectionId = req.params.id;

    // Verify connection belongs to client
    const connection = await database.get(
      'SELECT * FROM platform_connections WHERE id = $1 AND client_id = $2',
      [connectionId, req.client.id]
    );

    if (!connection) {
      return res.status(404).json({ error: { message: 'Platform connection not found' } });
    }

    // Update status to in_progress
    await database.run(
      `UPDATE platform_connections 
       SET status = 'in_progress', progress_percentage = 10, last_updated = NOW()
       WHERE id = $1 AND client_id = $2`,
      [connectionId, req.client.id]
    );

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`client-${req.client.id}`).emit('platform-setup-started', {
      connectionId,
      status: 'in_progress',
      progressPercentage: 10
    });

    res.json({
      message: 'Platform setup started successfully',
      connectionId,
      status: 'in_progress',
      progressPercentage: 10
    });

  } catch (error) {
    console.error('Start platform setup error:', error);
    res.status(500).json({ error: { message: 'Failed to start platform setup' } });
  }
});

// Complete platform setup
router.post('/connections/:id/complete', [
  authenticateClient,
  body('notes').optional().trim(),
  logActivity('complete_platform_setup', 'platform_connection')
], async (req, res) => {
  try {
    const connectionId = req.params.id;
    const { notes } = req.body;

    // Verify connection belongs to client
    const connection = await database.get(
      'SELECT * FROM platform_connections WHERE id = $1 AND client_id = $2',
      [connectionId, req.client.id]
    );

    if (!connection) {
      return res.status(404).json({ error: { message: 'Platform connection not found' } });
    }

    // Update status to completed
    await database.run(
      `UPDATE platform_connections 
       SET status = 'completed', 
           progress_percentage = 100, 
           access_granted = true,
           validation_status = 'valid',
           notes = $1,
           completed_at = NOW(),
           last_updated = NOW()
       WHERE id = $2 AND client_id = $3`,
      [notes || null, connectionId, req.client.id]
    );

    // Get platform details for notification
    const updatedConnection = await database.get(`
      SELECT 
        pc.*,
        pt.display_name as platform_display_name
      FROM platform_connections pc
      JOIN platform_types pt ON pc.platform_type_id = pt.id
      WHERE pc.id = $1
    `, [connectionId]);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`client-${req.client.id}`).emit('platform-setup-completed', {
      connectionId,
      platformName: updatedConnection.platform_display_name,
      status: 'completed',
      progressPercentage: 100,
      completedAt: updatedConnection.completed_at
    });

    res.json({
      message: 'Platform setup completed successfully',
      connection: {
        id: connectionId,
        platformName: updatedConnection.platform_display_name,
        status: 'completed',
        progressPercentage: 100,
        completedAt: updatedConnection.completed_at,
        notes
      }
    });

  } catch (error) {
    console.error('Complete platform setup error:', error);
    res.status(500).json({ error: { message: 'Failed to complete platform setup' } });
  }
});

// Validate platform connection
router.post('/connections/:id/validate', [
  authenticateClient,
  logActivity('validate_platform_connection', 'platform_connection')
], async (req, res) => {
  try {
    const connectionId = req.params.id;

    // Verify connection belongs to client
    const connection = await database.get(`
      SELECT 
        pc.*,
        pt.name as platform_name,
        pt.validation_criteria
      FROM platform_connections pc
      JOIN platform_types pt ON pc.platform_type_id = pt.id
      WHERE pc.id = $1 AND pc.client_id = $2
    `, [connectionId, req.client.id]);

    if (!connection) {
      return res.status(404).json({ error: { message: 'Platform connection not found' } });
    }

    // Update validation status to validating
    await database.run(
      `UPDATE platform_connections 
       SET validation_status = 'validating', last_updated = NOW()
       WHERE id = $1`,
      [connectionId]
    );

    // Simulate validation process (in real implementation, this would make API calls to verify access)
    const validationCriteria = JSON.parse(connection.validation_criteria || '{}');
    
    // For now, simulate a successful validation
    setTimeout(async () => {
      try {
        const isValid = Math.random() > 0.2; // 80% success rate for demo
        
        await database.run(
          `UPDATE platform_connections 
           SET validation_status = $1, last_updated = NOW()
           WHERE id = $2`,
          [isValid ? 'valid' : 'invalid', connectionId]
        );

        // Emit real-time update
        const io = req.app.get('io');
        io.to(`client-${req.client.id}`).emit('platform-validation-completed', {
          connectionId,
          platformName: connection.platform_name,
          validationStatus: isValid ? 'valid' : 'invalid',
          message: isValid ? 'Platform access validated successfully' : 'Platform access validation failed'
        });

      } catch (error) {
        console.error('Validation update error:', error);
      }
    }, 3000); // 3 second delay to simulate validation process

    res.json({
      message: 'Platform validation started',
      connectionId,
      validationStatus: 'validating'
    });

  } catch (error) {
    console.error('Validate platform connection error:', error);
    res.status(500).json({ error: { message: 'Failed to validate platform connection' } });
  }
});

module.exports = router;