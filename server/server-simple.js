const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('  Body:', JSON.stringify(req.body));
  }
  next();
});

// Data directory
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Helper functions
function readUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch (e) {
    console.log('Error reading users file:', e.message);
  }
  return [];
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Register endpoint
app.post('/register', (req, res) => {
  console.log('POST /register - Processing registration');
  
  const { fullName, username, password, role } = req.body;
  
  // Validation
  if (!fullName || !username || !password || !role) {
    console.log('  Validation failed: missing fields');
    return res.status(400).json({
      success: false,
      message: 'All fields (fullName, username, password, role) are required',
    });
  }

  // Read existing users
  const users = readUsers();
  
  // Check if username exists
  if (users.find(u => u.username === username)) {
    console.log('  User already exists:', username);
    return res.status(409).json({
      success: false,
      message: 'Username already exists',
    });
  }

  // Create new user
  const newUser = {
    id: Math.random().toString(36).substr(2, 9),
    fullName,
    username,
    password, // In production, hash this with bcrypt
    role: role || 'user',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);
  
  console.log('  User registered successfully:', newUser.id, newUser.username);
  
  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
    },
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ CORS enabled for http://localhost:5173`);
  console.log(`✓ POST /register endpoint ready\n`);
});
