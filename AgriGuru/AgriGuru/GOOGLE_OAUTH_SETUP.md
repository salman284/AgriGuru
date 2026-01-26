# Google OAuth Login Setup Guide

## Overview
This guide explains how to set up Google OAuth login for the AgriGuru application.

## Prerequisites
1. Google Cloud Console account
2. Domain or localhost setup for testing

## Setup Steps

### 1. Google Cloud Console Configuration

1. **Create a Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Note your project ID

2. **Enable APIs**
   - Go to "APIs & Services" > "Library"
   - Enable the following APIs:
     - Google+ API (deprecated but still works)
     - People API (recommended)
     - Identity and Access Management (IAM) API

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Select "Web application"
   - Add authorized origins:
     - `http://localhost:3000` (for development)
     - `http://127.0.0.1:3000` (for development)
     - Your production domain when ready
   - Add authorized redirect URIs:
     - `http://localhost:3000/login` (for development)
     - Your production login URL when ready
   - Save and copy the Client ID and Client Secret

### 2. Frontend Configuration

1. **Update Environment Variables**
   - Edit `frontend/.env.local`
   - Replace `your-google-client-id-here` with your actual Client ID:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
   ```

2. **Verify Implementation**
   - The Google login button is already added to the login page
   - The authentication context includes Google login functionality
   - The Google Auth service handles token verification

### 3. Backend Configuration

1. **Update Environment Variables**
   - Edit `back/.env`
   - Replace `your-google-client-id-here` with your actual Client ID:
   ```
   GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
   ```

2. **Install Dependencies**
   - The required packages are already listed in `requirements.txt`
   - Run: `pip install -r requirements.txt`

3. **Verify Implementation**
   - The `/api/google-login` endpoint is implemented
   - Google ID token verification is set up
   - User creation/authentication flow is complete

### 4. Database Considerations

The Google login implementation:
- Creates new users automatically if they don't exist
- Links Google accounts to existing users by email
- Stores Google ID and profile image
- Marks Google users as email-verified
- Does not require passwords for Google users

### 5. Security Notes

1. **Client ID Exposure**
   - Frontend Client IDs are public by design
   - Backend verification ensures security
   - Never expose Client Secrets in frontend

2. **Token Verification**
   - All Google ID tokens are verified server-side
   - Invalid tokens are rejected
   - User information is extracted from verified tokens only

### 6. Testing

1. **Development Testing**
   - Start both frontend and backend servers
   - Navigate to the login page
   - Click "Continue with Google"
   - Complete the Google authentication flow
   - Verify user creation/login in the database

2. **Production Deployment**
   - Update authorized origins and redirect URIs
   - Use HTTPS for production domains
   - Set production environment variables

## Troubleshooting

### Common Issues

1. **"Invalid Client ID" Error**
   - Verify the Client ID in environment variables
   - Check that the domain is in authorized origins
   - Ensure APIs are enabled in Google Cloud Console

2. **"Unauthorized" Error**
   - Check authorized redirect URIs
   - Verify the request origin matches authorized origins
   - Ensure CORS is properly configured

3. **Backend Token Verification Failure**
   - Verify Google auth libraries are installed
   - Check that GOOGLE_CLIENT_ID is set in backend environment
   - Ensure the ID token is being passed correctly

### Debug Tips

1. **Frontend Debugging**
   - Check browser console for API errors
   - Verify network requests to `/api/google-login`
   - Test with browser developer tools

2. **Backend Debugging**
   - Check server logs for Google token verification errors
   - Test the `/api/google-login` endpoint directly
   - Verify database connections and user creation

## File Structure

The Google login implementation includes:

```
frontend/
├── src/
│   ├── components/
│   │   └── GoogleLoginButton/
│   │       ├── GoogleLoginButton.jsx
│   │       ├── GoogleLoginButton.css
│   │       └── index.js
│   ├── contexts/
│   │   └── AuthContext.jsx (updated)
│   ├── services/
│   │   └── googleAuthService.js
│   └── pages/
│       └── login/
│           └── login.jsx (updated)
└── .env.local

back/
├── main.py (updated with /api/google-login endpoint)
├── requirements.txt (updated)
└── .env
```

## Next Steps

1. Replace placeholder Google Client IDs with real credentials
2. Test the integration thoroughly
3. Configure production domains and HTTPS
4. Consider adding Google sign-out functionality
5. Implement additional security measures as needed

## Support

For additional help:
- Check Google Cloud Console documentation
- Review Google Identity documentation
- Test with the Google OAuth 2.0 Playground