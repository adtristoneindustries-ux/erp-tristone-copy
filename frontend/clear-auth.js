// Clear authentication state script
// Run this if you want to force logout and start fresh

console.log('Clearing authentication state...');

// Clear localStorage
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('token');
  console.log('✓ Cleared token from localStorage');
}

// Clear sessionStorage
if (typeof sessionStorage !== 'undefined') {
  sessionStorage.removeItem('redirectUrl');
  console.log('✓ Cleared redirectUrl from sessionStorage');
}

console.log('Authentication state cleared. Refresh the page to start fresh.');