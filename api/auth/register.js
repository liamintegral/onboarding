// Client registration endpoint
export default async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { companyName, contactName, email, phone, website, industry, goals } = req.body

    // Basic validation
    if (!companyName || !contactName || !email) {
      return res.status(400).json({ 
        error: { 
          message: 'Missing required fields: companyName, contactName, email' 
        } 
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: { message: 'Invalid email format' } 
      })
    }

    // Import dependencies dynamically
    const { createClient } = await import('@supabase/supabase-js')
    const jwt = await import('jsonwebtoken')
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Check if client already exists
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email)
      .single()

    if (existingClient) {
      return res.status(409).json({ 
        error: { message: 'Client with this email already exists' } 
      })
    }

    // Create new client
    const { data: newClient, error: insertError } = await supabase
      .from('clients')
      .insert({
        company_name: companyName,
        contact_name: contactName,
        email,
        phone,
        website,
        industry,
        goals
      })
      .select()
      .single()

    if (insertError) {
      return res.status(500).json({ 
        error: { message: 'Failed to create client', details: insertError.message } 
      })
    }

    const clientId = newClient.id

    // Create platform connections for the new client
    const { data: platformTypes } = await supabase
      .from('platform_types')
      .select('id')

    if (platformTypes && platformTypes.length > 0) {
      const connections = platformTypes.map(platform => ({
        client_id: clientId,
        platform_type_id: platform.id,
        status: 'pending',
        progress_percentage: 0
      }))

      await supabase
        .from('platform_connections')
        .insert(connections)
    }

    // Generate JWT token
    const token = jwt.default.sign(
      { clientId, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Store session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await supabase
      .from('user_sessions')
      .insert({
        client_id: clientId,
        session_token: token,
        expires_at: expiresAt.toISOString()
      })

    return res.status(201).json({
      message: 'Client registered successfully',
      client: {
        id: clientId,
        companyName,
        contactName,
        email
      },
      token
    })

  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ 
      error: { message: 'Registration failed', details: error.message } 
    })
  }
}