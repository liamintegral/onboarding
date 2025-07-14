const jwt = require('jsonwebtoken');
const database = require('../database/supabase');

// Middleware to authenticate client requests
const authenticateClient = async (req, res, next) => {
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

    // Add client info to request
    req.client = {
      id: client.id,
      companyName: client.company_name,
      contactName: client.contact_name,
      email: client.email
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: { message: 'Invalid token' } });
  }
};

// Middleware to authenticate admin requests
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: { message: 'No token provided' } });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: { message: 'Admin access required' } });
    }

    // Get admin details
    const admin = await database.get('SELECT * FROM admin_users WHERE id = ?', [decoded.adminId]);
    if (!admin) {
      return res.status(404).json({ error: { message: 'Admin not found' } });
    }

    // Add admin info to request
    req.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    };

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(401).json({ error: { message: 'Invalid admin token' } });
  }
};

// Middleware to log activities
const logActivity = (action, resourceType = null) => {
  return async (req, res, next) => {
    try {
      const clientId = req.client?.id || null;
      const adminId = req.admin?.id || null;
      const resourceId = req.params.id || null;
      
      await database.run(
        `INSERT INTO activity_logs (client_id, admin_id, action, resource_type, resource_id, details, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clientId,
          adminId,
          action,
          resourceType,
          resourceId,
          JSON.stringify({ method: req.method, url: req.url, body: req.body }),
          req.ip,
          req.get('User-Agent')
        ]
      );
    } catch (error) {
      console.error('Activity logging error:', error);
      // Don't fail the request if logging fails
    }
    
    next();
  };
};

module.exports = {
  authenticateClient,
  authenticateAdmin,
  logActivity
};