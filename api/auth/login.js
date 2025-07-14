import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ 
        error: { message: 'Email is required' } 
      })
    }

    // Find client by email
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (clientError || !client) {
      return res.status(401).json({ 
        error: { message: 'Invalid email address' } 
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        clientId: client.client_id,
        email: client.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Update last login
    await supabase
      .from('clients')
      .update({ last_login: new Date().toISOString() })
      .eq('client_id', client.client_id)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      client: {
        clientId: client.client_id,
        companyName: client.company_name,
        contactName: client.contact_name,
        email: client.email,
        phone: client.phone,
        website: client.website,
        industry: client.industry,
        status: client.status
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      error: { message: 'Internal server error' } 
    })
  }
}