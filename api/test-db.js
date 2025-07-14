// Test database connection
export default async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
    
    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // Import Supabase dynamically to avoid build issues
    const { createClient } = await import('@supabase/supabase-js')
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ 
        error: 'Missing Supabase environment variables',
        SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Missing',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing'
      })
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Test simple query
    const { data, error } = await supabase
      .from('platform_types')
      .select('id, name, display_name')
      .limit(3)

    if (error) {
      return res.status(500).json({ 
        error: 'Database query failed', 
        details: error.message 
      })
    }

    return res.status(200).json({ 
      message: 'Database connection successful',
      platformCount: data?.length || 0,
      samplePlatforms: data || []
    })

  } catch (error) {
    console.error('Database test error:', error)
    return res.status(500).json({ 
      error: 'Database connection failed', 
      details: error.message 
    })
  }
}