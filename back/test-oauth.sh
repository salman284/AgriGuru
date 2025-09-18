#!/bin/bash
# Quick test script for Google OAuth

echo "🧪 Testing Google OAuth Integration"
echo "=================================="

echo "1. Checking environment files..."

# Check frontend config
if grep -q "your-google-client-id-here" "../frontend/.env.local" 2>/dev/null; then
    echo "⚠️  Frontend: Client ID not configured yet"
else
    echo "✅ Frontend: Client ID configured"
fi

# Check backend config  
if grep -q "your-google-client-id-here" ".env" 2>/dev/null; then
    echo "⚠️  Backend: Client ID not configured yet"
else
    echo "✅ Backend: Client ID configured"
fi

echo ""
echo "2. Testing backend endpoint..."
curl -X POST http://localhost:5001/api/google-login \
  -H "Content-Type: application/json" \
  -d '{"idToken":"test"}' 2>/dev/null || echo "⚠️  Backend not running on port 5001"

echo ""
echo "3. Next steps:"
echo "   - Update CLIENT_ID in both .env files"
echo "   - Start backend: python main.py"  
echo "   - Start frontend: npm start"
echo "   - Test login at: http://localhost:3000/login"