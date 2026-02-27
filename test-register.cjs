// Quick test of the /api/auth/register endpoint
const http = require('http');

const testData = {
  name: "Test User",
  username: "testuser" + Math.random().toString(36).slice(2, 9),
  password: "password123",
  role: "user"
};

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.write(JSON.stringify(testData));
req.end();
