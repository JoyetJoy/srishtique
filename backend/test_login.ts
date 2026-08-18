async function testDb() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/test-db');
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response text:', text.substring(0, 500));
  } catch (error) {
    console.error('Error:', error);
  }
}

testDb();
