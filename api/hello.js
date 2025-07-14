// Ultra-minimal test function
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Hello from Vercel!', 
    timestamp: new Date().toISOString(),
    commit: '74c2d64'
  })
}