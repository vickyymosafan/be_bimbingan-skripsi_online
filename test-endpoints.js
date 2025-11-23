/* eslint-disable */
/**
 * Simple API Testing Script
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Test credentials
const users = {
  admin: { email: 'admin@sibmo.ac.id', password: 'Password123!' },
  dosen: { email: 'budi.santoso@dosen.ac.id', password: 'Password123!' },
  mahasiswa: {
    email: 'andi.pratama@mahasiswa.ac.id',
    password: 'Password123!',
  },
};

let tokens = {};
let testCount = 0;
let passCount = 0;
let failCount = 0;

async function test(name, fn) {
  testCount++;
  try {
    await fn();
    passCount++;
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    failCount++;
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

async function login() {
  console.log('\n=== Login All Users ===\n');

  for (const [role, creds] of Object.entries(users)) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, creds);
      // Check different possible response structures
      tokens[role] =
        response.data.accessToken ||
        response.data.data?.accessToken ||
        response.data.access_token;
      console.log(
        `✅ ${role.toUpperCase()} logged in - Token: ${tokens[role] ? 'OK' : 'MISSING'}`,
      );
      if (!tokens[role]) {
        console.log(
          'Response structure:',
          JSON.stringify(response.data, null, 2),
        );
      }
    } catch (error) {
      console.log(
        `❌ ${role.toUpperCase()} login failed: ${error.response?.data?.message || error.message}`,
      );
    }
  }
}

async function testAuth() {
  console.log('\n=== Testing Authentication ===\n');

  await test('Register new user', async () => {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      nama: 'Test User',
      email: `test${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'MAHASISWA',
      nim: `TEST${Date.now()}`,
    });
    if (response.status !== 201) throw new Error('Registration failed');
  });

  for (const [role, token] of Object.entries(tokens)) {
    await test(`${role} - Get profile`, async () => {
      try {
        const response = await axios.get(`${BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.data) throw new Error('No profile data');
      } catch (error) {
        console.log(`\nDebug ${role}:`, {
          token: token?.substring(0, 20) + '...',
          status: error.response?.status,
          message: error.response?.data?.message,
        });
        throw error;
      }
    });
  }
}

async function testUsers() {
  console.log('\n=== Testing Users ===\n');

  for (const [role, token] of Object.entries(tokens)) {
    await test(`${role} - Get all users`, async () => {
      const response = await axios.get(`${BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Admin should succeed, others should fail with 403
      if (role === 'admin') {
        if (response.status !== 200)
          throw new Error('Should succeed for admin');
      }
    });

    await test(`${role} - Get active dosen`, async () => {
      const response = await axios.get(`${BASE_URL}/users/dosen/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) throw new Error('Failed');
    });
  }
}

async function testProposals() {
  console.log('\n=== Testing Proposals ===\n');

  let proposalId = null;

  for (const [role, token] of Object.entries(tokens)) {
    await test(`${role} - Get all proposals`, async () => {
      const response = await axios.get(`${BASE_URL}/proposals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) throw new Error('Failed');
      if (response.data.data && response.data.data.length > 0) {
        proposalId = response.data.data[0].id;
      }
    });

    await test(`${role} - Get statistics`, async () => {
      const response = await axios.get(`${BASE_URL}/proposals/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) throw new Error('Failed');
    });

    if (role === 'mahasiswa') {
      await test(`${role} - Create proposal`, async () => {
        const response = await axios.post(
          `${BASE_URL}/proposals`,
          {
            judul: `Test Proposal ${Date.now()}`,
            deskripsi: 'Test description',
            bidangKajian: 'Software Engineering',
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.status !== 201) throw new Error('Failed');
        if (response.data.data?.id) {
          proposalId = response.data.data.id;
        }
      });
    }
  }

  if (proposalId) {
    console.log(`\nUsing proposal ID: ${proposalId}\n`);

    for (const [role, token] of Object.entries(tokens)) {
      await test(`${role} - Get proposal detail`, async () => {
        const response = await axios.get(
          `${BASE_URL}/proposals/${proposalId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.status !== 200) throw new Error('Failed');
      });
    }
  }
}

async function testBimbingan() {
  console.log('\n=== Testing Bimbingan ===\n');

  for (const [role, token] of Object.entries(tokens)) {
    await test(`${role} - Get all bimbingan`, async () => {
      const response = await axios.get(`${BASE_URL}/bimbingan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) throw new Error('Failed');
    });

    await test(`${role} - Get upcoming bimbingan`, async () => {
      const response = await axios.get(`${BASE_URL}/bimbingan/upcoming`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status !== 200) throw new Error('Failed');
    });
  }
}

async function runTests() {
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║   SIBMO API Testing Suite            ║');
  console.log('╚═══════════════════════════════════════╝');

  try {
    await login();
    await testAuth();
    await testUsers();
    await testProposals();
    await testBimbingan();

    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║   Test Summary                        ║');
    console.log('╚═══════════════════════════════════════╝\n');
    console.log(`Total Tests: ${testCount}`);
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(
      `Success Rate: ${((passCount / testCount) * 100).toFixed(2)}%\n`,
    );
  } catch (error) {
    console.error('\n❌ Test execution error:', error.message);
  }
}

runTests();
