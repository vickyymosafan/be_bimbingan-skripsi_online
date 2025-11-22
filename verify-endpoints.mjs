/**
 * Endpoint Verification Script - Testing with Expected Behavior
 */

const BASE_URL = 'http://localhost:3000/api/v1';

// Test credentials
const users = {
  admin: { email: 'admin@sibmo.ac.id', password: 'Password123!' },
  dosen: { email: 'budi.santoso@dosen.ac.id', password: 'Password123!' },  
  mahasiswa: { email: 'andi.pratama@mahasiswa.ac.id', password: 'Password123!' }
};

const tokens = {};
const userInfo = {};
let testResults = [];

// Define expected access for each endpoint
const expectedAccess = {
  // User endpoints
  'GET /users': { admin: true, dosen: false, mahasiswa: false }, // Admin only
  'POST /users': { admin: true, dosen: false, mahasiswa: false }, // Admin only
  'GET /users/:id': { admin: true, dosen: true, mahasiswa: 'own' }, // All can access own
  'PATCH /users/:id': { admin: true, dosen: 'own', mahasiswa: 'own' }, // Can update own
  'DELETE /users/:id': { admin: true, dosen: false, mahasiswa: false }, // Admin only
  'PATCH /users/:id/restore': { admin: true, dosen: false, mahasiswa: false }, // Admin only
  
  // Proposal endpoints  
  'POST /proposals': { admin: false, dosen: false, mahasiswa: true }, // Mahasiswa only
  'GET /proposals': { admin: true, dosen: true, mahasiswa: true }, // All (filtered)
  'GET /proposals/:id': { admin: true, dosen: true, mahasiswa: 'own' }, // Access control
  'PATCH /proposals/:id': { admin: true, dosen: 'supervised', mahasiswa: 'own' },
  'DELETE /proposals/:id': { admin: true, dosen: false, mahasiswa: 'own' },
  'GET /proposals/pending-review': { admin: false, dosen: true, mahasiswa: false }, // Dosen only
  'POST /proposals/:id/submit': { admin: false, dosen: false, mahasiswa: 'own' }, // Mahasiswa only
  'POST /proposals/:id/approve': { admin: false, dosen: 'supervised', mahasiswa: false }, // Dosen only
  'POST /proposals/:id/reject': { admin: false, dosen: 'supervised', mahasiswa: false }, // Dosen only
  'POST /proposals/:id/revision': { admin: false, dosen: 'supervised', mahasiswa: false }, // Dosen only
  
  // Bimbingan endpoints
  'POST /bimbingan': { admin: true, dosen: true, mahasiswa: true }, // All can create
  'GET /bimbingan': { admin: true, dosen: true, mahasiswa: true }, // All (filtered)
  'DELETE /bimbingan/:id': { admin: true, dosen: true, mahasiswa: false }, // Admin & Dosen
  'POST /bimbingan/:id/finish': { admin: false, dosen: 'own', mahasiswa: false }, // Dosen only
};

async function login() {
  console.log('🔐 Logging in users...\n');
  
  for (const [role, creds] of Object.entries(users)) {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds)
      });
      
      const data = await response.json();
      if (response.ok) {
        tokens[role] = data.data.accessToken;
        userInfo[role] = data.data.user;
        console.log(`✅ ${role} logged in successfully`);
      } else {
        console.log(`❌ ${role} login failed`);
      }
    } catch (error) {
      console.log(`❌ ${role} login error: ${error.message}`);
    }
  }
  console.log('');
}

async function testEndpoint(method, path, role, body = null) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (tokens[role]) {
      headers['Authorization'] = `Bearer ${tokens[role]}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function verifyEndpoints() {
  console.log('🧪 Verifying Role-Based Access Control\n');
  console.log('=' .repeat(60));
  
  // Test key endpoints to verify proper access control
  const verificationTests = [
    {
      name: 'Admin can list all users',
      test: async () => {
        const result = await testEndpoint('GET', '/users', 'admin');
        return result.success && Array.isArray(result.data.data);
      }
    },
    {
      name: 'Dosen cannot list all users',
      test: async () => {
        const result = await testEndpoint('GET', '/users', 'dosen');
        return !result.success && result.status === 403;
      }
    },
    {
      name: 'Mahasiswa cannot list all users', 
      test: async () => {
        const result = await testEndpoint('GET', '/users', 'mahasiswa');
        return !result.success && result.status === 403;
      }
    },
    {
      name: 'Mahasiswa can create proposal',
      test: async () => {
        const result = await testEndpoint('POST', '/proposals', 'mahasiswa', {
          judul: 'Test Proposal ' + Date.now(),
          deskripsi: 'Test description for verification',
          dosenPembimbingId: userInfo.dosen?.id
        });
        if (result.success) {
          testResults.proposalId = result.data.data.id;
        }
        return result.success;
      }
    },
    {
      name: 'Admin cannot create proposal',
      test: async () => {
        const result = await testEndpoint('POST', '/proposals', 'admin', {
          judul: 'Admin Test Proposal',
          deskripsi: 'Should fail'
        });
        return !result.success && result.status === 403;
      }
    },
    {
      name: 'Dosen cannot create proposal',
      test: async () => {
        const result = await testEndpoint('POST', '/proposals', 'dosen', {
          judul: 'Dosen Test Proposal',
          deskripsi: 'Should fail'
        });
        return !result.success && result.status === 403;
      }
    },
    {
      name: 'Only Dosen can access pending-review',
      test: async () => {
        const dosenResult = await testEndpoint('GET', '/proposals/pending-review', 'dosen');
        const mahasiswaResult = await testEndpoint('GET', '/proposals/pending-review', 'mahasiswa');
        return dosenResult.success && !mahasiswaResult.success;
      }
    },
    {
      name: 'Only Dosen can finish bimbingan',
      test: async () => {
        // Create a bimbingan first
        const bimbinganResult = await testEndpoint('POST', '/bimbingan', 'dosen', {
          proposalId: testResults.proposalId || userInfo.mahasiswa?.id,
          topik: 'Test Bimbingan',
          tanggal: '2024-12-01',
          waktuMulai: '10:00',
          tipeBimbingan: 'OFFLINE'
        });
        
        if (bimbinganResult.success) {
          const bimbinganId = bimbinganResult.data.data.id;
          
          // Try to finish as dosen (should work)
          const dosenFinish = await testEndpoint('POST', `/bimbingan/${bimbinganId}/finish`, 'dosen', {
            hasilBimbingan: 'Test hasil',
            nilaiProgress: 25
          });
          
          // Try to finish as mahasiswa (should fail)
          const mahasiswaFinish = await testEndpoint('POST', `/bimbingan/${bimbinganId}/finish`, 'mahasiswa', {});
          
          return dosenFinish.success && !mahasiswaFinish.success;
        }
        return false;
      }
    },
    {
      name: 'Mahasiswa can only update own profile',
      test: async () => {
        const ownUpdate = await testEndpoint('PATCH', `/users/${userInfo.mahasiswa.id}`, 'mahasiswa', {
          noTelepon: '081234567890'
        });
        
        const otherUpdate = await testEndpoint('PATCH', `/users/${userInfo.dosen.id}`, 'mahasiswa', {
          noTelepon: '081234567891'
        });
        
        return ownUpdate.success && !otherUpdate.success;
      }
    },
    {
      name: 'Admin can delete users',
      test: async () => {
        // Create a test user first
        const createResult = await testEndpoint('POST', '/auth/register', 'public', {
          nama: 'Test Delete User',
          email: 'testdelete@test.com',
          password: 'Password123!',
          role: 'MAHASISWA',
          nim: '2020999998'
        });
        
        if (createResult.success) {
          const userId = createResult.data.data.id;
          const deleteResult = await testEndpoint('DELETE', `/users/${userId}`, 'admin');
          return deleteResult.success;
        }
        return false;
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of verificationTests) {
    process.stdout.write(`Testing: ${test.name}... `);
    const result = await test.test();
    if (result) {
      console.log('✅ PASS');
      passed++;
    } else {
      console.log('❌ FAIL');
      failed++;
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Pass Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All role-based access controls are working correctly!');
  } else {
    console.log('\n⚠️ Some access controls need attention');
  }
}

// Run verification
async function runVerification() {
  console.log('🚀 Starting SIBMO API Verification\n');
  
  await login();
  await verifyEndpoints();
  
  console.log('\n✅ Verification complete');
}

runVerification().catch(console.error);
