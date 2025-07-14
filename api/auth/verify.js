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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: { message: 'Method not allowed' } })
  }

  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: { message: 'No token provided' } 
      })
    }

    const token = authHeader.substring(7)
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get current client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('client_id', decoded.clientId)
      .single()

    if (clientError || !client) {
      return res.status(401).json({ 
        error: { message: 'Invalid token' } 
      })
    }

    res.status(200).json({
      success: true,
      message: 'Token verified',
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
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: { message: 'Token expired' } 
      })
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: { message: 'Invalid token' } 
      })
    }

    console.error('Token verification error:', error)
    res.status(500).json({ 
      error: { message: 'Internal server error' } 
    })
  }
}