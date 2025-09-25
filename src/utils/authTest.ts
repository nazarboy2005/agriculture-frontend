// Simple utility to test authentication
export const testAuth = () => {
  const token = localStorage.getItem('auth_token');
  console.log('Current token:', token);
  
  if (!token) {
    console.error('No authentication token found!');
    return false;
  }
  
  // Test if token is valid by making a simple API call
  fetch('http://localhost:9090/api/v1/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      console.log('✅ Authentication is working!');
      return response.json();
    } else {
      console.error('❌ Authentication failed:', response.status);
    }
  })
  .then(data => {
    if (data) {
      console.log('User data:', data);
    }
  })
  .catch(error => {
    console.error('❌ API call failed:', error);
  });
  
  return true;
};

// Call this function to test authentication
export const checkAuthStatus = () => {
  console.log('🔍 Checking authentication status...');
  testAuth();
};
