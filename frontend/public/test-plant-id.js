// Test Plant.id API integration
// Run this in browser console or create a test component

async function testPlantIdIntegration() {
    console.log('🧪 Testing Plant.id API Integration...');
    
    // Check if API key is configured
    const apiKey = process.env.REACT_APP_PLANT_ID_API_KEY;
    console.log('API Key configured:', apiKey ? '✅ Yes' : '❌ No');
    
    if (!apiKey || apiKey === 'your_plant_id_api_key_here') {
        console.log('⚠️ Please configure Plant.id API key in .env file');
        console.log('📖 See PLANT_ID_API_SETUP.md for instructions');
        return;
    }
    
    try {
        // Test API connectivity
        const response = await fetch('https://api.plant.id/v3/kb/plants/name_search?q=tomato&limit=1', {
            method: 'GET',
            headers: {
                'Api-Key': apiKey,
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Plant.id API is working!', data);
            console.log('🎉 You can now set MOCK_AI_ANALYSIS = false to use real API');
        } else {
            console.log('❌ API Error:', response.status, await response.text());
        }
    } catch (error) {
        console.error('💥 Connection Error:', error);
        console.log('🔍 Check your internet connection and API key');
    }
}

// To use real Plant.id API instead of mock:
function enableRealAPI() {
    console.log('📝 To enable real Plant.id API:');
    console.log('1. Open src/services/cropAnalysisService.js');
    console.log('2. Change: MOCK_AI_ANALYSIS = false');
    console.log('3. Save the file');
    console.log('4. Upload crop images to test real disease detection!');
}

// Export for use
window.testPlantIdIntegration = testPlantIdIntegration;
window.enableRealAPI = enableRealAPI;

console.log('🌱 Plant.id test functions loaded!');
console.log('Run: testPlantIdIntegration() to test API');
console.log('Run: enableRealAPI() for instructions to enable real API');
