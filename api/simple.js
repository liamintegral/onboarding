// Minimal function without try-catch
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  res.status(200).json({
    message: 'Simple endpoint working',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  })
}