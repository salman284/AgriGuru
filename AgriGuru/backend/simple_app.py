from flask import Flask, request, jsonify
from flask_cors import CORS
from efficientnet_pytorch import EfficientNet
import json
import torch
import torchvision.transforms as transforms
from PIL import Image
import base64
import io
import numpy as np
import requests
import os
from dotenv import load_dotenv
from datetime import datetime
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
from bson import ObjectId

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

# MongoDB configuration
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = os.getenv('DB_NAME', 'cloudmates')

try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    users_collection = db.users
    print("Successfully connected to MongoDB")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    db = None

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users_collection.find_one({'_id': ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': 'Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# Weather API configuration
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')

if not WEATHER_API_KEY:
    print("Warning: WEATHER_API_KEY not found in environment variables!")
    print("Please set your OpenWeatherMap API key in the .env file")
WEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

# Load EfficientNet model
try:
    model = EfficientNet.from_pretrained('efficientnet-b0')
    model.eval()
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize(224),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Agricultural labels
LABELS = [
    'healthy plant',
    'bacterial leaf blight',
    'leaf spot',
    'brown rust',
    'yellow rust',
    'powdery mildew',
    'nitrogen deficiency',
    'phosphorus deficiency',
    'potassium deficiency',
    'water stress'
]

# Agricultural labels and optimal conditions
CROP_CONDITIONS = {
    'rice': {
        'temp_range': (20, 35),
        'humidity_range': (60, 80),
        'rainfall_needed': True
    },
    'wheat': {
        'temp_range': (15, 30),
        'humidity_range': (50, 70),
        'rainfall_needed': False
    },
    'cotton': {
        'temp_range': (25, 35),
        'humidity_range': (40, 60),
        'rainfall_needed': True
    },
    'maize': {
        'temp_range': (20, 32),
        'humidity_range': (50, 75),
        'rainfall_needed': True
    }
}

def get_weather_data(location):
    if not WEATHER_API_KEY:
        print("Error: No API key configured")
        return {"error": "Weather API key not configured"}
    
    if not location:
        return {"error": "No location provided"}

    try:
        params = {
            'q': location,
            'appid': WEATHER_API_KEY,
            'units': 'metric'
        }
        response = requests.get(WEATHER_BASE_URL, params=params)
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 401:
            print("Error: Invalid API key")
            return {"error": "Invalid API key"}
        elif response.status_code == 404:
            print(f"Error: Location '{location}' not found")
            return {"error": f"Location '{location}' not found"}
        else:
            print(f"Error: API returned status code {response.status_code}")
            return {"error": f"Weather service error: {response.status_code}"}
            
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to weather service")
        return {"error": "Could not connect to weather service"}
    except Exception as e:
        print(f"Error fetching weather data: {e}")
        return {"error": f"Unexpected error: {str(e)}"}

def analyze_weather_for_crop(weather_data, crop_type):
    if not weather_data or crop_type not in CROP_CONDITIONS:
        return "Unable to analyze weather conditions for this crop."

    temp = weather_data['main']['temp']
    humidity = weather_data['main']['humidity']
    weather_desc = weather_data['weather'][0]['main'].lower()
    
    crop_info = CROP_CONDITIONS[crop_type]
    temp_min, temp_max = crop_info['temp_range']
    humid_min, humid_max = crop_info['humidity_range']
    
    analysis = []
    
    # Temperature analysis
    if temp_min <= temp <= temp_max:
        analysis.append(f"✅ Temperature ({temp}°C) is optimal for {crop_type}")
    else:
        analysis.append(f"⚠️ Temperature ({temp}°C) is outside optimal range ({temp_min}-{temp_max}°C)")
    
    # Humidity analysis
    if humid_min <= humidity <= humid_max:
        analysis.append(f"✅ Humidity ({humidity}%) is optimal")
    else:
        analysis.append(f"⚠️ Humidity ({humidity}%) is outside optimal range ({humid_min}-{humid_max}%)")
    
    # Rainfall analysis
    if crop_info['rainfall_needed'] and 'rain' in weather_desc:
        analysis.append("✅ Current rainfall is beneficial for your crop")
    elif crop_info['rainfall_needed'] and 'rain' not in weather_desc:
        analysis.append("⚠️ Crop may need irrigation as no rainfall is detected")
    
    return "\n".join(analysis)

# Image analysis function
def analyze_image(image_data):
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Preprocess image
        image_tensor = transform(image)
        image_tensor = image_tensor.unsqueeze(0)  # Add batch dimension
        
        # Get prediction
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            _, predicted = torch.max(outputs, 1)
            
        # Get top 3 predictions
        probs, indices = torch.topk(probabilities, 3)
        results = []
        for prob, idx in zip(probs[0], indices[0]):
            results.append({
                'condition': LABELS[idx],
                'probability': f"{prob.item()*100:.2f}%"
            })
        
        return results
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return None

def get_agricultural_response(question, location=None, crop_type=None, image_analysis=None):
    question = question.lower()
    
    if 'weather' in question:
        if not location:
            return "Please provide your location for weather-related advice. Format: 'weather in [city]'"
        
        weather_data = get_weather_data(location)
        if not weather_data:
            return "Unable to fetch weather data. Please check the location provided."
        
        response = f"📍 Weather in {location}:\n"
        response += f"🌡️ Temperature: {weather_data['main']['temp']}°C\n"
        response += f"💧 Humidity: {weather_data['main']['humidity']}%\n"
        response += f"🌤️ Conditions: {weather_data['weather'][0]['description']}\n\n"
        
        if crop_type:
            response += f"🌾 Crop-specific analysis for {crop_type}:\n"
            response += analyze_weather_for_crop(weather_data, crop_type)
            
            if image_analysis:
                response += "\n\n🔍 Plant Health Analysis:\n"
                for result in image_analysis:
                    response += f"- {result['condition']} ({result['probability']})\n"
        
        return response
    
    if 'soil' in question:
        return "For soil health analysis, consider these key factors: pH level, nutrient content (N-P-K), organic matter, and moisture level. Would you like specific information about any of these?"
    
    if 'crop' in question or 'plant' in question:
        if image_analysis:
            conditions = [result['condition'] for result in image_analysis]
            probabilities = [result['probability'] for result in image_analysis]
            response = f"Based on the image analysis, I detected:\n"
            for i in range(len(conditions)):
                response += f"- {conditions[i]} ({probabilities[i]})\n"
            return response
        return "To better assist you with crop-related queries, please provide more details about your crop type and growth stage, or share an image of your crop."
    
    return "I'm your agricultural assistant. I can help you with:\n- Crop health analysis (share an image)\n- Weather guidance\n- Soil management\n- Farming best practices\nWhat would you like to know more about?"

@app.route('/chat', methods=['POST'])
def chat():
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400

        data = request.json
        if not data:
            return jsonify({"error": "Empty request body"}), 400

        question = data.get('question', '')
        if not question:
            return jsonify({"error": "Question is required"}), 400

        image_data = data.get('image')
        
        # Extract location and crop type from question
        location = None
        crop_type = None
        
        if 'weather in' in question.lower():
            location = question.lower().split('weather in')[-1].strip()
            if not location:
                return jsonify({"error": "Please specify a location after 'weather in'"}), 400
        
        for crop in CROP_CONDITIONS.keys():
            if crop in question.lower():
                crop_type = crop
                break
        
        image_analysis = None
        if image_data and model is not None:
            image_analysis = analyze_image(image_data)
        elif image_data and model is None:
            return jsonify({"error": "Image analysis model not loaded properly"}), 503
        
        answer = get_agricultural_response(question, location, crop_type, image_analysis)
        
        if isinstance(answer, dict) and 'error' in answer:
            return jsonify({"error": answer['error']}), 400
            
        return jsonify({"answer": answer})
        
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON format"}), 400
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({"error": "Internal server error. Please try again later"}), 500

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Validate required fields
        required_fields = ['fullName', 'email', 'password', 'phone', 'location']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

        # Check if user already exists
        if users_collection.find_one({"email": data['email']}):
            return jsonify({"error": "Email already registered"}), 400

        # Hash password
        hashed_password = generate_password_hash(data['password'])

        # Create user document
        user = {
            "fullName": data['fullName'],
            "email": data['email'],
            "password": hashed_password,
            "phone": data['phone'],
            "location": data['location'],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        # Insert user
        result = users_collection.insert_one(user)
        
        # Create token
        token = jwt.encode({
            'user_id': str(result.inserted_id),
            'exp': datetime.utcnow() + datetime.timedelta(days=1)
        }, app.config['SECRET_KEY'])

        return jsonify({
            "message": "Registration successful",
            "token": token,
            "user": {
                "id": str(result.inserted_id),
                "fullName": user['fullName'],
                "email": user['email'],
                "location": user['location']
            }
        }), 201

    except Exception as e:
        print(f"Error in registration: {e}")
        return jsonify({"error": "Registration failed"}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email and password are required"}), 400

        # Find user
        user = users_collection.find_one({"email": data['email']})
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        # Check password
        if not check_password_hash(user['password'], data['password']):
            return jsonify({"error": "Invalid email or password"}), 401

        # Create token
        token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': datetime.utcnow() + datetime.timedelta(days=1)
        }, app.config['SECRET_KEY'])

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(user['_id']),
                "fullName": user['fullName'],
                "email": user['email'],
                "location": user['location']
            }
        }), 200

    except Exception as e:
        print(f"Error in login: {e}")
        return jsonify({"error": "Login failed"}), 500

@app.route('/user/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        "user": {
            "id": str(current_user['_id']),
            "fullName": current_user['fullName'],
            "email": current_user['email'],
            "phone": current_user['phone'],
            "location": current_user['location']
        }
    })


if __name__ == '__main__':
    print("Server starting on http://localhost:5000")
    print("Loading ML models and initializing agricultural assistant...")
    app.run(debug=True, port=5000)
