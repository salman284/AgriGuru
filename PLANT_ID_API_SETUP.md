# How to Get Plant.id API Key

## Plant.id API Setup (Recommended for AgriGuru)

### 1. Sign Up for Plant.id
1. Go to https://web.plant.id/
2. Click "Get API Key" or "Sign Up"
3. Create an account with your email
4. Verify your email address

### 2. Get Your API Key
1. Log in to your Plant.id dashboard
2. Go to "API Keys" section
3. Create a new API key
4. Copy the API key

### 3. Choose a Plan
- **Free Plan**: 100 requests/month
- **Basic Plan**: $19/month for 1000 requests
- **Pro Plan**: $49/month for 5000 requests
- **Enterprise**: Custom pricing

### 4. Add to Your .env File
```
REACT_APP_PLANT_ID_API_KEY=your_actual_api_key_here
```

### 5. Features You Get
✅ **Plant Identification** - Identify crop types
✅ **Disease Detection** - Detect plant diseases
✅ **Health Assessment** - Overall plant health
✅ **Treatment Recommendations** - Actionable advice
✅ **Pest Identification** - Identify harmful insects
✅ **Crop-Specific Analysis** - Specialized for agriculture

## Alternative: Free Agricultural APIs

### If you prefer free options:

1. **iNaturalist API** (Free)
   - Plant identification only
   - No disease detection
   - Community-driven

2. **GBIF API** (Free)
   - Biodiversity data
   - Research purposes
   - Limited practical use

3. **Custom Mock System** (Current)
   - Works offline
   - Filename-based analysis
   - Good for development/testing

## Recommendation
For production use of AgriGuru, Plant.id API is the best choice because:
- ✅ Specialized for agricultural disease detection
- ✅ Provides treatment recommendations
- ✅ High accuracy for crop analysis
- ✅ Reliable service with good documentation
- ✅ Reasonable pricing for agricultural applications

## Setup Instructions
1. Get Plant.id API key (see above)
2. Add to `.env` file
3. Set `MOCK_AI_ANALYSIS = false` in cropAnalysisService.js
4. Test with real crop images
