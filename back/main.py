
from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import certifi
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import secrets
import re
import smtplib
import random
import string
import os
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from bson.objectid import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
# --- SocketIO imports ---
from flask_socketio import SocketIO, join_room, leave_room, emit
# --- Additional imports for WhatsApp agent ---
import urllib.parse

# --- Simple WhatsApp function for JotForm integration ---
def send_whatsapp_alert(phone_number, message):
    """Simple WhatsApp alert function - placeholder"""
    try:
        from twilio.rest import Client
        import os
        from dotenv import load_dotenv
        
        load_dotenv()
        account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        twilio_number = os.getenv('TWILIO_WHATSAPP_NUMBER')
        
        if not all([account_sid, auth_token, twilio_number]):
            return {"success": False, "error": "WhatsApp credentials not configured"}
        
        client = Client(account_sid, auth_token)
        
        # Ensure phone number format
        if not phone_number.startswith('+'):
            phone_number = '+' + phone_number
        
        # Add AgriGuru branding
        branded_message = f"🌾 *AgriGuru Farming Assistant* 🌾\n\n{message}"
        
        twilio_message = client.messages.create(
            body=branded_message,
            from_=f"whatsapp:{twilio_number}",
            to=f"whatsapp:{phone_number}"
        )
        
        return {
            "success": True,
            "message_sid": twilio_message.sid,
            "status": twilio_message.status
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

# --- Mock functions for other WhatsApp services ---
def send_weather_alert(phone_number, location, condition, temperature):
    message = f"🌤️ Weather Alert for {location}: {condition}, {temperature}°C"
    return send_whatsapp_alert(phone_number, message)

def send_market_price_alert(phone_number, crop, price, market):
    message = f"💰 Market Alert - {crop}: ₹{price}/quintal at {market}"
    return send_whatsapp_alert(phone_number, message)

def send_crop_disease_alert(phone_number, crop, disease, action):
    message = f"🦠 Crop Alert - {crop}: {disease}. Action: {action}"
    return send_whatsapp_alert(phone_number, message)

def send_test_message(phone_number):
    message = "🌾 AgriGuru Test Message - WhatsApp alerts are working!"
    return send_whatsapp_alert(phone_number, message)

# --- Mock agricultural data services ---
def fetch_weather_data(location):
    return {"condition": "Sunny", "temperature": 28, "humidity": 65}

def check_crop_health(crop, location):
    return {"disease_name": "Leaf spot", "recommended_action": "Apply fungicide"}


app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"], 
     supports_credentials=True, 
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# --- Initialize SocketIO ---
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"], async_mode="threading")

# Configuration
app.config['SECRET_KEY'] = secrets.token_hex(16)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['MONGO_URI'] = 'mongodb+srv://shriompal2435:N2Ry3EfnFDU4FQpg@agrigurudb.lttawpv.mongodb.net/agrigurudb?retryWrites=true&w=majority'

 # Connect to MongoDB with certifi CA bundle for SSL, explicit TLS, and allow invalid certificates (debug only)
client = MongoClient(app.config['MONGO_URI'], tls=True, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)

db = client.agrigurudb
chat_messages_collection = db.chat_messages  # New collection for group chat messages
users_collection = db.users
otp_collection = db.otp_codes

# Email configuration for OTP
EMAIL_CONFIG = {
    'smtp_server': 'smtp.gmail.com',
    'smtp_port': 587,
    'email': 'YOUR_GMAIL_HERE@gmail.com',           # ⚠️ REPLACE: Your actual Gmail address
    'password': 'YOUR_16_CHAR_APP_PASSWORD_HERE'    # ⚠️ REPLACE: Your Gmail App Password (16 chars, no spaces)
}

# OTP Helper Functions
def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def send_email_otp(email, otp):
    """Send OTP via email"""
    try:
        # 🧪 DEVELOPMENT MODE: Mock email sending
        if EMAIL_CONFIG['email'] == 'YOUR_GMAIL_HERE@gmail.com':
            print(f"📧 MOCK EMAIL SENT to {email}")
            print(f"🔢 OTP CODE: {otp}")
            print(f"⏰ Expires in 10 minutes")
            print("🔧 To enable real emails, update EMAIL_CONFIG in main.py")
            return True
        
        # Check if email config is set up
        if EMAIL_CONFIG['email'].startswith('YOUR_') or EMAIL_CONFIG['password'].startswith('YOUR_'):
            print("❌ EMAIL ERROR: Please update EMAIL_CONFIG with your actual Gmail credentials!")
            print("🔧 Steps to fix:")
            print("1. Enable 2FA on your Gmail account")
            print("2. Generate App Password at: https://myaccount.google.com/security")
            print("3. Update EMAIL_CONFIG in main.py with your actual credentials")
            return False
        
        msg = MIMEMultipart()
        msg['From'] = EMAIL_CONFIG['email']
        msg['To'] = email
        msg['Subject'] = "AgriGuru - Your Verification Code"
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">🌱 AgriGuru</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Verify Your Account</h2>
                <p style="color: #666; font-size: 16px;">Your verification code is:</p>
                <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #4CAF50; font-size: 32px; margin: 0; letter-spacing: 5px;">{otp}</h1>
                </div>
                <p style="color: #666;">This code will expire in 10 minutes.</p>
                <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
            </div>
            <div style="background: #333; padding: 15px; text-align: center;">
                <p style="color: #ccc; margin: 0; font-size: 14px;">© 2025 AgriGuru - Your Farming Assistant</p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        print(f"📧 Attempting to send OTP to {email} from {EMAIL_CONFIG['email']}")
        
        server = smtplib.SMTP(EMAIL_CONFIG['smtp_server'], EMAIL_CONFIG['smtp_port'])
        server.starttls()
        server.login(EMAIL_CONFIG['email'], EMAIL_CONFIG['password'])
        text = msg.as_string()
        server.sendmail(EMAIL_CONFIG['email'], email, text)
        server.quit()
        
        print(f"✅ OTP email sent successfully to {email}")
        return True
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ SMTP Authentication Error: {e}")
        print("🔧 Fix: Check your Gmail App Password is correct")
        return False
    except smtplib.SMTPException as e:
        print(f"❌ SMTP Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Email OTP send error: {e}")
        return False

def store_otp(email, otp, purpose='login'):
    """Store OTP in database"""
    otp_doc = {
        'email': email,
        'otp': otp,
        'purpose': purpose,
        'created_at': datetime.utcnow(),
        'expires_at': datetime.utcnow() + timedelta(minutes=10),
        'used': False
    }
    
    # Remove any existing OTPs for this email and purpose
    otp_collection.delete_many({'email': email, 'purpose': purpose})
    
    # Store new OTP
    result = otp_collection.insert_one(otp_doc)
    return str(result.inserted_id)

def verify_otp(email, otp, purpose='login'):
    """Verify OTP code"""
    otp_doc = otp_collection.find_one({
        'email': email,
        'otp': otp,
        'purpose': purpose,
        'used': False,
        'expires_at': {'$gt': datetime.utcnow()}
    })
    
    if otp_doc:
        # Mark OTP as used
        otp_collection.update_one(
            {'_id': otp_doc['_id']},
            {'$set': {'used': True}}
        )
        return True
    return False

# Helper functions for validation
def is_valid_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_strong_password(password):
    """Check password strength"""
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    return True

@app.route('/')
def hello_world():
    return jsonify({"message": "AgriGuru Backend API", "status": "running"})

@app.route('/api/signup', methods=['POST'])
def signup():
    """User registration endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'full_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"success": False, "message": f"{field} is required"}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        full_name = data['full_name'].strip()
        phone = data.get('phone', '').strip()
        
        # Validate email format
        if not is_valid_email(email):
            return jsonify({"success": False, "message": "Invalid email format"}), 400
        
        # Check if user already exists
        if users_collection.find_one({"email": email}):
            return jsonify({"success": False, "message": "User already exists with this email"}), 400
        
        # Validate password strength
        if not is_strong_password(password):
            return jsonify({
                "success": False, 
                "message": "Password must be at least 8 characters with uppercase, lowercase, and number"
            }), 400
        
        # Hash password
        password_hash = generate_password_hash(password)
        
        # Create user document
        user_doc = {
            "email": email,
            "password_hash": password_hash,
            "full_name": full_name,
            "phone": phone,
            "created_at": datetime.utcnow(),
            "last_login": None,
            "is_active": True,
            "profile": {
                "farm_location": None,
                "farm_size": None,
                "crops": [],
                "language_preference": "en"
            }
        }
        
        # Insert user into database
        result = users_collection.insert_one(user_doc)
        
        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "user_id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Registration failed: {str(e)}"}), 500

@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    """Send OTP for verification"""
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        purpose = data.get('purpose', 'login')  # 'login', 'signup', 'reset'
        
        if not email:
            return jsonify({"success": False, "message": "Email is required"}), 400
        
        if not is_valid_email(email):
            return jsonify({"success": False, "message": "Invalid email format"}), 400
        
        # For login, check if user exists
        if purpose == 'login':
            user = users_collection.find_one({"email": email})
            if not user:
                return jsonify({"success": False, "message": "No account found with this email"}), 404
        
        # For signup, check if user doesn't exist
        elif purpose == 'signup':
            user = users_collection.find_one({"email": email})
            if user:
                return jsonify({"success": False, "message": "Account already exists with this email"}), 400
        
        # Generate and send OTP
        otp = generate_otp()
        
        # Store OTP in database
        store_otp(email, otp, purpose)
        
        # Send OTP via email
        if send_email_otp(email, otp):
            return jsonify({
                "success": True,
                "message": f"OTP sent to {email}",
                "email": email,
                "expires_in": 600  # 10 minutes
            }), 200
        else:
            return jsonify({"success": False, "message": "Failed to send OTP"}), 500
            
    except Exception as e:
        return jsonify({"success": False, "message": f"OTP send failed: {str(e)}"}), 500

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp_endpoint():
    """Verify OTP code"""
    try:
        data = request.get_json()
        email = data.get('email', '').lower().strip()
        otp = data.get('otp', '').strip()
        purpose = data.get('purpose', 'login')
        
        if not email or not otp:
            return jsonify({"success": False, "message": "Email and OTP are required"}), 400
        
        # Verify OTP
        if verify_otp(email, otp, purpose):
            if purpose == 'login':
                # For login, create session
                user = users_collection.find_one({"email": email})
                if user:
                    # Update last login
                    users_collection.update_one(
                        {"_id": user["_id"]},
                        {"$set": {"last_login": datetime.utcnow()}}
                    )
                    
                    # Create session
                    session.permanent = True
                    session['user_id'] = str(user["_id"])
                    session['user_email'] = user["email"]
                    
                    return jsonify({
                        "success": True,
                        "message": "Login successful",
                        "user": {
                            "id": str(user["_id"]),
                            "email": user["email"],
                            "full_name": user["full_name"],
                            "phone": user.get("phone"),
                            "profile": user.get("profile", {})
                        }
                    }), 200
                else:
                    return jsonify({"success": False, "message": "User not found"}), 404
            else:
                # For signup or reset, return success
                return jsonify({
                    "success": True,
                    "message": "OTP verified successfully",
                    "email": email
                }), 200
        else:
            return jsonify({"success": False, "message": "Invalid or expired OTP"}), 400
            
    except Exception as e:
        return jsonify({"success": False, "message": f"OTP verification failed: {str(e)}"}), 500

@app.route('/api/signup-with-otp', methods=['POST'])
def signup_with_otp():
    """Complete signup after OTP verification"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'full_name', 'otp']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"success": False, "message": f"{field} is required"}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        full_name = data['full_name'].strip()
        phone = data.get('phone', '').strip()
        otp = data['otp'].strip()
        
        # Verify OTP first
        if not verify_otp(email, otp, 'signup'):
            return jsonify({"success": False, "message": "Invalid or expired OTP"}), 400
        
        # Check if user already exists (double check)
        if users_collection.find_one({"email": email}):
            return jsonify({"success": False, "message": "User already exists with this email"}), 400
        
        # Validate password strength
        if not is_strong_password(password):
            return jsonify({
                "success": False, 
                "message": "Password must be at least 8 characters with uppercase, lowercase, and number"
            }), 400
        
        # Hash password and create user
        password_hash = generate_password_hash(password)
        
        user_doc = {
            "email": email,
            "password_hash": password_hash,
            "full_name": full_name,
            "phone": phone,
            "created_at": datetime.utcnow(),
            "last_login": None,
            "is_active": True,
            "email_verified": True,  # Since they verified with OTP
            "profile": {
                "farm_location": None,
                "farm_size": None,
                "crops": [],
                "language_preference": "en"
            },
            "whatsapp": {
                "number": phone,  # Default to the provided phone number
                "enabled": False,  # Requires user opt-in
                "verified": False,  # Will be verified separately
                "alert_preferences": {
                    "weather": True,
                    "market_prices": True,
                    "crop_diseases": True
                }
            }
        }
        
        # Insert user into database
        result = users_collection.insert_one(user_doc)
        
        # Auto-login after successful signup
        session.permanent = True
        session['user_id'] = str(result.inserted_id)
        session['user_email'] = email
        
        return jsonify({
            "success": True,
            "message": "Account created successfully",
            "user": {
                "id": str(result.inserted_id),
                "email": email,
                "full_name": full_name,
                "phone": phone,
                "profile": user_doc["profile"],
                "whatsapp": user_doc["whatsapp"]
            }
        }), 201
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Signup failed: {str(e)}"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({"success": False, "message": "Email and password are required"}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Find user in database
        user = users_collection.find_one({"email": email})
        
        if not user:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401
        
        if not user.get("is_active", True):
            return jsonify({"success": False, "message": "Account is deactivated"}), 401
        
        # Check password
        if check_password_hash(user["password_hash"], password):
            # Update last login
            users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"last_login": datetime.utcnow()}}
            )
            
            # Create session
            session.permanent = True
            session['user_id'] = str(user["_id"])
            session['user_email'] = user["email"]
            
            return jsonify({
                "success": True,
                "message": "Login successful",
                "user": {
                    "id": str(user["_id"]),
                    "email": user["email"],
                    "full_name": user["full_name"],
                    "phone": user.get("phone"),
                    "profile": user.get("profile", {})
                }
            }), 200
        else:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401
            
    except Exception as e:
        return jsonify({"success": False, "message": f"Login failed: {str(e)}"}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """User logout endpoint"""
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"}), 200

@app.route('/api/google-login', methods=['POST'])
def google_login():
    """Google OAuth login endpoint"""
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        
        data = request.get_json()
        
        if not data.get('idToken'):
            return jsonify({"success": False, "message": "Google ID token is required"}), 400
        
        # Verify the Google ID token
        try:
            # Note: In production, replace with your actual Google client ID
            CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
            if not CLIENT_ID:
                return jsonify({"success": False, "message": "Google OAuth not configured"}), 500
            
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                data['idToken'], 
                requests.Request(), 
                CLIENT_ID
            )
            
            # Extract user information
            google_id = idinfo['sub']
            email = idinfo['email']
            name = idinfo.get('name', '')
            picture = idinfo.get('picture', '')
            
        except ValueError as e:
            return jsonify({"success": False, "message": "Invalid Google token"}), 401
        
        # Check if user exists
        user = users_collection.find_one({"email": email.lower()})
        
        if user:
            # User exists, update Google ID if not set
            if not user.get('google_id'):
                users_collection.update_one(
                    {"_id": user["_id"]},
                    {"$set": {"google_id": google_id, "last_login": datetime.utcnow()}}
                )
            else:
                # Just update last login
                users_collection.update_one(
                    {"_id": user["_id"]},
                    {"$set": {"last_login": datetime.utcnow()}}
                )
        else:
            # Create new user
            user_data = {
                "email": email.lower(),
                "full_name": name,
                "google_id": google_id,
                "profile_image": picture,
                "is_active": True,
                "email_verified": True,  # Google accounts are pre-verified
                "password_hash": None,  # No password for Google users
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow(),
                "profile": {
                    "farm_location": "",
                    "farm_size": "",
                    "crops": [],
                    "language_preference": "en"
                }
            }
            
            result = users_collection.insert_one(user_data)
            user_data["_id"] = result.inserted_id
            user = user_data
        
        # Create session
        session.permanent = True
        session['user_id'] = str(user["_id"])
        session['user_email'] = user["email"]
        
        return jsonify({
            "success": True,
            "message": "Google login successful",
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "full_name": user["full_name"],
                "phone": user.get("phone", ""),
                "profile_image": user.get("profile_image", ""),
                "profile": user.get("profile", {})
            }
        }), 200
        
    except ImportError:
        return jsonify({"success": False, "message": "Google authentication not available"}), 500
    except Exception as e:
        return jsonify({"success": False, "message": f"Google login failed: {str(e)}"}), 500

@app.route('/api/profile', methods=['GET'])
def get_profile():
    """Get user profile"""
    if 'user_id' not in session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    try:
        from bson.objectid import ObjectId
        user = users_collection.find_one({"_id": ObjectId(session['user_id'])})
        
        if user:
            # Remove sensitive data
            del user["password_hash"]
            user["_id"] = str(user["_id"])
            
            return jsonify({"success": True, "user": user}), 200
        else:
            return jsonify({"success": False, "message": "User not found"}), 404
            
    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching profile: {str(e)}"}), 500

@app.route('/api/profile', methods=['PUT'])
def update_profile():
    """Update user profile"""
    if 'user_id' not in session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    try:
        from bson.objectid import ObjectId
        data = request.get_json()
        
        # Update profile fields
        update_data = {
            "profile.farm_location": data.get("farm_location"),
            "profile.farm_size": data.get("farm_size"),
            "profile.crops": data.get("crops", []),
            "profile.language_preference": data.get("language_preference", "en"),
            "updated_at": datetime.utcnow()
        }
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        result = users_collection.update_one(
            {"_id": ObjectId(session['user_id'])},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            return jsonify({"success": True, "message": "Profile updated successfully"}), 200
        else:
            return jsonify({"success": False, "message": "No changes made"}), 400
            
    except Exception as e:
        return jsonify({"success": False, "message": f"Profile update failed: {str(e)}"}), 500

@app.route('/api/change-password', methods=['POST'])
def change_password():
    """Change user password"""
    if 'user_id' not in session:
        return jsonify({"success": False, "message": "Not authenticated"}), 401
    
    try:
        from bson.objectid import ObjectId
        data = request.get_json()
        
        if not data.get('old_password') or not data.get('new_password'):
            return jsonify({"success": False, "message": "Old and new passwords are required"}), 400
        
        user = users_collection.find_one({"_id": ObjectId(session['user_id'])})
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
        
        # Check old password
        if not check_password_hash(user["password_hash"], data['old_password']):
            return jsonify({"success": False, "message": "Current password is incorrect"}), 400
        
        # Validate new password
        if not is_strong_password(data['new_password']):
            return jsonify({
                "success": False, 
                "message": "New password must be at least 8 characters with uppercase, lowercase, and number"
            }), 400
        
        # Hash new password
        new_password_hash = generate_password_hash(data['new_password'])
        
        # Update password
        users_collection.update_one(
            {"_id": ObjectId(session['user_id'])},
            {"$set": {
                "password_hash": new_password_hash,
                "password_changed_at": datetime.utcnow()
            }}
        )
        
        return jsonify({"success": True, "message": "Password changed successfully"}), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Password change failed: {str(e)}"}), 500

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if 'user_id' in session:
        return jsonify({
            "authenticated": True,
            "user_id": session['user_id'],
            "user_email": session['user_email']
        }), 200
    else:
        return jsonify({"authenticated": False}), 200

@app.route('/api/test-db', methods=['GET'])
def test_db():
    """Test database connection and show users"""
    try:
        # Test connection
        client.admin.command('ping')
        
        # Count users
        user_count = users_collection.count_documents({})
        
        # Get sample users (hide passwords)
        users = list(users_collection.find(
            {}, 
            {"email": 1, "full_name": 1, "created_at": 1, "phone": 1}
        ).limit(10))
        
        # Convert ObjectId to string for JSON serialization
        for user in users:
            user['_id'] = str(user['_id'])
        
        return jsonify({
            "success": True,
            "database_connected": True,
            "database_name": db.name,
            "collection_name": users_collection.name,
            "total_users": user_count,
            "sample_users": users
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "database_connected": False,
            "error": str(e)
        }), 500


# ---------------------- WhatsApp API Endpoints ----------------------

@app.route('/api/whatsapp/update-preferences', methods=['POST'])
def update_whatsapp_preferences():
    """Update user WhatsApp alert preferences"""
    if 'user_id' not in session:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    
    try:
        data = request.get_json()
        user_id = session['user_id']
        
        # Update whatsapp preferences in database
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "whatsapp.number": data.get('whatsapp_number'),
                "whatsapp.enabled": data.get('enabled', False),
                "whatsapp.alert_preferences": data.get('alert_preferences', {
                    "weather": True,
                    "market_prices": True,
                    "crop_diseases": True
                })
            }}
        )
        
        # Get updated user
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        
        return jsonify({
            "success": True,
            "message": "WhatsApp preferences updated",
            "whatsapp": user.get('whatsapp')
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error updating WhatsApp preferences: {str(e)}"}), 500

@app.route('/api/whatsapp/verify', methods=['POST'])
def verify_whatsapp():
    """Verify WhatsApp number by sending a verification code"""
    if 'user_id' not in session:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    
    try:
        data = request.get_json()
        user_id = session['user_id']
        phone_number = data.get('whatsapp_number')
        
        if not phone_number:
            return jsonify({"success": False, "message": "WhatsApp number is required"}), 400
        
        # Generate a verification code
        verification_code = ''.join(random.choices(string.digits, k=6))
        
        # Store verification code in database
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "whatsapp.verification_code": verification_code,
                "whatsapp.verification_expires": datetime.utcnow() + timedelta(minutes=15)
            }}
        )
        
        # Send verification code via WhatsApp
        message = f"Your AgriGuru verification code is: {verification_code}. Valid for 15 minutes."
        result = send_whatsapp_alert(phone_number, message)
        
        if 'error' in result:
            return jsonify({"success": False, "message": f"Error sending verification: {result['error']}"}), 500
        
        return jsonify({
            "success": True,
            "message": "Verification code sent to WhatsApp"
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error sending verification: {str(e)}"}), 500

@app.route('/api/whatsapp/confirm', methods=['POST'])
def confirm_whatsapp():
    """Confirm WhatsApp number with verification code"""
    if 'user_id' not in session:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    
    try:
        data = request.get_json()
        user_id = session['user_id']
        code = data.get('verification_code')
        
        if not code:
            return jsonify({"success": False, "message": "Verification code is required"}), 400
        
        # Get user
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user or 'whatsapp' not in user or 'verification_code' not in user['whatsapp']:
            return jsonify({"success": False, "message": "No verification in progress"}), 400
        
        # Check if code matches and is not expired
        if (user['whatsapp']['verification_code'] != code or 
            'verification_expires' in user['whatsapp'] and 
            user['whatsapp']['verification_expires'] < datetime.utcnow()):
            return jsonify({"success": False, "message": "Invalid or expired verification code"}), 400
        
        # Mark as verified
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {"whatsapp.verified": True, "whatsapp.enabled": True},
                "$unset": {"whatsapp.verification_code": "", "whatsapp.verification_expires": ""}
            }
        )
        
        # Get updated user
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        
        return jsonify({
            "success": True,
            "message": "WhatsApp number verified successfully",
            "whatsapp": user.get('whatsapp')
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error confirming WhatsApp: {str(e)}"}), 500

@app.route('/api/whatsapp/send-alert', methods=['POST'])
def send_whatsapp_alert_api():
    """Send a WhatsApp alert to a user (admin only)"""
    if 'user_id' not in session:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    
    try:
        data = request.get_json()
        sender_id = session['user_id']
        recipient_id = data.get('user_id')
        alert_type = data.get('alert_type')  # 'weather', 'market_prices', 'crop_diseases'
        alert_data = data.get('alert_data', {})
        
        # Check if sender is admin (implement proper admin check)
        sender = users_collection.find_one({"_id": ObjectId(sender_id)})
        if not sender or not sender.get('is_admin', False):
            return jsonify({"success": False, "message": "Unauthorized: Admin access required"}), 403
        
        # Get recipient
        recipient = users_collection.find_one({"_id": ObjectId(recipient_id)})
        if not recipient or 'whatsapp' not in recipient or not recipient['whatsapp'].get('verified', False):
            return jsonify({"success": False, "message": "Recipient has no verified WhatsApp"}), 400
        
        # Check if alerts are enabled for this type
        if not recipient['whatsapp'].get('enabled', False) or not recipient['whatsapp'].get('alert_preferences', {}).get(alert_type, False):
            return jsonify({"success": False, "message": f"Recipient has disabled {alert_type} alerts"}), 400
        
        # Send appropriate alert type
        phone_number = recipient['whatsapp'].get('number')
        result = None
        
        if alert_type == 'weather':
            result = send_weather_alert(
                phone_number, 
                alert_data.get('location', 'your area'),
                alert_data.get('condition', 'changing weather'),
                alert_data.get('temperature', '25')
            )
        elif alert_type == 'market_prices':
            result = send_market_price_alert(
                phone_number,
                alert_data.get('crop', 'your crop'),
                alert_data.get('price', '0'),
                alert_data.get('market', 'local market')
            )
        elif alert_type == 'crop_diseases':
            result = send_crop_disease_alert(
                phone_number,
                alert_data.get('crop', 'your crop'),
                alert_data.get('disease', 'potential disease'),
                alert_data.get('action', 'consult an expert')
            )
        else:
            # Generic alert
            result = send_whatsapp_alert(
                phone_number,
                alert_data.get('message', 'Alert from AgriGuru')
            )
        
        if 'error' in result:
            return jsonify({"success": False, "message": f"Error sending alert: {result['error']}"}), 500
        
        return jsonify({
            "success": True,
            "message": f"WhatsApp alert sent successfully",
            "result": result
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error sending WhatsApp alert: {str(e)}"}), 500

@app.route('/api/whatsapp/bulk-alert', methods=['POST'])
def send_bulk_whatsapp_alert():
    """Send a WhatsApp alert to multiple users (admin only)"""
    if 'user_id' not in session:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    
    try:
        data = request.get_json()
        sender_id = session['user_id']
        alert_type = data.get('alert_type')  # 'weather', 'market_prices', 'crop_diseases'
        alert_data = data.get('alert_data', {})
        filter_criteria = data.get('filter', {})  # e.g., {'profile.farm_location': 'Maharashtra'}
        
        # Check if sender is admin (implement proper admin check)
        sender = users_collection.find_one({"_id": ObjectId(sender_id)})
        if not sender or not sender.get('is_admin', False):
            return jsonify({"success": False, "message": "Unauthorized: Admin access required"}), 403
        
        # Build query for users with verified WhatsApp and enabled alerts of this type
        query = {
            "whatsapp.verified": True,
            "whatsapp.enabled": True,
            f"whatsapp.alert_preferences.{alert_type}": True
        }
        
        # Add any additional filter criteria
        if filter_criteria:
            query.update(filter_criteria)
        
        # Get matching users
        users = list(users_collection.find(query))
        if not users:
            return jsonify({"success": False, "message": "No matching users found with WhatsApp enabled"}), 404
        
        # Send alerts to all matching users
        results = []
        for user in users:
            phone_number = user['whatsapp'].get('number')
            result = None
            
            if alert_type == 'weather':
                result = send_weather_alert(
                    phone_number, 
                    alert_data.get('location', 'your area'),
                    alert_data.get('condition', 'changing weather'),
                    alert_data.get('temperature', '25')
                )
            elif alert_type == 'market_prices':
                result = send_market_price_alert(
                    phone_number,
                    alert_data.get('crop', 'your crop'),
                    alert_data.get('price', '0'),
                    alert_data.get('market', 'local market')
                )
            elif alert_type == 'crop_diseases':
                result = send_crop_disease_alert(
                    phone_number,
                    alert_data.get('crop', 'your crop'),
                    alert_data.get('disease', 'potential disease'),
                    alert_data.get('action', 'consult an expert')
                )
            else:
                # Generic alert
                result = send_whatsapp_alert(
                    phone_number,
                    alert_data.get('message', 'Alert from AgriGuru')
                )
            
            results.append({
                "user_id": str(user['_id']),
                "result": result
            })
        
        return jsonify({
            "success": True,
            "message": f"WhatsApp alerts sent to {len(results)} users",
            "results": results
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error sending bulk WhatsApp alerts: {str(e)}"}), 500


if __name__ == '__main__':
    # Create indexes for better performance (only if database is available)
    if client:
        try:
            users_collection.create_index("email", unique=True)
            users_collection.create_index("created_at")
            users_collection.create_index("is_active")
            print("✅ Database indexes created successfully!")
        except Exception as e:
            print(f"ℹ️ Indexes may already exist: {e}")
    else:
        print("⚠️ Skipping database index creation (MongoDB not available)")

    print("🚀 Starting AgriGuru Authentication & Chat API on port 5001...")
    print("📊 Available endpoints:")
    print("   POST /api/signup - Register new user")
    print("   POST /api/login - User login")
    print("   POST /api/logout - User logout")
    print("   GET /api/profile - Get user profile")
    print("   PUT /api/profile - Update user profile")
    print("   POST /api/change-password - Change password")
    print("   GET /api/check-auth - Check authentication status")
    print("   GET /api/test-db - Test database connection and view users")
    print("🔐 OTP Authentication endpoints:")
    print("   POST /api/send-otp - Send OTP via email")
    print("   POST /api/verify-otp - Verify OTP code")
    print("   POST /api/signup-with-otp - Complete signup with OTP")
    print("💬 Real-time chat enabled at ws://localhost:5001/socket.io/")
    print("🌐 Server running at: http://localhost:5001")
    print("🔍 Test database: http://localhost:5001/api/test-db")

    # Use SocketIO to run the app (enables WebSocket)
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)

# --- SocketIO event handlers for real-time chat ---
@socketio.on('connect')
def handle_connect():
    print(f"[SOCKET] Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"[SOCKET] Client disconnected: {request.sid}")

@socketio.on('join')
def handle_join(data):
    """User joins a chat room (e.g., group or private)"""
    room = data.get('room')
    username = data.get('username')
    print(f"[SOCKET] {username} joining room: {room} (sid={request.sid})")
    if room and username:
        join_room(room)
        emit('user_joined', {'username': username, 'room': room}, room=room)

@socketio.on('leave')
def handle_leave(data):
    room = data.get('room')
    username = data.get('username')
    if room and username:
        leave_room(room)
        emit('user_left', {'username': username, 'room': room}, room=room)

@socketio.on('chat_message')
def handle_chat_message(data):
    """Handle incoming chat message and broadcast to room (including sender)"""
    room = data.get('room')
    message = data.get('message')
    image = data.get('image')
    username = data.get('username')
    timestamp = datetime.utcnow().isoformat()
    print(f"[SOCKET] chat_message from {username} in room {room}: {message} (image={'yes' if image else 'no'})")
    if room and username and (message or image):
        # Store message in DB
        chat_doc = {
            'room': room,
            'username': username,
            'message': message,
            'image': image,
            'timestamp': timestamp
        }
        chat_messages_collection.insert_one(chat_doc)
        # Broadcast to room (include sender)
        emit('chat_message', {
            'room': room,
            'username': username,
            'message': message,
            'image': image,
            'timestamp': timestamp
        }, room=room, include_self=True)

@socketio.on('typing')
def handle_typing(data):
    room = data.get('room')
    username = data.get('username')
    if room and username:
        emit('typing', {'username': username, 'room': room}, room=room, include_self=False)

# WhatsApp Test Route
@app.route('/api/test-whatsapp', methods=['POST'])
def test_whatsapp():
    """Test WhatsApp message sending via Twilio"""
    try:
        data = request.get_json()
        phone_number = data.get('phone_number')
        
        if not phone_number:
            return jsonify({"success": False, "message": "Phone number is required"}), 400
        
        # Send test message
        result = send_test_message(phone_number)
        
        if result.get('success'):
            return jsonify({
                "success": True, 
                "message": "Test message sent successfully",
                "details": result
            }), 200
        else:
            return jsonify({
                "success": False, 
                "message": "Failed to send test message", 
                "error": result.get('error')
            }), 500
            
    except Exception as e:
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

# Route to serve the WhatsApp test page
@app.route('/whatsapp-test', methods=['GET'])
def whatsapp_test_page():
    from flask import send_from_directory
    return send_from_directory('static', 'whatsapp-test.html')

# Automated Weather Alerts Route
@app.route('/api/auto-alerts/weather', methods=['POST'])
def automated_weather_alerts():
    """
    Endpoint to send automated weather alerts to all subscribed users
    Can be triggered by a scheduler/cron job
    """
    # Security check - optional API key to protect this endpoint
    api_key = request.headers.get('X-API-Key')
    if not api_key or api_key != os.getenv('INTERNAL_API_KEY', 'your-secret-key'):
        return jsonify({"success": False, "message": "Unauthorized"}), 401
        
    try:
        # Find all users with WhatsApp enabled and weather alerts enabled
        users = users_collection.find({
            "whatsapp.enabled": True,
            "whatsapp.verified": True,
            "whatsapp.alert_preferences.weather": True
        })
        
        # Track results
        results = {
            "total_users": 0,
            "successful_alerts": 0,
            "failed_alerts": 0,
            "failures": []
        }
        
        # For each user, get weather data and send alert
        for user in users:
            results["total_users"] += 1
            try:
                # Get user's location from profile
                location = user.get("profile", {}).get("location", "Unknown")
                
                # Fetch weather data for their location (implement this function)
                weather_data = fetch_weather_data(location)
                
                if weather_data:
                    # Send weather alert via WhatsApp
                    result = send_weather_alert(
                        user["whatsapp"]["number"],
                        location,
                        weather_data.get("condition", "No data"),
                        weather_data.get("temperature", "N/A")
                    )
                    
                    if result.get("success"):
                        results["successful_alerts"] += 1
                    else:
                        results["failed_alerts"] += 1
                        results["failures"].append({
                            "user_id": str(user["_id"]),
                            "error": result.get("error")
                        })
                else:
                    results["failed_alerts"] += 1
                    results["failures"].append({
                        "user_id": str(user["_id"]),
                        "error": "Failed to fetch weather data"
                    })
            except Exception as e:
                results["failed_alerts"] += 1
                results["failures"].append({
                    "user_id": str(user["_id"]),
                    "error": str(e)
                })
        
        return jsonify({
            "success": True,
            "message": f"Weather alerts processed. {results['successful_alerts']} sent, {results['failed_alerts']} failed.",
            "results": results
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error processing weather alerts: {str(e)}"}), 500

# Automated Crop Health Alerts Route
@app.route('/api/auto-alerts/crop-health', methods=['POST'])
def automated_crop_health_alerts():
    """
    Endpoint to send automated crop health/disease alerts to all subscribed users
    Can be triggered by a scheduler/cron job
    """
    # Security check - optional API key to protect this endpoint
    api_key = request.headers.get('X-API-Key')
    if not api_key or api_key != os.getenv('INTERNAL_API_KEY', 'your-secret-key'):
        return jsonify({"success": False, "message": "Unauthorized"}), 401
        
    try:
        # Find all users with WhatsApp enabled and crop disease alerts enabled
        users = users_collection.find({
            "whatsapp.enabled": True,
            "whatsapp.verified": True,
            "whatsapp.alert_preferences.crop_diseases": True
        })
        
        # Track results
        results = {
            "total_users": 0,
            "successful_alerts": 0,
            "failed_alerts": 0,
            "failures": []
        }
        
        # For each user, check their crops and send alerts if needed
        for user in users:
            results["total_users"] += 1
            try:
                # Get user's crops from profile
                crops = user.get("profile", {}).get("crops", [])
                
                if not crops:
                    continue  # Skip users with no crops defined
                
                # Check for each crop
                for crop in crops:
                    # Get crop health data (implement this function)
                    crop_health_data = check_crop_health(crop, user.get("profile", {}).get("location", "Unknown"))
                    
                    # If there's a disease alert
                    if crop_health_data and crop_health_data.get("has_disease"):
                        # Send crop disease alert via WhatsApp
                        result = send_crop_disease_alert(
                            user["whatsapp"]["number"],
                            crop,
                            crop_health_data.get("disease_name", "Unknown disease"),
                            crop_health_data.get("recommended_action", "Contact an agricultural expert")
                        )
                        
                        if result.get("success"):
                            results["successful_alerts"] += 1
                        else:
                            results["failed_alerts"] += 1
                            results["failures"].append({
                                "user_id": str(user["_id"]),
                                "crop": crop,
                                "error": result.get("error")
                            })
            except Exception as e:
                results["failed_alerts"] += 1
                results["failures"].append({
                    "user_id": str(user["_id"]),
                    "error": str(e)
                })
        
        return jsonify({
            "success": True,
            "message": f"Crop health alerts processed. {results['successful_alerts']} sent, {results['failed_alerts']} failed.",
            "results": results
        }), 200
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error processing crop health alerts: {str(e)}"}), 500

# ===========================================
# Weather API Endpoints
# ===========================================

@app.route('/api/weather/current', methods=['GET'])
def get_current_weather():
    """
    Get current weather data by location
    Query parameters: city, lat, lon
    """
    try:
        city = request.args.get('city')
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        
        if not (city or (lat and lon)):
            return jsonify({
                "success": False,
                "message": "Please provide either city name or coordinates (lat, lon)"
            }), 400
        
        # Use mock data since we don't have OpenWeatherMap API key configured
        if city:
            weather_data = {
                "location": city,
                "temperature": 28,
                "condition": "Partly Cloudy",
                "humidity": 65,
                "wind_speed": 12,
                "description": "Good weather for farming activities",
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            weather_data = {
                "location": f"Lat: {lat}, Lon: {lon}",
                "temperature": 26,
                "condition": "Sunny",
                "humidity": 70,
                "wind_speed": 8,
                "description": "Ideal conditions for crop cultivation",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        return jsonify({
            "success": True,
            "weather": weather_data,
            "farming_advice": generate_weather_farming_advice(weather_data)
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Weather API error: {str(e)}"
        }), 500

@app.route('/api/weather/forecast', methods=['GET'])
def get_weather_forecast():
    """
    Get 7-day weather forecast for farming planning
    Query parameters: city, lat, lon
    """
    try:
        city = request.args.get('city', 'Default Location')
        lat = request.args.get('lat')
        lon = request.args.get('lon')
        
        # Mock 7-day forecast data
        forecast_data = []
        conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Sunny", "Partly Cloudy", "Sunny"]
        temperatures = [28, 26, 24, 22, 30, 29, 31]
        
        for i in range(7):
            date = datetime.utcnow() + timedelta(days=i)
            forecast_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "day_name": date.strftime("%A"),
                "temperature_max": temperatures[i],
                "temperature_min": temperatures[i] - 8,
                "condition": conditions[i],
                "humidity": 60 + (i * 2),
                "rainfall_probability": 20 if "Rain" in conditions[i] else 5,
                "farming_activity": get_farming_activity_suggestion(conditions[i], temperatures[i])
            })
        
        return jsonify({
            "success": True,
            "location": city,
            "forecast": forecast_data,
            "weekly_advice": "Plan irrigation for days with low rainfall probability. Avoid spraying during windy conditions."
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Forecast API error: {str(e)}"
        }), 500

@app.route('/api/weather/farming-advisory', methods=['GET'])
def get_farming_weather_advisory():
    """
    Get weather-based farming advisory
    """
    try:
        location = request.args.get('location', 'Your Area')
        
        # Current weather mock data
        current_weather = {
            "temperature": 27,
            "humidity": 68,
            "wind_speed": 10,
            "condition": "Partly Cloudy",
            "rainfall_last_24h": 2.5
        }
        
        advisory = {
            "location": location,
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "current_conditions": current_weather,
            "farming_activities": {
                "recommended": [
                    "🌾 Good day for land preparation",
                    "💧 Check soil moisture levels",
                    "🌱 Ideal for transplanting seedlings",
                    "🚜 Machinery operations can be done"
                ],
                "avoid": [
                    "🚫 Avoid spraying if wind increases",
                    "🚫 Heavy irrigation not needed due to recent rain"
                ]
            },
            "crop_specific_advice": {
                "rice": "Monitor water levels in fields. Recent rainfall is beneficial.",
                "wheat": "Good conditions for germination if recently sown.",
                "vegetables": "Ensure proper drainage to prevent waterlogging.",
                "cotton": "Favorable conditions for flowering stage."
            },
            "alerts": generate_weather_alerts(current_weather),
            "next_24_hours": "Partly cloudy with temperatures 25-30°C. Light winds expected."
        }
        
        return jsonify({
            "success": True,
            "advisory": advisory
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Advisory API error: {str(e)}"
        }), 500

def generate_weather_farming_advice(weather_data):
    """Generate farming advice based on weather conditions"""
    temp = weather_data.get("temperature", 25)
    humidity = weather_data.get("humidity", 60)
    condition = weather_data.get("condition", "").lower()
    
    advice = []
    
    if temp > 35:
        advice.append("🌡️ High temperature - Increase irrigation frequency")
        advice.append("🌳 Provide shade for sensitive crops")
    elif temp < 15:
        advice.append("❄️ Cool weather - Protect crops from frost")
        advice.append("🔥 Consider using crop covers")
    else:
        advice.append("🌟 Optimal temperature for most farming activities")
    
    if humidity > 80:
        advice.append("💨 High humidity - Monitor for fungal diseases")
        advice.append("🌬️ Ensure good air circulation")
    elif humidity < 40:
        advice.append("💧 Low humidity - Increase irrigation")
        advice.append("🌿 Use mulching to retain moisture")
    
    if "rain" in condition:
        advice.append("🌧️ Rainy conditions - Avoid spraying operations")
        advice.append("🚜 Postpone heavy machinery work")
    elif "sunny" in condition:
        advice.append("☀️ Good conditions for harvesting")
        advice.append("🌾 Ideal for drying crops")
    
    return advice

def get_farming_activity_suggestion(condition, temperature):
    """Get farming activity suggestion based on weather"""
    if "rain" in condition.lower():
        return "Indoor activities, check drainage systems"
    elif "sunny" in condition.lower() and temperature > 30:
        return "Early morning irrigation, avoid midday work"
    elif "sunny" in condition.lower():
        return "Ideal for harvesting and field preparation"
    elif "cloudy" in condition.lower():
        return "Good for transplanting and spraying operations"
    else:
        return "Regular farming activities with weather monitoring"

def generate_weather_alerts(weather_data):
    """Generate weather alerts for farmers"""
    alerts = []
    temp = weather_data.get("temperature", 25)
    humidity = weather_data.get("humidity", 60)
    wind_speed = weather_data.get("wind_speed", 5)
    rainfall = weather_data.get("rainfall_last_24h", 0)
    
    if temp > 40:
        alerts.append({"type": "warning", "message": "Extreme heat - Protect livestock and workers"})
    if temp < 5:
        alerts.append({"type": "warning", "message": "Frost alert - Protect sensitive crops"})
    if wind_speed > 25:
        alerts.append({"type": "caution", "message": "High winds - Avoid spraying operations"})
    if rainfall > 50:
        alerts.append({"type": "info", "message": "Heavy rainfall - Check field drainage"})
    if humidity > 90:
        alerts.append({"type": "caution", "message": "Very high humidity - Monitor for plant diseases"})
    
    if not alerts:
        alerts.append({"type": "info", "message": "Weather conditions are favorable for farming"})
    
    return alerts

# ===========================================
# WhatsApp Agent JotForm Integration
# ===========================================

def generate_farming_response(user_message, user_name="Farmer"):
    """
    Intelligent farming assistant response generator
    Handles agricultural queries with comprehensive advice
    """
    message = user_message.lower()
    
    # Weather and climate queries
    if any(word in message for word in ['weather', 'rain', 'temperature', 'humidity', 'climate', 'forecast', 'मौसम', 'बारिश']):
        return f"""🌤️ **Weather Advisory for {user_name}**

**Current Farming Weather Guide:**
• **Today's Conditions**: Check local temperature & humidity
• **7-Day Forecast**: Plan sowing/harvesting activities  
• **Rainfall Predictions**: Adjust irrigation schedules
• **Wind Speed**: Important for spraying operations

**Weather-Based Farming Tips:**
✅ **Sunny Days**: Ideal for harvesting, land preparation
✅ **Rainy Season**: Focus on drainage, disease prevention
✅ **High Humidity**: Avoid fungicide application
✅ **Windy Conditions**: Postpone spraying activities

**Seasonal Advisory:**
- **Kharif Season**: Monitor monsoon patterns
- **Rabi Season**: Watch for frost warnings
- **Summer**: Implement water conservation

📱 **Next Steps**: Share your location for specific weather updates"""

    # Disease and pest management
    elif any(word in message for word in ['disease', 'pest', 'fungus', 'bacteria', 'virus', 'spots', 'wilting', 'yellowing', 'insects', 'बीमारी', 'कीट']):
        return f"""🦠 **Crop Disease & Pest Management for {user_name}**

**Common Crop Problems:**

**🍃 Leaf Issues:**
• Yellow spots → Bacterial blight (use copper fungicide)
• Brown patches → Fungal infection (improve air circulation)  
• Wilting → Root rot or water stress

**🐛 Pest Control:**
• White flies → Yellow sticky traps + neem oil
• Aphids → Ladybird beetles (biological control)
• Caterpillars → Bt spray (organic solution)

**🏥 Emergency Treatment:**
1. **Immediate**: Remove affected plant parts
2. **Spray**: Organic neem oil solution
3. **Improve**: Drainage and plant spacing
4. **Monitor**: Daily inspection for 1 week

**🛡️ Prevention Strategy:**
- Crop rotation every season
- Disease-resistant varieties
- Proper plant nutrition
- Regular field monitoring

📸 **Pro Tip**: Take photos and send for specific diagnosis"""

    # Market prices and selling strategies
    elif any(word in message for word in ['price', 'market', 'sell', 'selling', 'mandi', 'rate', 'cost', 'profit', 'income', 'कीमत', 'बाजार', 'भाव']):
        return f"""💰 **Market Intelligence for {user_name}**

**Today's Approximate Rates** (₹/Quintal):

**🌾 Cereals:**
• Rice (Common): ₹2,000-2,500
• Rice (Basmati): ₹3,500-4,200  
• Wheat: ₹2,100-2,400

**🥬 Vegetables:**
• Onion: ₹800-1,500
• Potato: ₹1,000-1,200
• Tomato: ₹1,500-2,500

**🌱 Cash Crops:**
• Cotton: ₹5,800-6,500
• Sugarcane: ₹280-320/quintal

**📈 Smart Selling Strategy:**
1. **Compare**: Check 3-4 nearby mandis
2. **Timing**: Avoid peak harvest rush
3. **Quality**: Grade your produce properly
4. **Transport**: Calculate logistics cost
5. **Storage**: Consider short-term storage for better prices

**💡 Pro Tips:**
- Join Farmer Producer Organizations (FPOs)
- Use eNAM portal for transparent pricing
- Negotiate collectively with other farmers

📊 **Want current rates?** Share your crop + location"""

    # Fertilizer and nutrition management
    elif any(word in message for word in ['fertilizer', 'fertiliser', 'nutrition', 'NPK', 'urea', 'nutrients', 'organic', 'compost', 'manure', 'खाद', 'उर्वरक']):
        return f"""🌱 **Fertilizer & Nutrition Guide for {user_name}**

**Essential Plant Nutrients:**

**🟢 Primary Nutrients:**
• **Nitrogen (N)**: Leaf growth, green color (use urea/CAN)
• **Phosphorus (P)**: Root development, flowering (DAP/SSP)
• **Potassium (K)**: Disease resistance, fruit quality (MOP)

**🟡 Secondary Nutrients:**
• Calcium, Magnesium, Sulfur (Gypsum, Dolomite)

**🔵 Micronutrients:**
• Zinc, Iron, Boron, Manganese (Foliar spray)

**📅 Application Schedule:**

**Stage 1 - Pre-Sowing:**
- Apply 25% nitrogen + full phosphorus + full potassium
- Add 5-10 tonnes FYM/compost per hectare

**Stage 2 - Vegetative Growth:**
- Apply 50% remaining nitrogen
- Foliar spray of micronutrients

**Stage 3 - Flowering/Fruiting:**
- Apply remaining 25% nitrogen
- Potassium boost for fruit development

**🌿 Organic Options:**
• Vermicompost: 3-5 tonnes/hectare
• Neem cake: Dual benefit (nutrition + pest control)
• Green manuring: Dhaincha, Sunhemp

**⚠️ Important**: Always do soil testing before fertilizer application"""

    # Irrigation and water management
    elif any(word in message for word in ['irrigation', 'water', 'watering', 'drip', 'sprinkler', 'drought', 'pump', 'well', 'सिंचाई', 'पानी']):
        return f"""💧 **Water Management for {user_name}**

**🚿 Efficient Irrigation Methods:**

**💎 Drip Irrigation** (Best for water saving):
• 40-60% water savings
• Suitable for: Fruits, vegetables, cotton
• Investment: ₹40,000-60,000/hectare
• Government subsidy: 55% for small farmers

**🌧️ Sprinkler Irrigation**:
• 30-40% water savings  
• Good for: Cereals, pulses, fodder crops
• Even water distribution

**🌊 Traditional Methods**:
• Furrow irrigation: Row crops like sugarcane
• Basin irrigation: Fruit trees
• Border irrigation: Wheat, rice

**⏰ Irrigation Scheduling:**

**🌅 Best Time**: Early morning (5-8 AM)
**🌅 Alternative**: Late evening (6-8 PM)
**❌ Avoid**: Midday irrigation (water loss)

**💡 Water Conservation Tips:**
1. **Mulching**: Reduce evaporation by 50%
2. **Rainwater Harvesting**: Store monsoon water
3. **Drip + Mulch**: Maximum water efficiency
4. **Soil moisture meters**: Precision irrigation

**🚨 Water Stress Signs:**
- Leaf curling during day
- Reduced growth rate
- Early flowering
- Wilting in morning

**💰 Cost-Effective**: Start with mulching + improved furrow method"""

    # Seeds and variety selection
    elif any(word in message for word in ['seed', 'seeds', 'variety', 'varieties', 'hybrid', 'planting', 'sowing', 'germination', 'बीज', 'किस्म']):
        return f"""🌾 **Seeds & Varieties Guide for {user_name}**

**🎯 Seed Selection Criteria:**

**✅ Quality Checklist:**
• Certified seed label (ISI mark)
• 85%+ germination rate
• Disease-free varieties
• Adapted to local climate

**🏆 Recommended High-Yield Varieties:**

**🌾 Rice:**
• **Basmati**: Pusa Basmati 1509, 1121
• **Non-Basmati**: Swarna, IR-64, Samba Mahsuri

**🌾 Wheat:**
• **Irrigated**: HD-2967, PBW-343, WH-147
• **Rain-fed**: Lok-1, Sujata

**🌽 Maize:**
• **Hybrid**: Pioneer, Dekalb varieties
• **Composite**: Suwan, Kisan

**🥬 Vegetables:**
• **Tomato**: Arka Rakshak, Pusa Ruby
• **Onion**: Agrifound varieties
• **Cabbage**: Golden Acre, Pride of India

**📋 Seed Treatment (Essential):**

**Before Sowing:**
1. **Germination Test**: 100 seeds in wet cloth
2. **Fungicide Treatment**: Thiram/Captan
3. **Bio-fertilizer**: Rhizobium for legumes

**🌱 Sowing Guidelines:**
• **Depth**: 2-3 times seed diameter
• **Spacing**: Follow variety recommendations  
• **Time**: Early morning for better emergence
• **Soil**: Well-prepared, moisture adequate

**💾 Storage Tips:**
- Cool, dry place (moisture <12%)
- Use cloth/gunny bags
- Add neem leaves for pest control

🔬 **Want variety recommendations?** Share your crop + region"""

    # Government schemes and subsidies
    elif any(word in message for word in ['subsidy', 'scheme', 'schemes', 'government', 'govt', 'loan', 'insurance', 'MSP', 'योजना', 'सब्सिडी', 'सरकार']):
        return f"""🏛️ **Government Support for {user_name}**

**💰 Major Central Schemes:**

**🎯 PM-KISAN Samman Nidhi:**
• ₹6,000/year direct benefit transfer
• All landholding farmers eligible
• Apply: pmkisan.gov.in

**🛡️ Pradhan Mantri Fasal Bima Yojana:**
• Comprehensive crop insurance
• Premium: 2% for Kharif, 1.5% for Rabi
• Coverage: Natural calamities, pest attacks

**💳 Kisan Credit Card (KCC):**
• Easy agricultural loans
• Low interest rates (7% for timely repayment)
• Flexible repayment options

**🌱 Equipment Subsidies:**
• **Tractors**: 25-50% subsidy
• **Drip Irrigation**: 55% for small farmers
• **Solar Pumps**: 60% central subsidy
• **Farm Machinery**: 40-50% under various schemes

**📱 Digital Initiatives:**
• **eNAM**: National Agriculture Market
• **Kisan Suvidha**: Weather, prices, dealers info
• **Crop Insurance App**: Claim settlements

**📋 Application Process:**
1. **Visit**: Nearest Agriculture Office/KVK
2. **Documents**: Aadhaar, Land records, Bank details
3. **Online**: Most schemes have online portals
4. **CSC Centers**: Common Service Centers

**🆘 Helplines:**
• Kisan Call Center: **1800-180-1551**
• PM-KISAN Helpline: **155261**

**💡 Pro Tip**: Contact your local Agricultural Extension Officer (AEO) for personalized guidance

📄 **Need specific scheme info?** Share your state + requirement"""

    # Soil testing and health management
    elif any(word in message for word in ['soil', 'testing', 'pH', 'health', 'nutrients', 'organic matter', 'erosion', 'मिट्टी', 'भूमि']):
        return f"""🌍 **Soil Health Management for {user_name}**

**🔬 Why Soil Testing is Crucial:**
• Know exact nutrient status
• Avoid fertilizer wastage
• Improve crop yield by 15-20%
• Prevent soil degradation

**📊 Key Testing Parameters:**

**🎯 Basic Tests:**
• **pH Level**: 6.0-7.5 (ideal for most crops)
• **Electrical Conductivity**: Salinity check
• **Organic Carbon**: Should be >0.5%

**🧪 Nutrient Analysis:**
• **NPK**: Primary nutrients
• **Secondary**: Ca, Mg, S
• **Micronutrients**: Zn, Fe, Mn, Cu, B

**🆓 Free Testing Options:**
• **Soil Health Cards**: Government provides free
• **KVK Labs**: Krishi Vigyan Kendras
• **Agricultural Universities**: Subsidized rates

**💚 Soil Health Improvement:**

**📈 Increase Organic Matter:**
1. **Farmyard Manure**: 10-15 tonnes/hectare
2. **Compost**: Well-decomposed organic matter
3. **Green Manuring**: Dhaincha, Sunhemp, Cluster bean
4. **Crop Residue**: Incorporate after harvest

**⚖️ pH Correction:**
• **Acidic Soil** (pH <6): Add lime/dolomite
• **Alkaline Soil** (pH >8): Add gypsum/sulfur

**🛡️ Prevent Soil Erosion:**
• Contour farming on slopes
• Cover crops during off-season
• Windbreaks/shelter belts
• Avoid excessive tillage

**🌱 Soil Health Indicators:**
✅ **Good Soil**: Dark color, earthworms present, good water infiltration
❌ **Poor Soil**: Light color, compacted, poor drainage

**📞 Contact for Testing:**
- District Collector Office
- Nearest KVK: kvk.icar.gov.in
- Agricultural University labs

🔍 **Quick Test**: Jar test for soil texture at home"""

    # Organic farming and sustainable practices
    elif any(word in message for word in ['organic', 'natural', 'sustainable', 'chemical free', 'bio', 'environment', 'जैविक', 'प्राकृतिक']):
        return f"""🌿 **Organic Farming Guide for {user_name}**

**🎯 Organic Farming Benefits:**
• Premium prices (20-30% higher)
• Reduced input costs
• Better soil health
• Safe food production
• Environmental conservation

**📜 Certification Process:**
• **Duration**: 3-year conversion period
• **Agencies**: NPOP certified bodies
• **Cost**: ₹15,000-25,000 for group certification
• **Inspection**: Annual third-party audit

**🌱 Organic Inputs:**

**🍃 Organic Fertilizers:**
• **Vermicompost**: 3-5 tonnes/hectare
• **FYM**: 10-15 tonnes/hectare  
• **Compost**: 5-8 tonnes/hectare
• **Green Manure**: Leguminous crops

**🦠 Organic Pest Control:**
• **Neem Oil**: Broad spectrum bio-pesticide
• **Trichoderma**: Fungal disease control
• **NPV**: Caterpillar control (biological)
• **Pheromone Traps**: Pest monitoring

**🐛 Beneficial Insects:**
• **Ladybird Beetle**: Aphid control
• **Parasitic Wasps**: Natural pest control
• **Spiders**: General predators

**📈 Soil Building (3-Year Plan):**

**Year 1**: Heavy organic matter addition
**Year 2**: Crop rotation with legumes  
**Year 3**: Balanced organic system

**💰 Economics:**
• **Initial Investment**: Higher (30-40%)
• **Break-even**: Year 2-3
• **Long-term**: 25-30% higher profits

**🛒 Market Linkages:**
• Organic stores and supermarkets
• Direct to consumer sales
• Export opportunities (higher prices)
• Online platforms

**🎓 Training Available:**
• KVK programs
• NABARD schemes
• NGO training centers

**📋 Record Keeping** (Essential):
- Input usage log
- Pest/disease management
- Harvest records
- Sales documentation

🌱 **Ready to Start?** Begin with small area (1-2 acres)"""

    # General farming and crop management
    else:
        return f"""🌾 **AgriGuru - Your Personal Farming Assistant**

**Hello {user_name}! 👋**

I'm here to help you with all your farming needs. Ask me about:

**🌤️ Weather & Climate Planning**
📞 *"What's the weather forecast for next week?"*

**🦠 Disease & Pest Solutions**
📞 *"My tomato plants have yellow spots"*

**💰 Market Intelligence**
📞 *"Current wheat prices in my area"*

**🌱 Fertilizer & Nutrition**
📞 *"Best fertilizer for cotton flowering stage"*

**💧 Irrigation & Water Management**
📞 *"How to save water with drip irrigation?"*

**🌾 Seeds & Varieties**
📞 *"Which rice variety for my region?"*

**🏛️ Government Schemes**
📞 *"Subsidies available for farm equipment"*

**🌍 Soil Testing & Health**
📞 *"How to improve soil fertility naturally?"*

**🌿 Organic Farming**
📞 *"Steps to start organic farming"*

**🚨 Quick Emergency Help:**

**📱 Immediate Support:**
• Kisan Call Center: **1800-180-1551**
• Kisan Suvidha App: Weather + Market
• eNAM Portal: Transparent pricing

**🏥 Expert Consultation:**
• Local KVK: Krishi Vigyan Kendra
• Agricultural University
• Progressive farmers in your area

**💡 Today's Farming Tip:**
Monitor your crops daily - early detection prevents major losses!

**🎯 Popular Queries:**
• "Organic pest control for vegetables"
• "Government subsidy for solar pump"  
• "Best time to apply fertilizer"
• "How to increase crop yield naturally"

💬 **Ask me anything!** I'm here 24/7 to help improve your farming success.

🌟 **Remember**: Good farming = Timely action + Right knowledge"""

@app.route('/api/jotform/webhook', methods=['POST'])
def jotform_webhook():
    """Handle JotForm webhook for farming queries"""
    try:
        # Get form data from JotForm
        if request.content_type == 'application/x-www-form-urlencoded':
            form_data = request.form
        else:
            form_data = request.get_json() or {}
        
        # Extract user information
        user_name = form_data.get('q1_name', form_data.get('name', 'Farmer'))
        user_phone = form_data.get('q2_phone', form_data.get('phone', ''))
        user_message = form_data.get('q3_message', form_data.get('message', ''))
        user_location = form_data.get('q4_location', form_data.get('location', ''))
        
        # Clean phone number
        if user_phone:
            user_phone = re.sub(r'[^\d+]', '', str(user_phone))
            if not user_phone.startswith('+'):
                user_phone = '+91' + user_phone  # Default to India
        
        # Generate farming response
        if user_message:
            response_message = generate_farming_response(user_message, user_name)
            
            # Add location context if provided
            if user_location:
                response_message += f"\n\n📍 **Your Location**: {user_location}\n*For location-specific advice, our local expert will contact you soon.*"
            
            # Send WhatsApp response if phone number provided
            if user_phone:
                try:
                    whatsapp_result = send_whatsapp_alert(user_phone, response_message)
                    
                    # Log to database if available
                    if client:
                        try:
                            db.farming_queries.insert_one({
                                "user_name": user_name,
                                "user_phone": user_phone,
                                "user_location": user_location,
                                "user_message": user_message,
                                "bot_response": response_message,
                                "timestamp": datetime.utcnow(),
                                "whatsapp_status": "sent" if whatsapp_result.get("success") else "failed",
                                "source": "jotform_webhook"
                            })
                        except Exception as db_error:
                            print(f"Database logging error: {db_error}")
                    
                    return jsonify({
                        "success": True,
                        "message": "Farming advice sent via WhatsApp successfully",
                        "user_name": user_name,
                        "phone": user_phone,
                        "response_sent": True
                    }), 200
                    
                except Exception as wa_error:
                    return jsonify({
                        "success": False,
                        "message": f"Failed to send WhatsApp message: {str(wa_error)}",
                        "user_name": user_name,
                        "phone": user_phone,
                        "response_sent": False
                    }), 500
            else:
                return jsonify({
                    "success": True,
                    "message": "Farming advice generated (no phone number provided)",
                    "user_name": user_name,
                    "response": response_message[:100] + "..." if len(response_message) > 100 else response_message,
                    "response_sent": False
                }), 200
        else:
            return jsonify({
                "success": False,
                "message": "No farming query provided",
                "user_name": user_name
            }), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Webhook processing error: {str(e)}"
        }), 500

@app.route('/api/jotform/test', methods=['POST'])
def test_jotform_integration():
    """Test endpoint for JotForm integration"""
    try:
        data = request.get_json()
        test_data = {
            "name": data.get("name", "Test Farmer"),
            "phone": data.get("phone", "+919999999999"),
            "message": data.get("message", "What are the best farming practices for organic vegetables?"),
            "location": data.get("location", "Test Location")
        }
        
        response = generate_farming_response(test_data["message"], test_data["name"])
        
        return jsonify({
            "success": True,
            "test_data": test_data,
            "generated_response": response,
            "response_length": len(response),
            "timestamp": datetime.utcnow().isoformat(),
            "message": "JotForm integration test successful"
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Integration test error: {str(e)}"
        }), 500

@app.route('/api/farming/query', methods=['POST'])
def direct_farming_query():
    """Direct farming query endpoint"""
    try:
        data = request.get_json()
        
        user_name = data.get('name', 'Farmer')
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({
                "success": False,
                "message": "Please provide a farming question"
            }), 400
        
        response = generate_farming_response(user_message, user_name)
        
        return jsonify({
            "success": True,
            "user_name": user_name,
            "user_message": user_message,
            "farming_advice": response,
            "timestamp": datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Query processing error: {str(e)}"
        }), 500

if __name__ == '__main__':
    print("🌾 AgriGuru Farming Assistant Server Starting...")
    print("📱 JotForm WhatsApp Agent: READY")
    print("🚀 Server running on: http://localhost:5001")
    print("🔗 JotForm Webhook URL: http://your-domain.com/api/jotform/webhook")
    app.run(debug=True, host='0.0.0.0', port=5001)
