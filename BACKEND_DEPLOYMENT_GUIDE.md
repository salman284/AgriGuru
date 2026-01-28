# Backend Deployment Guide - AgriGuru

## 🚀 Deployment Options

### Option 1: Railway (Recommended - Free Tier)
### Option 2: Render
### Option 3: Heroku
### Option 4: DigitalOcean/AWS/Azure

---

## 📦 Option 1: Railway (Easiest & Free)

### Step 1: Prepare Your Backend

1. **Create Procfile in `back/` directory:**
```bash
cd back
```

Create `Procfile` (no extension):
```
web: gunicorn main:app
```

2. **Update requirements.txt:**
Add gunicorn to `back/requirements.txt`:
```txt
Flask==2.3.3
pymongo==4.5.0
Flask-CORS==4.0.0
Werkzeug==2.3.7
python-dotenv==1.0.0
certifi
flask-socketio==5.3.6
schedule==1.2.0
twilio>=8.10.0
requests>=2.31.0
google-auth>=2.23.0
google-auth-oauthlib>=1.1.0
google-auth-httplib2>=0.1.1
gunicorn==21.2.0
eventlet==0.33.3
```

3. **Create runtime.txt (optional):**
```txt
python-3.11.0
```

### Step 2: Deploy to Railway

1. **Sign up at Railway:**
   - Go to https://railway.app/
   - Sign up with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your repos
   - Select your AgriGuru repository

3. **Configure Build:**
   - Root Directory: `back`
   - Start Command: `gunicorn main:app --bind 0.0.0.0:$PORT`

4. **Set Environment Variables:**
   In Railway dashboard, add these variables:
   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   SECRET_KEY=your_secret_key_here
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   SMTP_EMAIL=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   TWILIO_ACCOUNT_SID=your_twilio_sid (optional)
   TWILIO_AUTH_TOKEN=your_twilio_token (optional)
   TWILIO_WHATSAPP_NUMBER=+14155238886 (optional)
   ```

5. **Deploy:**
   - Click "Deploy"
   - Railway will automatically build and deploy
   - You'll get a URL like: `https://your-app.railway.app`

---

## 📦 Option 2: Render (Also Free)

### Step 1: Prepare Files

Same as Railway - create Procfile and update requirements.txt

### Step 2: Deploy to Render

1. **Sign up:**
   - Go to https://render.com/
   - Sign up with GitHub

2. **Create Web Service:**
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repo
   - Select AgriGuru repo

3. **Configure:**
   - Name: `agriguru-backend`
   - Root Directory: `back`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn main:app --bind 0.0.0.0:$PORT`
   - Instance Type: `Free`

4. **Add Environment Variables:**
   Same as Railway above

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment
   - You'll get: `https://agriguru-backend.onrender.com`

---

## 📦 Option 3: Quick Local Production Setup

### Using Gunicorn Locally

1. **Install Gunicorn:**
```bash
cd back
pip install gunicorn eventlet
```

2. **Run with Gunicorn:**
```bash
gunicorn -k eventlet -w 1 main:app --bind 0.0.0.0:5001
```

Or for SocketIO support:
```bash
gunicorn --worker-class eventlet -w 1 main:app --bind 0.0.0.0:5001
```

---

## 🔧 Update Frontend After Deployment

### Update Frontend Environment

Edit `frontend/.env`:

```env
# Change from localhost to your deployed backend URL
REACT_APP_API_URL=https://your-backend.railway.app
REACT_APP_SOCKET_URL=https://your-backend.railway.app
```

### Update CORS in Backend

Edit `back/main.py` - Update CORS origins:

```python
CORS(app, 
     origins=[
         "http://localhost:3000", 
         "http://127.0.0.1:3000",
         "https://your-frontend-domain.vercel.app",  # Add your frontend URL
         "https://your-frontend-domain.netlify.app"   # Or wherever you deploy frontend
     ], 
     supports_credentials=True, 
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
```

---

## 🔐 Important: Update Google OAuth Settings

After deploying backend, update Google Cloud Console:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins:**
   ```
   https://your-backend.railway.app
   https://your-frontend-domain.vercel.app
   ```
4. Add to **Authorized redirect URIs:**
   ```
   https://your-frontend-domain.vercel.app
   https://your-frontend-domain.vercel.app/login
   ```

---

## 📊 MongoDB Atlas Setup (Required)

Your MongoDB needs to be accessible from your deployed backend:

1. **Go to MongoDB Atlas:**
   - https://cloud.mongodb.com/

2. **Network Access:**
   - Click "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add specific Railway/Render IPs

3. **Get Connection String:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Add to environment variables

---

## ✅ Deployment Checklist

Before deploying:

- [ ] Created Procfile in `back/` directory
- [ ] Added gunicorn to requirements.txt
- [ ] MongoDB Atlas is configured for remote access
- [ ] All environment variables are ready
- [ ] CORS origins include deployment URLs
- [ ] Google OAuth redirect URIs updated
- [ ] Tested locally with gunicorn

After deploying:

- [ ] Backend is accessible at deployed URL
- [ ] Test API endpoints: `https://your-backend.com/api/check-auth`
- [ ] Frontend .env updated with backend URL
- [ ] Google login works from deployed frontend
- [ ] Database connections work
- [ ] SocketIO connections work (if using)

---

## 🐛 Common Issues

### Issue: "Module not found"
**Solution:** Make sure all dependencies in requirements.txt

### Issue: "Connection refused to MongoDB"
**Solution:** 
- Check MongoDB Atlas allows connections from 0.0.0.0/0
- Verify MONGO_URI is correct in environment variables

### Issue: "CORS errors"
**Solution:**
- Add your frontend URL to CORS origins in main.py
- Redeploy backend

### Issue: "Google OAuth redirect_uri_mismatch"
**Solution:**
- Add deployment URLs to Google Cloud Console
- Must match exactly (https vs http, trailing slash)

### Issue: "502 Bad Gateway"
**Solution:**
- Check logs in Railway/Render dashboard
- Make sure gunicorn is starting correctly
- Verify PORT environment variable is used

---

## 📝 Quick Commands Reference

### Install Production Dependencies
```bash
cd back
pip install gunicorn eventlet
pip install -r requirements.txt
```

### Test Locally with Gunicorn
```bash
gunicorn --worker-class eventlet -w 1 main:app --bind 0.0.0.0:5001
```

### View Railway Logs
```bash
railway logs
```

### Render Logs
Available in Render dashboard under "Logs" tab

---

## 🎯 Recommended: Railway + Vercel

**Backend:** Railway (Python Flask)
**Frontend:** Vercel (React)
**Database:** MongoDB Atlas (Free tier)

This combination gives you:
- ✅ Free tier for both
- ✅ Automatic deployments from GitHub
- ✅ Easy environment variable management
- ✅ Good performance
- ✅ Built-in monitoring

---

## 💰 Cost Comparison

| Service | Free Tier | Limitations |
|---------|-----------|-------------|
| Railway | $5 credit/month | ~500 hours runtime |
| Render | 750 hours/month | Sleeps after inactivity |
| Heroku | No free tier | Starts at $7/month |
| DigitalOcean | $200 credit (60 days) | After credit: $6/month |

---

## 🔗 Next Steps

1. Deploy backend to Railway/Render
2. Deploy frontend to Vercel/Netlify
3. Update environment variables
4. Test all features
5. Monitor logs for errors

Need help? Check the logs in your deployment platform's dashboard!

---

**Good luck with your deployment! 🚀🌾**
