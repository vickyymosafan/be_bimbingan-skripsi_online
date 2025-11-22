/**
 * Simple API Test Script for SIBMO
 */

const BASE_URL = 'http://localhost:3000/api/v1';

// Test results
let passCount = 0;
let failCount = 0;
const results = [];

// User credentials
const users = {
  admin: { email: 'admin@sibmo.ac.id', password: 'Password123!' },
  dosen: { email: 'budi.santoso@dosen.ac.id', password: 'Password123!' },
  mahasiswa: { email: 'andi.pratama@mahasiswa.ac.id', password: 'Password123!' }
};

const tokens = {};
const userInfo = {};

// Helper function
async function testEndpoint(method, path, role, body = null, description = '') {
  const testName = `${method} ${path} (${role})`;
  console.log(`\nTesting: ${testName}`);
  console.log(`  ${description}`);
  
  try {
    const headers = {};
    if (tokens[role]) {
      headers['Authorization'] = `Bearer ${tokens[role]}`;
    }
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const options = {
      method,
      headers
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`  ✅ PASS - Status: ${response.status}`);
      passCount++;
      results.push({
        endpoint: `${method} ${path}`,
        role,
        status: 'PASS',
        httpStatus: response.status
      });
      return data;
    } else {
      console.log(`  ❌ FAIL - Status: ${response.status} - ${data.message}`);
      failCount++;
      results.push({
        endpoint: `${method} ${path}`,
        role,
        status: 'FAIL',
        httpStatus: response.status,
        error: data.message
      });
      return null;
    }
  } catch (error) {
    console.log(`  ❌ FAIL - Error: ${error.message}`);
    failCount++;
    results.push({
      endpoint: `${method} ${path}`,
      role,
      status: 'FAIL',
      error: error.message
    });
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting SIBMO API Tests\n');
  console.log('=' .repeat(60));
  console.log('AUTHENTICATION TESTS');
  console.log('=' .repeat(60));

  // Test login
  for (const [role, creds] of Object.entries(users)) {
    const result = await testEndpoint('POST', '/auth/login', role, creds, `Login as ${role}`);
    if (result) {
      tokens[role] = result.data.accessToken;
      userInfo[role] = result.data.user;
    }
  }

  // Test profile
  for (const role of Object.keys(users)) {
    await testEndpoint('GET', '/auth/profile', role, null, `Get profile for ${role}`);
  }

  // Test register
  await testEndpoint('POST', '/auth/register', 'public', {
    nama: 'New User',
    email: 'newuser@test.com',
    password: 'Password123!',
    role: 'MAHASISWA',
    nim: '2020999999'
  }, 'Register new user');

  console.log('\n' + '=' .repeat(60));
  console.log('USER ENDPOINTS TESTS');
  console.log('=' .repeat(60));

  // Test user endpoints
  await testEndpoint('GET', '/users', 'admin', null, 'Admin get all users');
  await testEndpoint('GET', '/users', 'dosen', null, 'Dosen get all users');
  await testEndpoint('GET', '/users', 'mahasiswa', null, 'Mahasiswa get all users');

  if (userInfo.mahasiswa?.id) {
    await testEndpoint('GET', `/users/${userInfo.mahasiswa.id}`, 'admin', null, 'Admin get user by ID');
    await testEndpoint('GET', `/users/${userInfo.mahasiswa.id}`, 'mahasiswa', null, 'Mahasiswa get own profile');
    await testEndpoint('PATCH', `/users/${userInfo.mahasiswa.id}`, 'mahasiswa', 
      { noTelepon: '081234567899' }, 'Mahasiswa update own profile');
  }

  console.log('\n' + '=' .repeat(60));
  console.log('PROPOSAL ENDPOINTS TESTS');
  console.log('=' .repeat(60));

  // Test proposal endpoints
  const proposalData = {
    judul: 'Test Proposal',
    deskripsi: 'This is a test proposal description for testing purposes',
    dosenPembimbingId: userInfo.dosen?.id
  };

  const proposalResult = await testEndpoint('POST', '/proposals', 'mahasiswa', 
    proposalData, 'Mahasiswa create proposal');
  
  let proposalId = proposalResult?.data?.id;

  await testEndpoint('GET', '/proposals', 'admin', null, 'Admin get proposals');
  await testEndpoint('GET', '/proposals', 'dosen', null, 'Dosen get proposals');
  await testEndpoint('GET', '/proposals', 'mahasiswa', null, 'Mahasiswa get proposals');

  if (proposalId) {
    await testEndpoint('GET', `/proposals/${proposalId}`, 'mahasiswa', null, 'Get proposal by ID');
    await testEndpoint('PATCH', `/proposals/${proposalId}`, 'mahasiswa', 
      { abstrak: 'Test abstract' }, 'Update proposal');
    await testEndpoint('POST', `/proposals/${proposalId}/submit`, 'mahasiswa', null, 'Submit proposal');
  }

  await testEndpoint('GET', '/proposals/statistics', 'admin', null, 'Get statistics');
  await testEndpoint('GET', '/proposals/pending-review', 'dosen', null, 'Get pending review');

  console.log('\n' + '=' .repeat(60));
  console.log('BIMBINGAN ENDPOINTS TESTS');
  console.log('=' .repeat(60));

  // Test bimbingan endpoints
  if (proposalId) {
    const bimbinganData = {
      proposalId,
      topik: 'Test Bimbingan',
      tanggal: '2024-12-01',
      waktuMulai: '10:00',
      tipeBimbingan: 'OFFLINE'
    };

    const bimbinganResult = await testEndpoint('POST', '/bimbingan', 'dosen', 
      bimbinganData, 'Dosen create bimbingan');
    
    const bimbinganId = bimbinganResult?.data?.id;

    if (bimbinganId) {
      await testEndpoint('GET', `/bimbingan/${bimbinganId}`, 'mahasiswa', null, 'Get bimbingan by ID');
      await testEndpoint('POST', `/bimbingan/${bimbinganId}/start`, 'mahasiswa', null, 'Start bimbingan');
    }
  }

  await testEndpoint('GET', '/bimbingan', 'admin', null, 'Admin get all bimbingan');
  await testEndpoint('GET', '/bimbingan', 'dosen', null, 'Dosen get bimbingan');
  await testEndpoint('GET', '/bimbingan', 'mahasiswa', null, 'Mahasiswa get bimbingan');
  await testEndpoint('GET', '/bimbingan/upcoming', 'dosen', null, 'Get upcoming bimbingan');

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`\n✅ Total PASS: ${passCount}`);
  console.log(`❌ Total FAIL: ${failCount}`);
  console.log(`📊 Pass Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(2)}%\n`);

  // Save results
  const fs = await import('fs');
  fs.writeFileSync('./test-results.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: passCount + failCount,
      passed: passCount,
      failed: failCount,
      passRate: `${((passCount / (passCount + failCount)) * 100).toFixed(2)}%`
    },
    results
  }, null, 2));

  console.log('📁 Results saved to test-results.json\n');
}

// Run tests
runTests().catch(console.error);
