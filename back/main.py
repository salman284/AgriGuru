from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import secrets
import re
import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"], 
     supports_credentials=True, 
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Configuration
app.config['SECRET_KEY'] = secrets.token_hex(16)
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['MONGO_URI'] = 'mongodb+srv://shriompal2435:N2Ry3EfnFDU4FQpg@agrigurudb.lttawpv.mongodb.net/'

# Connect to MongoDB
client = MongoClient(app.config['MONGO_URI'])
db = client.agrigurudb
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
                "profile": user_doc["profile"]
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

if __name__ == '__main__':
    # Create indexes for better performance
    try:
        users_collection.create_index("email", unique=True)
        users_collection.create_index("created_at")
        users_collection.create_index("is_active")
        print("✅ Database indexes created successfully!")
    except Exception as e:
        print(f"ℹ️ Indexes may already exist: {e}")
    
    print("🚀 Starting AgriGuru Authentication API on port 5001...")
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
    print("🌐 Server running at: http://localhost:5001")
    print("🔍 Test database: http://localhost:5001/api/test-db")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
