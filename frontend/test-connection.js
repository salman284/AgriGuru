// Test frontend-backend connection
// Run this in browser console: node test-connection.js

const testConnection = async () => {
  console.log('🔍 Testing KisanMitra backend connection...');
  
  const API_BASE_URL = 'http://localhost:5000/api';
  
  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch('http://localhost:5000/');
    console.log('Health check status:', healthResponse.status);
    const healthText = await healthResponse.text();
    console.log('Health response:', healthText);
    
    // Test 2: Chat API
    console.log('\n2. Testing chat API...');
    const chatResponse = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello Annapurna, how can you help me?',
        language: 'en'
      })
    });
    
    console.log('Chat API status:', chatResponse.status);
    
    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('✅ Chat API working!');
      console.log('Response:', chatData.advice.substring(0, 200) + '...');
    } else {
      console.log('❌ Chat API failed');
      console.log('Error:', await chatResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
};

testConnection();