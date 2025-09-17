import requests
import os
from dotenv import load_dotenv
import logging
import json
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Weather API Configuration
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY', '')  # OpenWeatherMap API key
WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"

# Weather data functions
def fetch_weather_data(location):
    """
    Fetch weather data for a given location using OpenWeatherMap API
    
    Args:
        location (str): Location name (city or region)
        
    Returns:
        dict: Weather data including condition and temperature
    """
    try:
        # For demo/development, provide mock data if API key is not set
        if not WEATHER_API_KEY:
            logger.warning("Using mock weather data as WEATHER_API_KEY is not set")
            return mock_weather_data(location)
            
        # Make API request
        params = {
            "q": location,
            "appid": WEATHER_API_KEY,
            "units": "metric"  # Use Celsius
        }
        
        response = requests.get(WEATHER_API_URL, params=params)
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract relevant weather information
            weather_data = {
                "location": location,
                "condition": data["weather"][0]["main"],
                "description": data["weather"][0]["description"],
                "temperature": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "wind_speed": data["wind"]["speed"],
                "timestamp": datetime.now().isoformat()
            }
            
            # Save weather data to cache for future reference
            cache_weather_data(location, weather_data)
            
            return weather_data
        else:
            logger.error(f"Failed to fetch weather data: {response.status_code}, {response.text}")
            return mock_weather_data(location)
            
    except Exception as e:
        logger.error(f"Error fetching weather data: {str(e)}")
        return mock_weather_data(location)

def mock_weather_data(location):
    """Generate mock weather data for development/testing"""
    import random
    
    conditions = ["Clear", "Cloudy", "Partly Cloudy", "Rain", "Thunderstorm", "Drizzle", "Sunny"]
    temp_range = {
        "Delhi": (25, 45),
        "Mumbai": (24, 36),
        "Bangalore": (20, 33),
        "Chennai": (25, 40),
        "Kolkata": (24, 38),
        "Hyderabad": (23, 38),
        "Pune": (21, 35)
    }
    
    # Default temperature range
    temp_min, temp_max = 20, 38
    
    # Use location-specific temperature range if available
    for city, temp_range in temp_range.items():
        if city.lower() in location.lower():
            temp_min, temp_max = temp_range
            break
    
    return {
        "location": location,
        "condition": random.choice(conditions),
        "description": "Mock weather data",
        "temperature": round(random.uniform(temp_min, temp_max), 1),
        "humidity": random.randint(30, 90),
        "wind_speed": round(random.uniform(1, 15), 1),
        "timestamp": datetime.now().isoformat()
    }

def cache_weather_data(location, data):
    """Cache weather data for future reference"""
    try:
        os.makedirs("data/weather_cache", exist_ok=True)
        
        # Use simplified location as filename
        filename = f"data/weather_cache/{location.lower().replace(' ', '_')}.json"
        
        with open(filename, "w") as f:
            json.dump(data, f)
            
    except Exception as e:
        logger.error(f"Error caching weather data: {str(e)}")

# Crop health data functions
def check_crop_health(crop, location):
    """
    Check crop health/disease status for a given crop and location
    This is a placeholder for a real crop disease prediction system
    
    Args:
        crop (str): Crop name (e.g., "rice", "wheat")
        location (str): Location name (city or region)
        
    Returns:
        dict: Crop health data including disease information if present
    """
    try:
        # For demo/development, provide mock data
        # In a real system, this would integrate with:
        # 1. Weather data to predict disease risk
        # 2. Satellite imagery analysis
        # 3. IoT sensor data from farms
        # 4. Regional disease outbreak reports
        
        # Get weather data for disease risk assessment
        weather = fetch_weather_data(location)
        
        # Check conditions that might lead to crop diseases
        # These are simplified rules - real systems would use ML models
        high_risk = False
        disease_name = None
        recommended_action = None
        
        # Simplified disease risk logic based on crop type and conditions
        if crop.lower() == "rice":
            if weather["humidity"] > 80 and weather["temperature"] > 28:
                high_risk = True
                disease_name = "Rice Blast"
                recommended_action = "Apply fungicide and ensure proper drainage"
                
        elif crop.lower() == "wheat":
            if weather["humidity"] > 75 and 15 < weather["temperature"] < 25:
                high_risk = True
                disease_name = "Wheat Rust"
                recommended_action = "Apply fungicide and monitor fields closely"
                
        elif crop.lower() == "cotton":
            if weather["humidity"] > 70 and weather["temperature"] > 30:
                high_risk = True
                disease_name = "Cotton Boll Rot"
                recommended_action = "Improve air circulation and apply recommended fungicides"
                
        elif crop.lower() == "tomato":
            if weather["humidity"] > 70 and 20 < weather["temperature"] < 30:
                high_risk = True
                disease_name = "Early Blight"
                recommended_action = "Remove infected leaves and apply copper-based fungicide"
                
        # Simplified mock response - some random risk for other crops
        else:
            import random
            if random.random() < 0.2:  # 20% chance of disease alert for testing
                high_risk = True
                disease_name = f"{crop.capitalize()} Generic Disease"
                recommended_action = "Contact local agricultural expert for assessment"
        
        return {
            "crop": crop,
            "location": location,
            "has_disease": high_risk,
            "disease_name": disease_name,
            "risk_level": "High" if high_risk else "Low",
            "recommended_action": recommended_action,
            "weather_factors": {
                "temperature": weather["temperature"],
                "humidity": weather["humidity"]
            },
            "timestamp": datetime.now().isoformat()
        }
            
    except Exception as e:
        logger.error(f"Error checking crop health: {str(e)}")
        return {
            "crop": crop, 
            "location": location,
            "has_disease": False,
            "error": str(e)
        }
