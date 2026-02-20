// Test script to verify student login
// Run this in browser console on login page

const testStudentLogin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'student@school.com',
        password: 'student123',
        role: 'student'
      })
    });
    
    const data = await response.json();
    console.log('Login test result:', data);
    
    if (response.ok) {
      console.log('✅ Student login successful');
      console.log('User role:', data.user.role);
      console.log('User name:', data.user.name);
      console.log('Token received:', !!data.token);
    } else {
      console.log('❌ Student login failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Login test error:', error);
  }
};

// Run the test
testStudentLogin();