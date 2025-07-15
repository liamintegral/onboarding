// Website analysis endpoint - detects CMS, hosting, domain registrar
export default async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    )

    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: 'Website URL is required' })
    }

    // Normalize URL
    let normalizedUrl = url
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    console.log('Analyzing website:', normalizedUrl)

    const analysis = await analyzeWebsite(normalizedUrl)
    
    return res.status(200).json({
      success: true,
      website: {
        url: normalizedUrl,
        ...analysis
      }
    })

  } catch (error) {
    console.error('Website analysis error:', error)
    return res.status(500).json({ 
      error: 'Failed to analyze website',
      details: error.message 
    })
  }
}

async function analyzeWebsite(url) {
  const results = {
    cms: null,
    hosting: null,
    domainRegistrar: null,
    technologies: [],
    confidence: 0,
    recommendations: []
  }

  try {
    // Fetch the website
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OnboardingBot/1.0)'
      },
      timeout: 10000
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    const headers = Object.fromEntries(response.headers.entries())

    // Detect CMS from HTML patterns
    results.cms = detectCMS(html, headers, url)
    
    // Detect hosting provider
    results.hosting = detectHosting(headers, url)
    
    // Get domain registrar info
    results.domainRegistrar = await detectDomainRegistrar(url)
    
    // Detect additional technologies
    results.technologies = detectTechnologies(html, headers)
    
    // Calculate confidence score
    results.confidence = calculateConfidence(results)
    
    // Generate recommendations
    results.recommendations = generateRecommendations(results)

    return results

  } catch (error) {
    console.error('Error analyzing website:', error)
    
    // Return basic domain analysis even if website fetch fails
    const domain = new URL(url).hostname
    return {
      cms: { name: 'unknown', confidence: 0 },
      hosting: { name: 'unknown', confidence: 0 },
      domainRegistrar: await detectDomainRegistrar(url),
      technologies: [],
      confidence: 0.1,
      recommendations: [
        'Website could not be accessed for analysis',
        'Manual verification of CMS and hosting will be required'
      ]
    }
  }
}

function detectCMS(html, headers, url) {
  const cms = {
    name: 'unknown',
    version: null,
    confidence: 0,
    indicators: []
  }

  // WordPress detection
  if (html.includes('/wp-content/') || 
      html.includes('/wp-includes/') || 
      html.includes('wp-json') ||
      headers['x-powered-by']?.includes('WordPress')) {
    cms.name = 'WordPress'
    cms.confidence = 0.9
    cms.indicators.push('wp-content directory', 'wp-includes directory')
    
    // Try to detect version
    const versionMatch = html.match(/generator.*WordPress\s+([0-9.]+)/i)
    if (versionMatch) {
      cms.version = versionMatch[1]
    }
  }
  
  // Shopify detection
  else if (html.includes('Shopify.theme') || 
           html.includes('cdn.shopify.com') ||
           headers['server']?.includes('cloudflare') && html.includes('shopify')) {
    cms.name = 'Shopify'
    cms.confidence = 0.9
    cms.indicators.push('Shopify CDN', 'Shopify theme')
  }
  
  // Wix detection
  else if (html.includes('_wixCIDX') || 
           html.includes('wix.com') ||
           url.includes('.wixsite.com')) {
    cms.name = 'Wix'
    cms.confidence = 0.95
    cms.indicators.push('Wix identifiers', 'Wix domain')
  }
  
  // Squarespace detection
  else if (html.includes('squarespace') || 
           url.includes('.squarespace.com') ||
           headers['server']?.includes('Squarespace')) {
    cms.name = 'Squarespace'
    cms.confidence = 0.9
    cms.indicators.push('Squarespace identifiers')
  }
  
  // Webflow detection
  else if (html.includes('webflow') || 
           url.includes('.webflow.io')) {
    cms.name = 'Webflow'
    cms.confidence = 0.9
    cms.indicators.push('Webflow identifiers')
  }
  
  // Custom/Static detection patterns
  else if (html.includes('<!DOCTYPE html>') && 
           !html.includes('generator') &&
           !detectFrameworkPatterns(html)) {
    cms.name = 'Custom/Static'
    cms.confidence = 0.6
    cms.indicators.push('No CMS indicators found')
  }

  return cms
}

function detectHosting(headers, url) {
  const hosting = {
    name: 'unknown',
    confidence: 0,
    indicators: []
  }

  const server = headers['server']?.toLowerCase() || ''
  const domain = new URL(url).hostname

  // Cloudflare
  if (headers['cf-ray'] || server.includes('cloudflare')) {
    hosting.name = 'Cloudflare'
    hosting.confidence = 0.9
    hosting.indicators.push('CF-Ray header', 'Cloudflare server')
  }
  
  // AWS
  else if (server.includes('aws') || domain.includes('amazonaws.com')) {
    hosting.name = 'AWS'
    hosting.confidence = 0.8
    hosting.indicators.push('AWS server headers')
  }
  
  // Vercel
  else if (server.includes('vercel') || domain.includes('vercel.app')) {
    hosting.name = 'Vercel'
    hosting.confidence = 0.95
    hosting.indicators.push('Vercel server/domain')
  }
  
  // Netlify
  else if (server.includes('netlify') || domain.includes('netlify.app')) {
    hosting.name = 'Netlify'
    hosting.confidence = 0.95
    hosting.indicators.push('Netlify server/domain')
  }
  
  // GoDaddy
  else if (server.includes('godaddy') || headers['x-sucuri-id']) {
    hosting.name = 'GoDaddy'
    hosting.confidence = 0.8
    hosting.indicators.push('GoDaddy server headers')
  }

  return hosting
}

async function detectDomainRegistrar(url) {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    
    // For production, you'd use a WHOIS API service
    // For now, return basic analysis based on common patterns
    
    const registrar = {
      name: 'unknown',
      confidence: 0,
      nameservers: [],
      recommendations: []
    }

    // Basic domain analysis - in production, use WHOIS API
    if (domain.includes('godaddy') || domain.includes('secureserver')) {
      registrar.name = 'GoDaddy'
      registrar.confidence = 0.7
    } else if (domain.includes('cloudflare')) {
      registrar.name = 'Cloudflare'
      registrar.confidence = 0.7
    }

    registrar.recommendations = [
      'WHOIS lookup recommended for detailed registrar information',
      'Contact client for domain registrar account access'
    ]

    return registrar

  } catch (error) {
    return {
      name: 'unknown',
      confidence: 0,
      nameservers: [],
      recommendations: ['Manual domain registrar identification required']
    }
  }
}

function detectTechnologies(html, headers) {
  const technologies = []

  // Analytics
  if (html.includes('google-analytics') || html.includes('gtag')) {
    technologies.push({ name: 'Google Analytics', category: 'analytics' })
  }
  
  // Tag managers
  if (html.includes('googletagmanager')) {
    technologies.push({ name: 'Google Tag Manager', category: 'tag-manager' })
  }
  
  // E-commerce
  if (html.includes('shopify')) {
    technologies.push({ name: 'Shopify', category: 'ecommerce' })
  }
  
  return technologies
}

function detectFrameworkPatterns(html) {
  return html.includes('react') || 
         html.includes('angular') || 
         html.includes('vue') ||
         html.includes('next.js')
}

function calculateConfidence(results) {
  let totalConfidence = 0
  let factorCount = 0

  if (results.cms.confidence > 0) {
    totalConfidence += results.cms.confidence
    factorCount++
  }
  
  if (results.hosting.confidence > 0) {
    totalConfidence += results.hosting.confidence
    factorCount++
  }

  return factorCount > 0 ? totalConfidence / factorCount : 0
}

function generateRecommendations(results) {
  const recommendations = []

  // CMS-specific recommendations
  switch (results.cms.name) {
    case 'WordPress':
      recommendations.push(
        'Request WordPress admin access or create new admin user',
        'Ask for hosting panel access (cPanel, Plesk, etc.)',
        'Verify plugin installation permissions'
      )
      break
    case 'Shopify':
      recommendations.push(
        'Request Shopify store owner to add team member',
        'Ask for Shopify Partners access if applicable',
        'Verify app installation permissions'
      )
      break
    case 'Wix':
      recommendations.push(
        'Request Wix site contributor access',
        'Ask client to upgrade plan if needed for collaborator access'
      )
      break
    case 'Squarespace':
      recommendations.push(
        'Request Squarespace contributor access',
        'Verify plan supports multiple contributors'
      )
      break
    default:
      recommendations.push(
        'Manual identification of CMS and access method required',
        'Contact client for detailed technical information'
      )
  }

  return recommendations
}