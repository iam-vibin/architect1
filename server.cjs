const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors({ origin: 'http://localhost:5173' }))
app.use((req, res, next) => {
  try {
    console.log(new Date().toISOString(), req.method, req.originalUrl)
  } catch (e) {
    console.error(e)
  }
  next()
})
const users = []
const jwt = require('jsonwebtoken')
const JWT_SECRET = 'archifind_dev_secret_2026'
const DEBUG = true
const messages = []
const multer = require('multer')
const path = require('path')
const UPLOADS_DIR = path.join(__dirname, 'uploads')
const PORTFOLIO_DIR = path.join(UPLOADS_DIR, 'portfolio')
if (!require('fs').existsSync(PORTFOLIO_DIR)) require('fs').mkdirSync(PORTFOLIO_DIR, { recursive: true })
app.use('/uploads', express.static(UPLOADS_DIR))
const portfolios = []
const reviews = []

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, PORTFOLIO_DIR)
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.random().toString(36).slice(2, 9)
    const ext = path.extname(file.originalname)
    cb(null, `${unique}${ext}`)
  }
})

function fileFilter (req, file, cb) {
  const allowed = ['.png', '.jpg', '.jpeg']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) cb(null, true)
  else cb(new Error('Only images allowed'))
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })
app.get('/', (req, res) => {
  try {
    res.json({ status: 'backend alive' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'internal server error' })
  }
})

app.post('/register', (req, res) => {
  try {
    const { fullName, username, password, role } = req.body || {}
    if (DEBUG) console.log('REGISTER request body:', req.body)
    if (!fullName || !username || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }
    const allowed = ['user', 'professional', 'admin']
    const roleValue = role && allowed.includes(role) ? role : 'user'
    if (role && !allowed.includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' })
    if (users.find(u => u.username === username)) return res.status(400).json({ success: false, message: 'Username already exists' })
    const user = { id: `${Date.now()}-${Math.floor(Math.random()*100000)}`, fullName, username, password, role: roleValue }
    users.push(user)
    if (DEBUG) console.log('User registered:', { id: user.id, username: user.username, role: user.role })
    return res.status(201).json({ success: true, message: 'Registered successfully' })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
})
app.post('/login', (req, res) => {
  try {
    const { username, password } = req.body || {}
    if (DEBUG) console.log('Login attempt for:', username)
    if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password required' })
    const user = users.find(u => u.username === username && u.password === password)
    if (!user) return res.status(200).json({ success: false, message: 'Invalid credentials' })
    const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' })
    if (DEBUG) console.log('Login successful for:', username, 'role:', user.role)
    return res.json({ success: true, token, role: user.role })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
})
function authenticateToken(req, res, next) {
  try {
    const auth = req.headers['authorization'] || ''
    if (!auth.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Invalid or missing token' })
    const token = auth.slice(7)
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (DEBUG) console.log('JWT verify error:', err && err.message ? err.message : err)
        return res.status(401).json({ success: false, message: 'Invalid or missing token' })
      }
      if (DEBUG) console.log('JWT verified, payload:', decoded)
      req.user = decoded
      next()
    })
  } catch (e) {
    console.error(e)
    return res.status(401).json({ success: false, message: 'Invalid or missing token' })
  }
}

app.get('/debug/users', (req, res) => {
  if (!DEBUG) return res.status(404).json({ error: 'Not found' })
  try {
    return res.json({ users: users.map(u => ({ id: u.id, username: u.username, role: u.role, fullName: u.fullName })) })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'internal error' })
  }
})

app.get('/user/dashboard', authenticateToken, (req, res) => {
  try {
    if (!req.user || req.user.role !== 'user') return res.status(403).json({ success: false, message: 'Access denied' })
    return res.json({ success: true, message: 'Welcome user' })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

app.get('/professional/dashboard', authenticateToken, (req, res) => {
  try {
    if (!req.user || req.user.role !== 'professional') return res.status(403).json({ success: false, message: 'Access denied' })
    return res.json({ success: true, message: 'Welcome professional' })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

app.get('/admin/dashboard', authenticateToken, (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied' })
    return res.json({ success: true, message: 'Welcome admin' })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

app.post('/chat/send', authenticateToken, (req, res) => {
  try {
    const from = req.user && req.user.username
    const role = req.user && req.user.role
    const { to, text } = req.body || {}
    if (!from || !to || !text) return res.status(400).json({ success: false, message: 'from, to and text are required' })
    const msg = { from, to, role, text, timestamp: new Date().toISOString() }
    messages.push(msg)
    if (DEBUG) console.log('Chat message saved:', msg)
    return res.json({ success: true, message: 'sent', msg })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

app.get('/chat/:username', authenticateToken, (req, res) => {
  try {
    const me = req.user && req.user.username
    const other = req.params.username
    if (!me || !other) return res.status(400).json({ success: false, message: 'username required' })
    const thread = messages.filter(m => (m.from === me && m.to === other) || (m.from === other && m.to === me))
    return res.json({ success: true, messages: thread })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

app.post('/portfolio/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.user || req.user.role !== 'professional') return res.status(403).json({ success: false, message: 'Access denied' })
    if (!req.file) return res.status(400).json({ success: false, message: 'Image file required' })
    const username = req.user.username
    const imageUrl = `/uploads/portfolio/${req.file.filename}`
    const record = { username, imageUrl, uploadedAt: new Date().toISOString() }
    portfolios.push(record)
    if (DEBUG) console.log('Portfolio upload:', record)
    return res.json({ success: true, message: 'Uploaded', image: record })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

app.get('/portfolio/:username', authenticateToken, (req, res) => {
  try {
    const user = req.params.username
    if (!user) return res.status(400).json({ success: false, message: 'username required' })
    const items = portfolios.filter(p => p.username === user)
    return res.json({ success: true, images: items })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

app.post('/reviews', authenticateToken, (req, res) => {
  try {
    if (!req.user || req.user.role !== 'user') return res.status(403).json({ success: false, message: 'Only users may submit reviews' })
    const { professional, rating, comment } = req.body || {}
    if (!professional || typeof rating === 'undefined') return res.status(400).json({ success: false, message: 'professional and rating are required' })
    const r = Number(rating)
    if (!Number.isInteger(r) || r < 1 || r > 5) return res.status(400).json({ success: false, message: 'rating must be an integer 1-5' })
    const user = req.user.username
    const exists = reviews.find(rv => rv.professional === professional && rv.user === user)
    if (exists) return res.status(409).json({ success: false, message: 'You have already reviewed this professional' })
    const review = { professional, user, rating: r, comment: comment || '', createdAt: new Date().toISOString() }
    reviews.push(review)
    if (DEBUG) console.log('New review:', review)
    return res.json({ success: true, review })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

app.get('/reviews/:professional', authenticateToken, (req, res) => {
  try {
    const professional = req.params.professional
    if (!professional) return res.status(400).json({ success: false, message: 'professional required' })
    const list = reviews.filter(r => r.professional === professional)
    const avg = list.length ? (list.reduce((s, r) => s + r.rating, 0) / list.length) : 0
    return res.json({ success: true, average: Number(avg.toFixed(2)), count: list.length, reviews: list })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
})
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})
app.use((err, req, res, next) => {
  try {
    console.error('Unhandled error', err)
  } catch (e) {
    console.error(e)
  }
  try {
    res.status(500).json({ error: 'Internal server error' })
  } catch (e) {
    console.error(e)
  }
})
process.on('uncaughtException', err => {
  try {
    console.error('uncaughtException', err)
  } catch (e) {}
})
process.on('unhandledRejection', reason => {
  try {
    console.error('unhandledRejection', reason)
  } catch (e) {}
})
const PORT = 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
 