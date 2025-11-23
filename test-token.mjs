// Quick test to debug token issue
const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v1`;

async function test() {
  // Login
  console.log('1. Logging in...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@sibmo.ac.id',
      password: 'Password123!',
    }),
  });
  
  const loginData = await loginRes.json();
  console.log('Login response:', JSON.stringify(loginData, null, 2));
  
  if (!loginData.data?.accessToken) {
    console.log('❌ No access token received');
    return;
  }
  
  const token = loginData.data.accessToken;
  console.log('\n2. Token received:', token.substring(0, 50) + '...');
  
  // Test profile endpoint
  console.log('\n3. Testing /auth/profile...');
  const profileRes = await fetch(`${API_BASE}/auth/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  console.log('Profile status:', profileRes.status);
  const profileData = await profileRes.json().catch(() => profileRes.text());
  console.log('Profile response:', JSON.stringify(profileData, null, 2));
  
  // Test users endpoint
  console.log('\n4. Testing /users...');
  const usersRes = await fetch(`${API_BASE}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  console.log('Users status:', usersRes.status);
  const usersData = await usersRes.json().catch(() => usersRes.text());
  console.log('Users response:', JSON.stringify(usersData, null, 2));
}

test();
