// Get all platform types
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

    // Import Supabase dynamically
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Get all platform types
    const { data: platformTypes, error } = await supabase
      .from('platform_types')
      .select('*')
      .order('category, display_name')

    if (error) {
      return res.status(500).json({ 
        error: 'Failed to fetch platform types', 
        details: error.message 
      })
    }

    // Group by category
    const categorized = platformTypes.reduce((acc, platform) => {
      const category = platform.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push({
        id: platform.id,
        name: platform.name,
        displayName: platform.display_name,
        description: platform.description,
        setupSteps: platform.setup_steps || [],
        validationCriteria: platform.validation_criteria || {}
      })
      return acc
    }, {})

    return res.status(200).json({ 
      platformTypes: categorized 
    })

  } catch (error) {
    console.error('Platform types error:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch platform types', 
      details: error.message 
    })
  }
}