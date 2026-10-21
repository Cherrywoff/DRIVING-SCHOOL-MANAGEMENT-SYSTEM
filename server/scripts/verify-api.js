const http = require('http');
const app = require('../src/app');

const server = http.createServer(app);
const PORT = 5055;

server.listen(PORT, async () => {
  console.log(`Test server running on port ${PORT}...`);
  try {
    // 1. Test Health
    console.log('\n1. Testing GET /api/health...');
    const healthRes = await fetch(`http://localhost:${PORT}/api/health`);
    const healthJson = await healthRes.json();
    console.log('Health Response:', healthJson);

    // 2. Test Login
    console.log('\n2. Testing POST /api/auth/login (Admin)...');
    const loginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@drivingschool.com', password: 'Admin@123' })
    });
    const loginJson = await loginRes.json();
    console.log('Login Success:', loginJson.success, 'Token received:', !!loginJson.token);
    const adminToken = loginJson.token;

    // 3. Test Courses List
    console.log('\n3. Testing GET /api/courses...');
    const coursesRes = await fetch(`http://localhost:${PORT}/api/courses`);
    const coursesJson = await coursesRes.json();
    console.log('Courses count:', coursesJson.count);

    // 4. Test Dashboard Stats
    console.log('\n4. Testing GET /api/reports/dashboard-stats (Admin Auth)...');
    const statsRes = await fetch(`http://localhost:${PORT}/api/reports/dashboard-stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const statsJson = await statsRes.json();
    console.log('Admin Dashboard Stats:', statsJson.stats);

    // 5. Test Mock Quiz Questions
    console.log('\n5. Testing GET /api/tests/mock-quiz/questions...');
    const quizRes = await fetch(`http://localhost:${PORT}/api/tests/mock-quiz/questions`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const quizJson = await quizRes.json();
    console.log('Quiz questions count:', quizJson.count);

    console.log('\nAll core backend API endpoints verified successfully!');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('API Verification error:', err);
    server.close();
    process.exit(1);
  }
});
