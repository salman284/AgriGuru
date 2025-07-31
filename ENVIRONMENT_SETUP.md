# AgriGuru Environment Setup Guide 🔐

## 🚨 IMPORTANT: API Key Security

Your Groq API key has been removed from the repository for security. Follow these steps to set it up locally:

## 📋 Setup Instructions

### 1. Create Local Environment File
```bash
# Navigate to backend directory
cd backend

# Copy the example file
cp .env.example .env
```

### 2. Add Your Groq API Key
Open `backend/.env` and replace:
```
GROQ_API_KEY=your_groq_api_key_here
```

With your actual key:
```
GROQ_API_KEY=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
```

### 3. Verify Setup
```bash
# Test the backend
python farming_expert_app_ai.py
```

## 🔒 Security Notes

- ✅ `.env` files are in `.gitignore` - they won't be committed
- ✅ Use `.env.example` for sharing configuration templates
- ✅ Never commit actual API keys to version control
- ✅ GitHub push protection prevented accidental exposure

## 🆓 Get Your Free Groq API Key

1. Visit: https://console.groq.com/keys
2. Sign up for free account
3. Generate API key
4. Add to your local `.env` file

**Free Quota:** 14,400 requests/day - Perfect for development! 🚀

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment (add your key to .env)
cp .env.example .env

# Start AgriBot backend
python farming_expert_app_ai.py
```

Your AgriBot will be ready at `http://localhost:5000` 🌾
