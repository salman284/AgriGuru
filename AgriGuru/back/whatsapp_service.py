import requests
import os
from dotenv import load_dotenv
import logging
from twilio.rest import Client

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def send_whatsapp_alert(phone_number, message, template_name=None):
    """
    Send WhatsApp message via Twilio WhatsApp API
    
    Args:
        phone_number (str): Phone number in international format (e.g., +91XXXXXXXXXX)
        message (str): Message content to send
        template_name (str): Not used for Twilio, included for compatibility
        
    Returns:
        dict: API response data
    """
    # Get Twilio credentials from environment variables
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    twilio_number = os.getenv('TWILIO_WHATSAPP_NUMBER')
    bot_name = os.getenv('WHATSAPP_BOT_NAME', 'AgriGuru')
    
    if not account_sid or not auth_token or not twilio_number:
        logger.error("Twilio credentials not found in environment variables")
        return {"error": "Twilio credentials not configured"}
    
    # Ensure phone number is in international format
    if not phone_number.startswith('+'):
        phone_number = '+' + phone_number
    
    # Add bot identification to the beginning of every message if not already present
    if not message.startswith('🌱') and not message.startswith(f'*{bot_name}*'):
        message = f"🤖 *{bot_name}* 🤖\n\n{message}"
    
    try:
        client = Client(account_sid, auth_token)
        
        twilio_message = client.messages.create(
            body=message,
            from_=f"whatsapp:{twilio_number}",
            to=f"whatsapp:{phone_number}"
        )
        
        logger.info(f"WhatsApp message sent successfully to {phone_number}")
        return {
            "success": True,
            "message_sid": twilio_message.sid,
            "status": twilio_message.status,
            "to": phone_number,
            "from": twilio_number
        }
        
    except Exception as e:
        logger.error(f"Failed to send WhatsApp message: {str(e)}")
        return {"error": str(e)}

def send_weather_alert(phone_number, location, condition, temperature):
    """Send weather alert via WhatsApp"""
    message = f"🌤️ *Weather Alert for {location}*\n\n"
    message += f"Current Condition: {condition}\n"
    message += f"Temperature: {temperature}°C\n\n"
    message += "Plan your farming activities accordingly!\n"
    message += "Stay safe and have a productive day! 🌾"
    
    return send_whatsapp_alert(phone_number, message)

def send_market_price_alert(phone_number, crop, price, market):
    """Send market price alert via WhatsApp"""
    message = f"💰 *Market Price Alert*\n\n"
    message += f"Crop: {crop}\n"
    message += f"Current Price: ₹{price}/quintal\n"
    message += f"Market: {market}\n\n"
    message += "Consider this pricing for your selling decisions!\n"
    message += "Happy farming! 🌾"
    
    return send_whatsapp_alert(phone_number, message)

def send_crop_disease_alert(phone_number, crop, disease, action):
    """Send crop disease alert via WhatsApp"""
    message = f"🦠 *Crop Health Alert*\n\n"
    message += f"Crop: {crop}\n"
    message += f"Issue Detected: {disease}\n"
    message += f"Recommended Action: {action}\n\n"
    message += "Take immediate action to protect your crop!\n"
    message += "Contact local agricultural expert if needed. 🌱"
    
    return send_whatsapp_alert(phone_number, message)

def send_test_message(phone_number):
    """Send a test message to verify WhatsApp functionality"""
    message = """🌾 *AgriGuru Test Message* 🌾

Hello! This is a test message from your AgriGuru farming assistant.

If you're receiving this message, your WhatsApp alerts are working perfectly! 

You'll receive important updates about:
• Weather conditions
• Market prices  
• Crop health alerts
• Farming tips and advice

Happy farming! 🚜✨"""
    
    return send_whatsapp_alert(phone_number, message)

def setup_business_profile():
    """Setup WhatsApp Business profile information"""
    # This would be used for WhatsApp Business API (not available in Twilio sandbox)
    # For now, we'll use this as a placeholder for future business API integration
    
    profile_info = {
        "business_name": "AgriGuru - Smart Farming Assistant",
        "description": "Your intelligent farming companion for weather alerts, market prices, and agricultural advice.",
        "category": "Agriculture",
        "website": "https://agriguru.com",
        "email": "support@agriguru.com"
    }
    
    logger.info("Business profile information prepared for future WhatsApp Business API integration")
    return profile_info

def get_whatsapp_status():
    """Get status of WhatsApp service"""
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    twilio_number = os.getenv('TWILIO_WHATSAPP_NUMBER')
    
    if not all([account_sid, auth_token, twilio_number]):
        return {
            "status": "error",
            "message": "WhatsApp credentials not configured"
        }
    
    try:
        client = Client(account_sid, auth_token)
        # Check account status
        account = client.api.accounts(account_sid).fetch()
        
        return {
            "status": "active",
            "account_status": account.status,
            "whatsapp_number": twilio_number,
            "message": "WhatsApp service is operational"
        }
    except Exception as e:
        return {
            "status": "error", 
            "message": f"WhatsApp service error: {str(e)}"
        }

def send_branded_message(phone_number, title, content, alert_type="INFO"):
    """
    Send a branded message with consistent formatting
    
    Args:
        phone_number (str): Recipient's phone number
        title (str): Message title
        content (str): Message content
        alert_type (str): Type of alert (INFO, WARNING, SUCCESS, ERROR)
    """
    
    # Emoji mapping for different alert types
    emoji_map = {
        "INFO": "ℹ️",
        "WARNING": "⚠️", 
        "SUCCESS": "✅",
        "ERROR": "❌",
        "WEATHER": "🌤️",
        "MARKET": "💰",
        "DISEASE": "🦠",
        "GENERAL": "🌾"
    }
    
    emoji = emoji_map.get(alert_type.upper(), "📢")
    
    # Format the branded message
    message = f"{emoji} *AgriGuru Alert* {emoji}\n\n"
    message += f"*{title}*\n\n"
    message += f"{content}\n\n"
    message += "---\n"
    message += "🌾 AgriGuru - Your Smart Farming Assistant\n"
    message += "For more farming tips and alerts, stay connected!"
    
    return send_whatsapp_alert(phone_number, message)
