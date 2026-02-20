// Test student login
const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@school.com',
        password: 'student123',
        role: 'student'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Student login successful:', data.user);
      return true;
    } else {
      console.log('❌ Login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
};

testLogin();