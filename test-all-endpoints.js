/**
 * Test Script untuk semua endpoint SIBMO API
 * Testing dengan role: ADMIN, DOSEN, MAHASISWA
 */

const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api/v1';

// User credentials dari seed
const users = {
  admin: {
    email: 'admin@sibmo.ac.id',
    password: 'Password123!'
  },
  dosen: {
    email: 'budi.santoso@dosen.ac.id',
    password: 'Password123!'
  },
  mahasiswa: {
    email: 'andi.pratama@mahasiswa.ac.id',
    password: 'Password123!'
  }
};

// Store untuk tokens dan user info
const tokens = {};
const userInfo = {};
let testResults = [];
let passCount = 0;
let failCount = 0;

// Helper function untuk testing
async function testEndpoint(method, path, role, body = null, description = '') {
  const testName = `${method} ${path} (${role})`;
  console.log(`\n🧪 Testing: ${testName}`);
  console.log(`   ${description || 'No description'}`);
  
  try {
    const config = {
      method,
      url: `${BASE_URL}${path}`,
      headers: {}
    };

    if (tokens[role]) {
      config.headers.Authorization = `Bearer ${tokens[role]}`;
    }

    if (body) {
      config.data = body;
    }

    const response = await axios(config);
    console.log(`   ✅ PASS - Status: ${response.status}`);
    passCount++;
    testResults.push({
      endpoint: `${method} ${path}`,
      role,
      status: 'PASS',
      httpStatus: response.status,
      description
    });
    return response.data;
  } catch (error) {
    const status = error.response?.status || 'Network Error';
    const message = error.response?.data?.message || error.message;
    console.log(`   ❌ FAIL - Status: ${status} - ${message}`);
    failCount++;
    testResults.push({
      endpoint: `${method} ${path}`,
      role,
      status: 'FAIL',
      httpStatus: status,
      error: message,
      description
    });
    return null;
  }
}

// Test Authentication Endpoints
async function testAuthentication() {
  console.log('\n' + '='.repeat(60));
  console.log('🔐 TESTING AUTHENTICATION ENDPOINTS');
  console.log('='.repeat(60));

  // Test login untuk setiap role
  for (const [role, creds] of Object.entries(users)) {
    const result = await testEndpoint(
      'POST', 
      '/auth/login', 
      role, 
      creds,
      `Login sebagai ${role}`
    );
    
    if (result) {
      tokens[role] = result.data.accessToken;
      userInfo[role] = result.data.user;
    }
  }

  // Test register (harus fail karena email sudah ada)
  await testEndpoint(
    'POST',
    '/auth/register',
    'public',
    {
      nama: 'Test User',
      email: 'test@mahasiswa.ac.id',
      password: 'Password123!',
      role: 'MAHASISWA',
      nim: '2020001010'
    },
    'Register user baru'
  );

  // Test profile untuk setiap role
  for (const role of Object.keys(users)) {
    await testEndpoint(
      'GET',
      '/auth/profile',
      role,
      null,
      `Get profile untuk ${role}`
    );
  }

  // Test refresh token
  for (const role of Object.keys(users)) {
    await testEndpoint(
      'POST',
      '/auth/refresh',
      role,
      { refreshToken: tokens[role] }, // Assuming refresh token sama dengan access token untuk test
      `Refresh token untuk ${role}`
    );
  }
}

// Test User Endpoints
async function testUserEndpoints() {
  console.log('\n' + '='.repeat(60));
  console.log('👥 TESTING USER ENDPOINTS');
  console.log('='.repeat(60));

  // GET /users - List all users
  await testEndpoint('GET', '/users', 'admin', null, 'Admin get all users');
  await testEndpoint('GET', '/users', 'dosen', null, 'Dosen get all users');
  await testEndpoint('GET', '/users', 'mahasiswa', null, 'Mahasiswa get all users');

  // GET /users/:id - Get user by ID
  if (userInfo.mahasiswa?.id) {
    await testEndpoint('GET', `/users/${userInfo.mahasiswa.id}`, 'admin', null, 'Admin get user by ID');
    await testEndpoint('GET', `/users/${userInfo.mahasiswa.id}`, 'dosen', null, 'Dosen get user by ID');
    await testEndpoint('GET', `/users/${userInfo.mahasiswa.id}`, 'mahasiswa', null, 'Mahasiswa get own profile');
  }

  // PATCH /users/:id - Update user
  if (userInfo.mahasiswa?.id) {
    await testEndpoint(
      'PATCH',
      `/users/${userInfo.mahasiswa.id}`,
      'admin',
      { noTelepon: '081234567899' },
      'Admin update user'
    );
    
    await testEndpoint(
      'PATCH',
      `/users/${userInfo.mahasiswa.id}`,
      'mahasiswa',
      { noTelepon: '081234567898' },
      'Mahasiswa update own profile'
    );
    
    await testEndpoint(
      'PATCH',
      `/users/${userInfo.dosen.id}`,
      'mahasiswa',
      { noTelepon: '081234567897' },
      'Mahasiswa update other user (should fail)'
    );
  }

  // GET /users/role/:role - Get users by role
  await testEndpoint('GET', '/users/role/MAHASISWA', 'admin', null, 'Admin get mahasiswa users');
  await testEndpoint('GET', '/users/role/DOSEN', 'admin', null, 'Admin get dosen users');
  await testEndpoint('GET', '/users/role/MAHASISWA', 'dosen', null, 'Dosen get mahasiswa users');
}

// Test Proposal Endpoints
async function testProposalEndpoints() {
  console.log('\n' + '='.repeat(60));
  console.log('📄 TESTING PROPOSAL ENDPOINTS');
  console.log('='.repeat(60));

  let proposalId = null;

  // POST /proposals - Create proposal (mahasiswa only)
  const proposalData = {
    judul: 'Sistem Informasi Akademik Berbasis Web',
    deskripsi: 'Penelitian ini bertujuan untuk mengembangkan sistem informasi akademik yang terintegrasi',
    bidangKajian: 'Sistem Informasi',
    metodePenelitian: 'Waterfall',
    dosenPembimbingId: userInfo.dosen?.id
  };

  const createResult = await testEndpoint(
    'POST',
    '/proposals',
    'mahasiswa',
    proposalData,
    'Mahasiswa create proposal'
  );
  
  if (createResult?.data?.id) {
    proposalId = createResult.data.id;
  }

  await testEndpoint(
    'POST',
    '/proposals',
    'dosen',
    proposalData,
    'Dosen create proposal (should fail)'
  );

  await testEndpoint(
    'POST',
    '/proposals',
    'admin',
    proposalData,
    'Admin create proposal (should fail)'
  );

  // GET /proposals - List proposals
  await testEndpoint('GET', '/proposals', 'admin', null, 'Admin get all proposals');
  await testEndpoint('GET', '/proposals', 'dosen', null, 'Dosen get proposals');
  await testEndpoint('GET', '/proposals', 'mahasiswa', null, 'Mahasiswa get own proposals');

  // GET /proposals/:id - Get proposal by ID
  if (proposalId) {
    await testEndpoint('GET', `/proposals/${proposalId}`, 'admin', null, 'Admin get proposal by ID');
    await testEndpoint('GET', `/proposals/${proposalId}`, 'dosen', null, 'Dosen get proposal');
    await testEndpoint('GET', `/proposals/${proposalId}`, 'mahasiswa', null, 'Mahasiswa get own proposal');
  }

  // PATCH /proposals/:id - Update proposal
  if (proposalId) {
    await testEndpoint(
      'PATCH',
      `/proposals/${proposalId}`,
      'mahasiswa',
      { abstrak: 'Abstrak penelitian...' },
      'Mahasiswa update own proposal'
    );

    await testEndpoint(
      'PATCH',
      `/proposals/${proposalId}`,
      'dosen',
      { catatanRevisi: 'Perlu perbaikan pada metodologi' },
      'Dosen update proposal'
    );
  }

  // POST /proposals/:id/submit - Submit proposal
  if (proposalId) {
    await testEndpoint(
      'POST',
      `/proposals/${proposalId}/submit`,
      'mahasiswa',
      null,
      'Mahasiswa submit proposal'
    );
  }

  // POST /proposals/:id/approve - Approve proposal (dosen only)
  if (proposalId) {
    await testEndpoint(
      'POST',
      `/proposals/${proposalId}/approve`,
      'dosen',
      { dosenPenguji1Id: userInfo.dosen?.id },
      'Dosen approve proposal'
    );

    await testEndpoint(
      'POST',
      `/proposals/${proposalId}/approve`,
      'mahasiswa',
      null,
      'Mahasiswa approve proposal (should fail)'
    );
  }

  // GET /proposals/statistics
  await testEndpoint('GET', '/proposals/statistics', 'admin', null, 'Admin get statistics');
  await testEndpoint('GET', '/proposals/statistics', 'dosen', null, 'Dosen get statistics');
  await testEndpoint('GET', '/proposals/statistics', 'mahasiswa', null, 'Mahasiswa get statistics');

  // GET /proposals/pending-review (dosen only)
  await testEndpoint('GET', '/proposals/pending-review', 'dosen', null, 'Dosen get pending review');
  await testEndpoint('GET', '/proposals/pending-review', 'mahasiswa', null, 'Mahasiswa get pending review (should fail)');

  return proposalId;
}

// Test Bimbingan Endpoints
async function testBimbinganEndpoints(proposalId) {
  console.log('\n' + '='.repeat(60));
  console.log('💬 TESTING BIMBINGAN ENDPOINTS');
  console.log('='.repeat(60));

  let bimbinganId = null;

  // POST /bimbingan - Create bimbingan
  if (proposalId) {
    const bimbinganData = {
      proposalId: proposalId,
      topik: 'Pembahasan BAB I Pendahuluan',
      tanggal: '2024-12-01',
      waktuMulai: '10:00',
      tipeBimbingan: 'OFFLINE',
      lokasi: 'Ruang Dosen Lt. 3'
    };

    const createResult = await testEndpoint(
      'POST',
      '/bimbingan',
      'dosen',
      bimbinganData,
      'Dosen create bimbingan'
    );

    if (createResult?.data?.id) {
      bimbinganId = createResult.data.id;
    }

    await testEndpoint(
      'POST',
      '/bimbingan',
      'mahasiswa',
      bimbinganData,
      'Mahasiswa create bimbingan'
    );
  }

  // GET /bimbingan - List bimbingan
  await testEndpoint('GET', '/bimbingan', 'admin', null, 'Admin get all bimbingan');
  await testEndpoint('GET', '/bimbingan', 'dosen', null, 'Dosen get bimbingan');
  await testEndpoint('GET', '/bimbingan', 'mahasiswa', null, 'Mahasiswa get bimbingan');

  // GET /bimbingan/:id - Get bimbingan by ID
  if (bimbinganId) {
    await testEndpoint('GET', `/bimbingan/${bimbinganId}`, 'admin', null, 'Admin get bimbingan by ID');
    await testEndpoint('GET', `/bimbingan/${bimbinganId}`, 'dosen', null, 'Dosen get bimbingan');
    await testEndpoint('GET', `/bimbingan/${bimbinganId}`, 'mahasiswa', null, 'Mahasiswa get bimbingan');
  }

  // PATCH /bimbingan/:id - Update bimbingan
  if (bimbinganId) {
    await testEndpoint(
      'PATCH',
      `/bimbingan/${bimbinganId}`,
      'dosen',
      { catatan: 'Bimbingan berjalan dengan baik' },
      'Dosen update bimbingan'
    );

    await testEndpoint(
      'PATCH',
      `/bimbingan/${bimbinganId}`,
      'mahasiswa',
      { agendaBimbingan: 'Diskusi revisi' },
      'Mahasiswa update bimbingan'
    );
  }

  // POST /bimbingan/:id/start - Start bimbingan
  if (bimbinganId) {
    await testEndpoint(
      'POST',
      `/bimbingan/${bimbinganId}/start`,
      'dosen',
      null,
      'Dosen start bimbingan'
    );

    await testEndpoint(
      'POST',
      `/bimbingan/${bimbinganId}/start`,
      'mahasiswa',
      null,
      'Mahasiswa start bimbingan'
    );
  }

  // POST /bimbingan/:id/finish - Finish bimbingan (dosen only)
  if (bimbinganId) {
    await testEndpoint(
      'POST',
      `/bimbingan/${bimbinganId}/finish`,
      'dosen',
      {
        hasilBimbingan: 'Mahasiswa sudah memahami konsep dengan baik',
        tugasSelanjutnya: 'Lanjutkan ke BAB II',
        nilaiProgress: 25
      },
      'Dosen finish bimbingan'
    );

    await testEndpoint(
      'POST',
      `/bimbingan/${bimbinganId}/finish`,
      'mahasiswa',
      null,
      'Mahasiswa finish bimbingan (should fail)'
    );
  }

  // GET /bimbingan/upcoming
  await testEndpoint('GET', '/bimbingan/upcoming', 'dosen', null, 'Dosen get upcoming bimbingan');
  await testEndpoint('GET', '/bimbingan/upcoming', 'mahasiswa', null, 'Mahasiswa get upcoming bimbingan');

  // GET /bimbingan/history/:proposalId
  if (proposalId) {
    await testEndpoint('GET', `/bimbingan/history/${proposalId}`, 'dosen', null, 'Dosen get bimbingan history');
    await testEndpoint('GET', `/bimbingan/history/${proposalId}`, 'mahasiswa', null, 'Mahasiswa get bimbingan history');
  }
}

// Generate report
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));

  console.log(`\n✅ Total PASS: ${passCount}`);
  console.log(`❌ Total FAIL: ${failCount}`);
  console.log(`📈 Pass Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(2)}%\n`);

  // Group by endpoint
  const endpointGroups = {};
  testResults.forEach(result => {
    if (!endpointGroups[result.endpoint]) {
      endpointGroups[result.endpoint] = [];
    }
    endpointGroups[result.endpoint].push(result);
  });

  console.log('DETAILED RESULTS BY ENDPOINT:');
  console.log('-'.repeat(60));
  
  Object.entries(endpointGroups).forEach(([endpoint, results]) => {
    console.log(`\n📍 ${endpoint}`);
    results.forEach(r => {
      const status = r.status === 'PASS' ? '✅' : '❌';
      const httpStatus = r.httpStatus ? `[${r.httpStatus}]` : '';
      console.log(`   ${status} ${r.role.padEnd(10)} ${httpStatus} ${r.description || ''}`);
      if (r.error) {
        console.log(`      └─ Error: ${r.error}`);
      }
    });
  });

  // Save to file
  const fs = require('fs');
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: passCount + failCount,
      passed: passCount,
      failed: failCount,
      passRate: ((passCount / (passCount + failCount)) * 100).toFixed(2) + '%'
    },
    results: testResults
  };

  fs.writeFileSync(
    'test-results.json',
    JSON.stringify(reportData, null, 2)
  );
  
  console.log('\n📁 Results saved to test-results.json');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting SIBMO API Test Suite');
  console.log('⏰ ' + new Date().toLocaleString());
  console.log('📍 Testing against: ' + BASE_URL);

  try {
    // Run tests in sequence
    await testAuthentication();
    await testUserEndpoints();
    const proposalId = await testProposalEndpoints();
    await testBimbinganEndpoints(proposalId);
    
    // Generate final report
    generateReport();
  } catch (error) {
    console.error('\n💥 Critical error during testing:', error.message);
  }
}

// Check if server is running
async function checkServerStatus() {
  try {
    await axios.get(BASE_URL.replace('/api/v1', ''));
    return true;
  } catch (error) {
    return false;
  }
}

// Start testing
(async () => {
  console.log('🔍 Checking server status...');
  const serverRunning = await checkServerStatus();
  
  if (!serverRunning) {
    console.error('❌ Server is not running at ' + BASE_URL.replace('/api/v1', ''));
    console.log('💡 Please start the server with: npm run start:dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  await runAllTests();
})();
