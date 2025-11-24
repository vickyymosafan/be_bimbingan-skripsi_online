/**
 * Comprehensive API Endpoint Testing Script
 * Tests all SIBMO API endpoints with different user roles
 */

const BASE_URL = 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api/v1`;

// Test users
const USERS = {
  admin: { email: 'admin@sibmo.ac.id', password: 'Password123!' },
  dosen: { email: 'budi.santoso@dosen.ac.id', password: 'Password123!' },
  mahasiswa: { email: 'andi.pratama@mahasiswa.ac.id', password: 'Password123!' },
};

// Store tokens and test results
const tokens = {};
const testResults = [];
let testIds = {
  proposalId: null,
  bimbinganId: null,
  userId: null,
};

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const contentType = response.headers.get('content-type');
    let data = null;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text || null;
    }

    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

// Log test result
function logTest(module, endpoint, method, role, result) {
  const status = result.ok ? '✅ PASS' : 
                 result.status === 403 ? '🔒 BLOCKED' : 
                 result.status === 401 ? '🔒 UNAUTHORIZED' : 
                 '❌ FAIL';
  
  const log = {
    module,
    endpoint,
    method,
    role: role || 'Public',
    status: result.status,
    result: status,
    message: result.data?.message || result.error || '',
  };
  
  testResults.push(log);
  console.log(`${status} | ${method.padEnd(6)} | ${endpoint.padEnd(40)} | ${(role || 'Public').padEnd(10)} | ${result.status}`);
}

// Login function
async function login(role) {
  console.log(`\n🔐 Logging in as ${role.toUpperCase()}...`);
  const user = USERS[role];
  
  const result = await makeRequest(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(user),
  });

  if (result.ok && result.data?.data?.accessToken) {
    tokens[role] = result.data.data.accessToken;
    console.log(`✅ ${role.toUpperCase()} logged in successfully`);
    console.log(`   Token: ${tokens[role].substring(0, 50)}...`);
    return true;
  } else {
    console.log(`❌ ${role.toUpperCase()} login failed:`, JSON.stringify(result.data, null, 2));
    return false;
  }
}

// Test public endpoints
async function testPublicEndpoints() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 TESTING PUBLIC ENDPOINTS');
  console.log('='.repeat(80));

  // Root endpoint
  let result = await makeRequest(`${BASE_URL}/`);
  logTest('App', '/', 'GET', null, result);

  // Health check
  result = await makeRequest(`${BASE_URL}/health`);
  logTest('App', '/health', 'GET', null, result);

  // Register
  const newUser = {
    email: `test${Date.now()}@test.com`,
    password: 'Test123!',
    nama: 'Test User',
    role: 'MAHASISWA',
    nim: `TEST${Date.now()}`,
  };
  result = await makeRequest(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(newUser),
  });
  logTest('Auth', '/api/v1/auth/register', 'POST', null, result);
}

// Test auth endpoints
async function testAuthEndpoints(role) {
  console.log('\n' + '='.repeat(80));
  console.log(`📋 TESTING AUTH ENDPOINTS - ${role.toUpperCase()}`);
  console.log('='.repeat(80));

  const token = tokens[role];
  const headers = { Authorization: `Bearer ${token}` };

  // Profile
  let result = await makeRequest(`${API_BASE}/auth/profile`, { headers });
  logTest('Auth', '/api/v1/auth/profile', 'GET', role, result);

  // Validate
  result = await makeRequest(`${API_BASE}/auth/validate`, { headers });
  logTest('Auth', '/api/v1/auth/validate', 'GET', role, result);

  // Refresh (using access token as refresh for testing)
  result = await makeRequest(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers,
  });
  logTest('Auth', '/api/v1/auth/refresh', 'POST', role, result);
}

// Test user endpoints
async function testUserEndpoints(role) {
  console.log('\n' + '='.repeat(80));
  console.log(`📋 TESTING USER ENDPOINTS - ${role.toUpperCase()}`);
  console.log('='.repeat(80));

  const token = tokens[role];
  const headers = { Authorization: `Bearer ${token}` };

  // Get all users
  let result = await makeRequest(`${API_BASE}/users`, { headers });
  logTest('Users', '/api/v1/users', 'GET', role, result);

  // Get profile
  result = await makeRequest(`${API_BASE}/users/profile`, { headers });
  logTest('Users', '/api/v1/users/profile', 'GET', role, result);
  
  if (result.ok && result.data?.data?.id) {
    testIds.userId = result.data.data.id;
  }

  // Get dosen list
  result = await makeRequest(`${API_BASE}/users/dosen`, { headers });
  logTest('Users', '/api/v1/users/dosen', 'GET', role, result);

  // Get mahasiswa list
  result = await makeRequest(`${API_BASE}/users/mahasiswa`, { headers });
  logTest('Users', '/api/v1/users/mahasiswa', 'GET', role, result);

  // Get user by ID
  if (testIds.userId) {
    result = await makeRequest(`${API_BASE}/users/${testIds.userId}`, { headers });
    logTest('Users', `/api/v1/users/:id`, 'GET', role, result);
  }

  // Create user (admin only)
  if (role === 'admin') {
    const newUser = {
      email: `newuser${Date.now()}@test.com`,
      password: 'Test123!',
      nama: 'New Test User',
      role: 'MAHASISWA',
      nim: `NEW${Date.now()}`,
    };
    result = await makeRequest(`${API_BASE}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newUser),
    });
    logTest('Users', '/api/v1/users', 'POST', role, result);
  }

  // Update user
  if (testIds.userId) {
    result = await makeRequest(`${API_BASE}/users/${testIds.userId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ nama: 'Updated Name' }),
    });
    logTest('Users', '/api/v1/users/:id', 'PATCH', role, result);
  }
}

// Test proposal endpoints
async function testProposalEndpoints(role) {
  console.log('\n' + '='.repeat(80));
  console.log(`📋 TESTING PROPOSAL ENDPOINTS - ${role.toUpperCase()}`);
  console.log('='.repeat(80));

  const token = tokens[role];
  const headers = { Authorization: `Bearer ${token}` };

  // Get all proposals
  let result = await makeRequest(`${API_BASE}/proposals`, { headers });
  logTest('Proposals', '/api/v1/proposals', 'GET', role, result);
  
  // Store proposal ID for further tests
  if (result.ok && result.data?.data?.length > 0) {
    testIds.proposalId = result.data.data[0].id;
  }

  // Get statistics
  result = await makeRequest(`${API_BASE}/proposals/statistics`, { headers });
  logTest('Proposals', '/api/v1/proposals/statistics', 'GET', role, result);

  // Get pending review (dosen only)
  result = await makeRequest(`${API_BASE}/proposals/pending-review`, { headers });
  logTest('Proposals', '/api/v1/proposals/pending-review', 'GET', role, result);

  // Create proposal (mahasiswa only)
  if (role === 'mahasiswa') {
    const newProposal = {
      judul: `Test Proposal ${Date.now()}`,
      deskripsi: 'Test proposal description',
      dosenPembimbingId: '550e8400-e29b-41d4-a716-446655440001', // Sample UUID
    };
    result = await makeRequest(`${API_BASE}/proposals`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newProposal),
    });
    logTest('Proposals', '/api/v1/proposals', 'POST', role, result);
    
    if (result.ok && result.data?.data?.id) {
      testIds.proposalId = result.data.data.id;
    }
  }

  // Get proposal by ID
  if (testIds.proposalId) {
    result = await makeRequest(`${API_BASE}/proposals/${testIds.proposalId}`, { headers });
    logTest('Proposals', '/api/v1/proposals/:id', 'GET', role, result);

    // Update proposal
    result = await makeRequest(`${API_BASE}/proposals/${testIds.proposalId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ deskripsi: 'Updated description' }),
    });
    logTest('Proposals', '/api/v1/proposals/:id', 'PATCH', role, result);

    // Submit proposal (mahasiswa only)
    if (role === 'mahasiswa') {
      result = await makeRequest(`${API_BASE}/proposals/${testIds.proposalId}/submit`, {
        method: 'POST',
        headers,
      });
      logTest('Proposals', '/api/v1/proposals/:id/submit', 'POST', role, result);
    }

    // Approve proposal (dosen only)
    if (role === 'dosen') {
      result = await makeRequest(`${API_BASE}/proposals/${testIds.proposalId}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      logTest('Proposals', '/api/v1/proposals/:id/approve', 'POST', role, result);
    }

    // Reject proposal (dosen only)
    if (role === 'dosen') {
      result = await makeRequest(`${API_BASE}/proposals/${testIds.proposalId}/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ alasanPenolakan: 'Test rejection' }),
      });
      logTest('Proposals', '/api/v1/proposals/:id/reject', 'POST', role, result);
    }

    // Request revision (dosen only)
    if (role === 'dosen') {
      result = await makeRequest(`${API_BASE}/proposals/${testIds.proposalId}/revision`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ catatanRevisi: 'Test revision notes' }),
      });
      logTest('Proposals', '/api/v1/proposals/:id/revision', 'POST', role, result);
    }
  }
}

// Test bimbingan endpoints
async function testBimbinganEndpoints(role) {
  console.log('\n' + '='.repeat(80));
  console.log(`📋 TESTING BIMBINGAN ENDPOINTS - ${role.toUpperCase()}`);
  console.log('='.repeat(80));

  const token = tokens[role];
  const headers = { Authorization: `Bearer ${token}` };

  // Get all bimbingan
  let result = await makeRequest(`${API_BASE}/bimbingan`, { headers });
  logTest('Bimbingan', '/api/v1/bimbingan', 'GET', role, result);
  
  if (result.ok && result.data?.data?.length > 0) {
    testIds.bimbinganId = result.data.data[0].id;
  }

  // Get upcoming
  result = await makeRequest(`${API_BASE}/bimbingan/upcoming`, { headers });
  logTest('Bimbingan', '/api/v1/bimbingan/upcoming', 'GET', role, result);

  // Get history
  if (testIds.proposalId) {
    result = await makeRequest(`${API_BASE}/bimbingan/history/${testIds.proposalId}`, { headers });
    logTest('Bimbingan', '/api/v1/bimbingan/history/:proposalId', 'GET', role, result);
  }

  // Create bimbingan
  if (testIds.proposalId) {
    const newBimbingan = {
      proposalId: testIds.proposalId,
      tanggal: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      topik: 'Test bimbingan topic',
      catatan: 'Test notes',
    };
    result = await makeRequest(`${API_BASE}/bimbingan`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newBimbingan),
    });
    logTest('Bimbingan', '/api/v1/bimbingan', 'POST', role, result);
    
    if (result.ok && result.data?.data?.id) {
      testIds.bimbinganId = result.data.data.id;
    }
  }

  // Get bimbingan by ID
  if (testIds.bimbinganId) {
    result = await makeRequest(`${API_BASE}/bimbingan/${testIds.bimbinganId}`, { headers });
    logTest('Bimbingan', '/api/v1/bimbingan/:id', 'GET', role, result);

    // Update bimbingan
    result = await makeRequest(`${API_BASE}/bimbingan/${testIds.bimbinganId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ catatan: 'Updated notes' }),
    });
    logTest('Bimbingan', '/api/v1/bimbingan/:id', 'PATCH', role, result);

    // Start bimbingan
    result = await makeRequest(`${API_BASE}/bimbingan/${testIds.bimbinganId}/start`, {
      method: 'POST',
      headers,
    });
    logTest('Bimbingan', '/api/v1/bimbingan/:id/start', 'POST', role, result);

    // Finish bimbingan (dosen only)
    if (role === 'dosen') {
      result = await makeRequest(`${API_BASE}/bimbingan/${testIds.bimbinganId}/finish`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          hasilBimbingan: 'Test result',
          tugasSelanjutnya: 'Test task',
          nilaiProgress: 80,
        }),
      });
      logTest('Bimbingan', '/api/v1/bimbingan/:id/finish', 'POST', role, result);
    }

    // Cancel bimbingan
    result = await makeRequest(`${API_BASE}/bimbingan/${testIds.bimbinganId}/cancel`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ alasan: 'Test cancellation' }),
    });
    logTest('Bimbingan', '/api/v1/bimbingan/:id/cancel', 'POST', role, result);
  }
}

// Generate documentation
function generateDocumentation() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));

  const total = testResults.length;
  const passed = testResults.filter(r => r.result === '✅ PASS').length;
  const blocked = testResults.filter(r => r.result === '🔒 BLOCKED' || r.result === '🔒 UNAUTHORIZED').length;
  const failed = testResults.filter(r => r.result === '❌ FAIL').length;

  console.log(`\nTotal Endpoints Tested: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`🔒 Blocked (Security): ${blocked}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\nSuccess Rate: ${((passed / total) * 100).toFixed(2)}%`);
  console.log(`Functional Rate: ${(((passed + blocked) / total) * 100).toFixed(2)}%`);

  // Group by module
  const byModule = {};
  testResults.forEach(r => {
    if (!byModule[r.module]) byModule[r.module] = [];
    byModule[r.module].push(r);
  });

  console.log('\n📋 Results by Module:');
  Object.keys(byModule).forEach(module => {
    const results = byModule[module];
    const modulePassed = results.filter(r => r.result === '✅ PASS').length;
    const moduleBlocked = results.filter(r => r.result === '🔒 BLOCKED' || r.result === '🔒 UNAUTHORIZED').length;
    const moduleFailed = results.filter(r => r.result === '❌ FAIL').length;
    console.log(`\n${module}:`);
    console.log(`  Total: ${results.length} | ✅ ${modulePassed} | 🔒 ${moduleBlocked} | ❌ ${moduleFailed}`);
  });

  // Show failures
  const failures = testResults.filter(r => r.result === '❌ FAIL');
  if (failures.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failures.forEach(f => {
      console.log(`\n  ${f.method} ${f.endpoint} (${f.role})`);
      console.log(`  Status: ${f.status}`);
      console.log(`  Message: ${f.message}`);
    });
  }

  return {
    total,
    passed,
    blocked,
    failed,
    byModule,
    failures,
    allResults: testResults,
  };
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting SIBMO API Comprehensive Testing');
  console.log('Server: ' + BASE_URL);
  console.log('Time: ' + new Date().toISOString());

  try {
    // Test public endpoints
    await testPublicEndpoints();

    // Login all users
    await login('admin');
    await login('dosen');
    await login('mahasiswa');

    // Test with each role
    for (const role of ['admin', 'dosen', 'mahasiswa']) {
      if (tokens[role]) {
        await testAuthEndpoints(role);
        await testUserEndpoints(role);
        await testProposalEndpoints(role);
        await testBimbinganEndpoints(role);
      }
    }

    // Generate and save documentation
    const summary = generateDocumentation();
    
    // Save results to JSON
    const fs = await import('fs');
    fs.writeFileSync(
      'test-results-comprehensive.json',
      JSON.stringify(summary, null, 2)
    );
    console.log('\n✅ Test results saved to test-results-comprehensive.json');

  } catch (error) {
    console.error('\n❌ Test execution error:', error);
  }
}

// Run tests
runAllTests();
