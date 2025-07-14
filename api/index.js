// Ultra-simple serverless function for debugging
export default function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }

    // Basic routing
    const { url, method } = req

    if (url === '/' && method === 'GET') {
      return res.status(200).json({
        message: 'Client Onboarding Dashboard API',
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        vercel: true
      })
    }

    if (url === '/health' && method === 'GET') {
      return res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      })
    }

    if (url === '/test' && method === 'GET') {
      return res.status(200).json({
        message: 'Test endpoint working',
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Not set',
          DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
          JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set'
        }
      })
    }

    // 404 for unknown routes
    return res.status(404).json({
      error: 'Route not found',
      url,
      method
    })

  } catch (error) {
    console.error('Function error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}