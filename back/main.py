from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import secrets
import re

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
    print("🌐 Server running at: http://localhost:5001")
    print("🔍 Test database: http://localhost:5001/api/test-db")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
