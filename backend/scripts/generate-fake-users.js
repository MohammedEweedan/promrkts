const axios = require('axios');

const API_URL = 'http://localhost:3003';
const ADMIN_EMAIL = '123@test.com'; // Replace with your admin email
const ADMIN_PASSWORD = '11223344'; // Replace with your admin password
const TOTAL_USERS = 75000;
const BATCH_SIZE = 200; // Max per request

async function generateFakeUsers() {
  try {
    // 1. Login as admin to get token
    console.log('Logging in as admin...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    
    const token = loginRes.data.data.accessToken;
    console.log('✓ Logged in successfully\n');

    // 2. Calculate number of batches needed
    const batches = Math.ceil(TOTAL_USERS / BATCH_SIZE);
    console.log(`Creating ${TOTAL_USERS} fake users in ${batches} batches...\n`);

    let totalCreated = 0;

    // 3. Create users in batches
    for (let i = 0; i < batches; i++) {
      const remaining = TOTAL_USERS - totalCreated;
      const count = Math.min(BATCH_SIZE, remaining);
      
      console.log(`Batch ${i + 1}/${batches}: Creating ${count} users...`);
      
      const res = await axios.post(
        `${API_URL}/admin/fakes/users`,
        {
          locale: 'ar', // Change to 'en' or 'fr' if needed
          count: count,
          domain: 'example.com',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      totalCreated += res.data.data.length;
      console.log(`✓ Created ${res.data.data.length} users (Total: ${totalCreated}/${TOTAL_USERS})\n`);

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Successfully created ${totalCreated} fake users!`);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

generateFakeUsers();
