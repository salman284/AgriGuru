// Open browser console (F12) and paste this to test the API directly

console.log('🔍 Testing Annapurna API from browser...');

// Test the API endpoint that the frontend should be calling
fetch('http://localhost:5000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'How to grow rice?',
    context: {}
  })
})
.then(response => {
  console.log('Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ API Response received:');
  console.log('Success:', data.success);
  console.log('Provider:', data.provider);
  console.log('Model type:', data.model_type);
  console.log('Fallback used:', data.fallback_used);
  console.log('First 200 chars of advice:', data.advice.substring(0, 200));
})
.catch(error => {
  console.error('❌ API call failed:', error);
});