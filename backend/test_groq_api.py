"""
Test Groq API Key and Connection
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_groq_api():
    """Test Groq API key and connection"""
    print("🔍 Testing Groq API Connection...")
    print("=" * 50)
    
    # Get API key
    groq_api_key = os.getenv('GROQ_API_KEY')
    
    if not groq_api_key:
        print("❌ No GROQ_API_KEY found in .env file")
        return False
    
    print(f"🔑 API Key found: {groq_api_key[:10]}...{groq_api_key[-5:]}")
    print(f"📏 API Key length: {len(groq_api_key)} characters")
    
    # Valid Groq API keys are usually 56 characters long
    if len(groq_api_key) < 50:
        print("⚠️ API key seems too short (should be ~56 characters)")
    elif len(groq_api_key) > 60:
        print("⚠️ API key seems too long (should be ~56 characters)")
    else:
        print("✅ API key length looks good")
    
    # Test the API
    print("\n🌐 Testing API connection...")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {groq_api_key}"
    }
    
    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "user", "content": "Say hello"}
        ],
        "max_tokens": 50
    }
    
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=10
        )
        
        print(f"📨 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Groq API is working!")
            print(f"🤖 Response: {data['choices'][0]['message']['content']}")
            return True
        elif response.status_code == 401:
            print("❌ Invalid API key - 401 Unauthorized")
            print(f"📝 Error: {response.text}")
            print("\n💡 Solutions:")
            print("1. Get a new API key from https://console.groq.com")
            print("2. Make sure the key starts with 'gsk_'")
            print("3. Copy the FULL key (usually 56 characters)")
            return False
        elif response.status_code == 429:
            print("⚠️ Rate limit exceeded - try again later")
            return False
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"📝 Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def suggest_fix():
    """Suggest how to fix the Groq API key"""
    print("\n🔧 How to Fix Groq API Key:")
    print("=" * 50)
    print("1. Go to https://console.groq.com")
    print("2. Sign in (free account)")
    print("3. Go to API Keys section")
    print("4. Create a new API key")
    print("5. Copy the COMPLETE key (starts with 'gsk_')")
    print("6. Replace GROQ_API_KEY in your .env file")
    print("7. Restart your AgriBot")
    
    print("\n📋 Example of valid key format:")
    print("GROQ_API_KEY=gsk_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890AbCdEfGhIjKlMn")
    
    print("\n✅ Once fixed, your AgriBot will use:")
    print("• Fast Groq AI responses (llama3-8b-8192)")
    print("• 14,400 free requests per day")
    print("• Professional farming advice")

if __name__ == "__main__":
    success = test_groq_api()
    if not success:
        suggest_fix()
