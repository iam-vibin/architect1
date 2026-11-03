// Comprehensive End-to-End API Integration Test Suite for ArchiFind
const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      if (typeof data === 'object') {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(data));
      } else {
        req.write(data);
      }
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log('🚀 Starting ArchiFind End-to-End Integration Verification...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/health', method: 'GET' });
    assert(health.status === 200 && health.data.status === 'healthy', 'Health check responds 200 OK');

    // 2. User Registration
    const testUsername = 'testclient_' + Date.now().toString(36);
    const regRes = await request(
      { hostname: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST' },
      { fullName: 'E2E Test Client', username: testUsername, password: 'password123', role: 'user' }
    );
    assert(regRes.status === 201 && regRes.data.success === true, 'User registration succeeds with status 201');
    const userToken = regRes.data.token;
    const userId = regRes.data.user.id;
    assert(!!userToken, 'JWT token issued upon user registration');

    // 3. User Login
    const loginRes = await request(
      { hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST' },
      { username: testUsername, password: 'password123' }
    );
    assert(loginRes.status === 200 && loginRes.data.success === true, 'User login succeeds with status 200');

    // 4. Seed User Login (user1 / 1234)
    const seedUserRes = await request(
      { hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST' },
      { username: 'user1', password: '1234' }
    );
    assert(seedUserRes.status === 200 && seedUserRes.data.role === 'user', 'Seed user1 / 1234 login succeeds');

    // 5. Seed Professional Login (pro1 / 1234)
    const proLoginRes = await request(
      { hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST' },
      { username: 'pro1', password: '1234' }
    );
    assert(proLoginRes.status === 200 && proLoginRes.data.role === 'professional', 'Seed pro1 / 1234 login succeeds');
    const proToken = proLoginRes.data.token;
    const proId = proLoginRes.data.id;

    // 6. Admin Login (admin / admin123)
    const adminLoginRes = await request(
      { hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST' },
      { username: 'admin', password: 'admin123' }
    );
    assert(adminLoginRes.status === 200 && adminLoginRes.data.role === 'admin', 'Admin login succeeds with status 200');
    const adminToken = adminLoginRes.data.token;

    // 7. Professionals search and filtering
    const allPros = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/professionals', method: 'GET' });
    assert(allPros.status === 200 && allPros.data.professionals.length >= 3, `Fetched ${allPros.data.professionals.length} professionals`);

    const architectFilter = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/professionals?category=Architect', method: 'GET' });
    assert(architectFilter.data.professionals.every((p) => p.profession === 'Architect'), 'Category filter returns only architects');

    const searchRes = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/professionals?search=Chennai', method: 'GET' });
    assert(searchRes.data.professionals.length > 0, 'Location/text search returns matching professionals');

    // 8. Toggle User Favorite
    const favRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/user/favorites/prof-1',
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      },
      {}
    );
    assert(favRes.status === 200 && favRes.data.success === true, 'Toggle favorite professional succeeds');

    // 9. Quotation Request
    const quoteReq = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/quotes/request',
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      },
      {
        professionalId: 'prof-1',
        projectType: 'Independent Villa 3D Elevation',
        description: 'Need full elevation drawings and structural plan for 2400 sq.ft plot.',
        location: 'Chennai',
        budget: '₹2,00,000',
        timeline: '2 Months',
        userPhone: '+91 99999 88888',
      }
    );
    assert(quoteReq.status === 201 && quoteReq.data.quote.id, 'Quotation request created successfully with status 201');
    const createdQuoteId = quoteReq.data.quote.id;

    // 10. Professional Responds to Quote
    const quoteResp = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/quotes/${createdQuoteId}/respond`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${proToken}` },
      },
      {
        quoteAmount: 180000,
        estimatedDays: 45,
        quoteNotes: 'Includes 3D renderings, structural coordination, and 5 site visits.',
        action: 'accept',
      }
    );
    assert(quoteResp.status === 200 && quoteResp.data.quote.quoteAmount === 180000, 'Professional responds with quote amount ₹1,80,000');

    // 11. Escrow Test Deposit
    const escrowDeposit = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/payments/escrow/deposit',
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      },
      {
        quoteId: createdQuoteId,
        amount: 180000,
        cardNumber: '4242424242424242',
        cardExpiry: '12/28',
        cardCvc: '123',
      }
    );
    assert(escrowDeposit.status === 201 && escrowDeposit.data.payment.status === 'held_in_escrow', 'Escrow deposit of ₹1,80,000 securely locked');

    // 12. Escrow Release
    const escrowRelease = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/payments/escrow/release',
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      },
      { quoteId: createdQuoteId }
    );
    assert(escrowRelease.status === 200 && escrowRelease.data.quote.escrowStatus === 'released', 'Client approves and releases escrow payment to professional');

    // 13. Client Submits Review
    const reviewRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/reviews',
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      },
      {
        professionalId: 'prof-1',
        rating: 5,
        comment: 'Outstanding architectural design and prompt communication throughout the project!',
      }
    );
    assert(reviewRes.status === 201 && reviewRes.data.review.rating === 5, 'Client review submitted and saved');

    // 14. Chat Messaging
    const sendMsg = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/chat/send',
        method: 'POST',
      },
      {
        from: userId,
        to: 'prof-1',
        message: 'Hello Arun, following up on our project milestones.',
      }
    );
    assert(sendMsg.status === 201 && sendMsg.data.id, 'Chat message sent and persisted in database');

    const getMsgs = await request({ hostname: '127.0.0.1', port: 5000, path: `/api/chat/${userId}/prof-1`, method: 'GET' });
    assert(getMsgs.data.length > 0, `Chat thread contains ${getMsgs.data.length} messages`);

    // 15. Admin Platform Stats
    const adminStats = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/admin/stats',
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    assert(adminStats.status === 200 && adminStats.data.stats.totalUsers > 0, `Admin stats loaded (Users: ${adminStats.data.stats.totalUsers}, Quotes: ${adminStats.data.stats.totalQuotes})`);

    // 16. Admin Professional Verification
    const verifyRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/admin/professionals/prof-4/verify',
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      { action: 'approved' }
    );
    assert(verifyRes.status === 200 && verifyRes.data.professional.isVerified === true, 'Admin successfully approves professional verification');

    // 17. Admin Category Management
    const addCat = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/admin/categories',
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
      { name: 'Acoustic Engineer', description: 'Studio sound isolation' }
    );
    assert(addCat.status === 201 && addCat.data.category.id, 'Admin creates new category');

    console.log(`\n======================================================`);
    console.log(`🏁 E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('E2E Test encountered unexpected error:', err);
    process.exit(1);
  }
}

// Start backend server and run tests
const { spawn } = require('child_process');
const serverProcess = spawn('node', ['server/index.js']);

serverProcess.stdout.on('data', async (data) => {
  if (data.toString().includes('ARCHIFIND BACKEND RUNNING')) {
    await runE2ETests();
    serverProcess.kill();
    process.exit(0);
  }
});

serverProcess.stderr.on('data', (d) => console.error('Server err:', d.toString()));
