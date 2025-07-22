"""
AgriBot AI Backend with Grok API Integration - Complete Version
"""

import os
import sys
import json
import logging
import asyncio
import traceback
import requests
from datetime import datetime
from typing import Dict, Any, Optional, List
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"])

class GroqAgriBot:
    """AgriBot powered by Groq API - FREE & FAST"""
    
    def __init__(self, api_key: str = None):
        """Initialize Groq AgriBot"""
        self.api_key = api_key or os.getenv('GROQ_API_KEY') or os.getenv('GROK_API_KEY')
        
        if not self.api_key:
            raise ValueError("GROQ_API_KEY environment variable is required")
        
        self.base_url = "https://api.groq.com/openai/v1"
        self.model = "llama3-8b-8192"  # Fast and free model
        
        # Headers for API requests
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        # System prompt for expert farming advice
        self.system_prompt = """You are AgriBot, an expert agricultural advisor AI specifically designed for Indian farmers and global agriculture. You have deep expertise in:

🌾 AGRICULTURE EXPERTISE:
- All major crops (cereals, pulses, oilseeds, vegetables, fruits, cash crops)
- Modern and traditional farming techniques
- Organic and sustainable agriculture
- Precision farming and smart agriculture
- Crop rotation and intercropping

🧪 TECHNICAL KNOWLEDGE:
- Soil science and fertility management
- Plant nutrition and fertilizer management
- Irrigation systems and water management
- Plant pathology and entomology
- Agricultural machinery and technology

🌍 REGIONAL EXPERTISE:
- Climate-specific recommendations
- Local variety selection
- Regional pest and disease patterns
- Market conditions and pricing
- Government schemes and subsidies

💡 COMMUNICATION STYLE:
- Use simple, farmer-friendly language
- Provide practical, actionable advice
- Include specific numbers (costs, quantities, timing)
- Be encouraging and supportive
- Use emojis for better readability
- Consider economic viability

🎯 RESPONSE GUIDELINES:
- Always give practical, implementable solutions
- Consider both modern and traditional methods
- Include safety warnings when needed
- Suggest government schemes when applicable
- Provide region-specific advice when location is mentioned
- Be accurate and up-to-date with information

Remember: You're helping real farmers improve their livelihoods. Be accurate, practical, and empathetic."""

        self.conversation_history = []
        logger.info("✅ Groq AgriBot initialized successfully")
    
    def get_farming_advice(self, user_message: str, context: Dict = None) -> Dict[str, Any]:
        """Get farming advice using Groq API"""
        try:
            logger.info(f"🔄 Sending request to Groq API...")
            
            # Build messages for conversation
            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_message}
            ]
            
            # Prepare API request
            payload = {
                "model": self.model,
                "messages": messages,
                "max_tokens": 2000,
                "temperature": 0.7,
                "top_p": 0.9,
                "stream": False
            }
            
            logger.info(f"📡 Making request to: {self.base_url}/chat/completions")
            
            # Make API request
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            logger.info(f"📨 Response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                advice = data['choices'][0]['message']['content']
                
                # Store in conversation history
                self.conversation_history.append({
                    'user_message': user_message,
                    'agribot_response': advice,
                    'timestamp': datetime.now().isoformat(),
                    'model': 'grok-beta'
                })
                
                logger.info(f"✅ Groq response generated: {len(advice)} characters")
                
                return {
                    'success': True,
                    'advice': advice,
                    'model_type': 'llama3-8b-8192',
                    'provider': 'groq',
                    'cost': 'free',
                    'context': context or {},
                    'timestamp': datetime.now().isoformat()
                }
            else:
                # Log the actual error details
                error_text = response.text
                logger.error(f"❌ Grok API error {response.status_code}: {error_text}")
                
                # Check for common error types
                if response.status_code == 401:
                    error_msg = "Invalid Groq API key. Please check your GROQ_API_KEY in .env file."
                elif response.status_code == 429:
                    error_msg = "Groq API rate limit exceeded. Please try again later."
                elif response.status_code == 400:
                    error_msg = f"Bad request to Groq API: {error_text}"
                else:
                    error_msg = f"Groq API error {response.status_code}: {error_text}"
                
                raise Exception(error_msg)
                
        except requests.exceptions.Timeout:
            logger.error("❌ Groq API timeout")
            return {
                'success': False,
                'error': 'Groq API timeout',
                'advice': 'The AI service is taking too long to respond. Please try again.',
                'model_type': 'groq_timeout',
                'timestamp': datetime.now().isoformat()
            }
        except requests.exceptions.ConnectionError:
            logger.error("❌ Groq API connection error")
            return {
                'success': False,
                'error': 'Connection error',
                'advice': 'Cannot connect to Groq AI service. Please check your internet connection.',
                'model_type': 'groq_connection_error',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"❌ Groq API error: {e}")
            return {
                'success': False,
                'error': str(e),
                'advice': f'Groq AI Error: {str(e)}. Please check your API key and try again.',
                'model_type': 'groq_error',
                'fallback': True,
                'timestamp': datetime.now().isoformat()
            }
    
    def get_conversation_history(self, limit: int = 10) -> list:
        """Get recent conversation history"""
        return self.conversation_history[-limit:]
    
    def clear_conversation_history(self):
        """Clear conversation history"""
        self.conversation_history = []
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            'name': 'AgriBot with Groq',
            'model': 'llama3-8b-8192',
            'provider': 'Groq',
            'version': '3.1',
            'cost': 'FREE (up to quota)',
            'capabilities': [
                'Expert farming knowledge',
                'Real-time advice generation',
                'Context-aware responses',
                'Multi-language support',
                'Practical recommendations',
                'Economic analysis'
            ],
            'limits': {
                'free_quota': '14,400 requests per day',
                'rate_limit': '30 requests per minute',
                'max_tokens': '8192 per response'
            },
            'conversation_count': len(self.conversation_history)
        }

class AgriBotKnowledgeBase:
    """AgriBot's farming knowledge base"""
    
    def __init__(self):
        self.crop_data = self._load_crop_knowledge()
        self.pest_data = self._load_pest_knowledge()
        self.fertilizer_data = self._load_fertilizer_knowledge()
        
    def _load_crop_knowledge(self):
        """Load comprehensive crop cultivation data"""
        return {
            'rice': {
                'varieties': ['Swarna', 'IR64', 'MTU-7029', 'BPT-5204', 'Pusa Basmati 1121'],
                'seasons': {
                    'kharif': {'sowing': 'June-July', 'harvest': 'October-November'},
                    'rabi': {'sowing': 'November-December', 'harvest': 'April-May'}
                },
                'fertilizer': {'N': 120, 'P': 60, 'K': 40, 'unit': 'kg/hectare'},
                'water': '1200-1500 mm total',
                'yield': '4-6 tonnes/hectare',
                'cost': '₹25,000-35,000/hectare',
                'profit': '₹45,000-85,000/hectare',
                'tips': [
                    'Maintain 2-5 cm standing water',
                    'Transplant 25-30 day old seedlings',
                    'Apply fertilizer in 3 splits',
                    'Monitor for brown planthopper and blast disease'
                ]
            },
            'wheat': {
                'varieties': ['HD-2967', 'PBW-343', 'WH-147', 'DBW-187'],
                'seasons': {
                    'rabi': {'sowing': 'November-December', 'harvest': 'March-April'}
                },
                'fertilizer': {'N': 120, 'P': 80, 'K': 60, 'unit': 'kg/hectare'},
                'water': '350-400 mm total',
                'yield': '4-5 tonnes/hectare',
                'cost': '₹20,000-30,000/hectare',
                'profit': '₹50,000-75,000/hectare',
                'tips': [
                    'Sow when temperature is 18-25°C',
                    'Use seed rate of 100-125 kg/hectare',
                    'Irrigate at critical growth stages',
                    'Monitor for yellow rust and aphids'
                ]
            },
            'cotton': {
                'varieties': ['Bollgard II', 'RCH-2', 'Suraj', 'Ankur-651'],
                'seasons': {
                    'kharif': {'sowing': 'April-May', 'harvest': 'October-December'}
                },
                'fertilizer': {'N': 120, 'P': 60, 'K': 60, 'unit': 'kg/hectare'},
                'water': '700-1300 mm total',
                'yield': '15-20 quintals/hectare',
                'cost': '₹30,000-45,000/hectare',
                'profit': '₹60,000-1,20,000/hectare',
                'tips': [
                    'Plant at 90x45 cm spacing',
                    'Use drip irrigation if possible',
                    'Monitor for bollworm and whitefly',
                    'Pick cotton regularly to maintain quality'
                ]
            },
            'maize': {
                'varieties': ['Pioneer', 'Dekalb', 'NK-6240', 'Ganga-5'],
                'seasons': {
                    'kharif': {'sowing': 'June-July', 'harvest': 'September-October'},
                    'rabi': {'sowing': 'November-December', 'harvest': 'March-April'}
                },
                'fertilizer': {'N': 120, 'P': 60, 'K': 40, 'unit': 'kg/hectare'},
                'water': '500-800 mm total',
                'yield': '6-8 tonnes/hectare',
                'cost': '₹25,000-35,000/hectare',
                'profit': '₹40,000-70,000/hectare',
                'tips': [
                    'Plant at 60x20 cm spacing',
                    'Critical water need at tasseling stage',
                    'Side dress nitrogen at knee-high stage',
                    'Watch for fall armyworm and stem borer'
                ]
            }
        }
    
    def _load_pest_knowledge(self):
        """Load pest and disease management data"""
        return {
            'aphids': {
                'crops': ['wheat', 'cotton', 'mustard'],
                'symptoms': ['Curled leaves', 'Sticky honeydew', 'Yellowing'],
                'organic_control': ['Neem oil spray', 'Ladybird beetle release', 'Yellow sticky traps'],
                'chemical_control': ['Imidacloprid 0.05%', 'Thiamethoxam 0.2g/L'],
                'prevention': ['Avoid excess nitrogen', 'Maintain field hygiene', 'Monitor regularly']
            },
            'bollworm': {
                'crops': ['cotton', 'tomato', 'chickpea'],
                'symptoms': ['Holes in bolls/fruits', 'Caterpillar presence', 'Damaged flowers'],
                'organic_control': ['Bt spray', 'Pheromone traps', 'NPV application'],
                'chemical_control': ['Chlorantraniliprole', 'Flubendiamide'],
                'prevention': ['Crop rotation', 'Deep ploughing', 'Resistant varieties']
            }
        }
    
    def _load_fertilizer_knowledge(self):
        """Load fertilizer recommendation data"""
        return {
            'soil_types': {
                'clayey': {'drainage': 'poor', 'fertility': 'high', 'recommendations': 'Improve drainage, reduce nitrogen'},
                'sandy': {'drainage': 'excellent', 'fertility': 'low', 'recommendations': 'Add organic matter, frequent irrigation'},
                'loamy': {'drainage': 'good', 'fertility': 'medium', 'recommendations': 'Ideal for most crops, balanced fertilization'}
            }
        }

class AgriBotAI:
    """AgriBot AI Engine - Knowledge Base Version"""
    
    def __init__(self):
        self.knowledge_base = AgriBotKnowledgeBase()
        self.conversation_history = []
        
    def analyze_query(self, message: str) -> Dict[str, Any]:
        """Analyze user query and extract intent"""
        message_lower = message.lower()
        
        # Extract crop mentions
        crops = []
        for crop in self.knowledge_base.crop_data.keys():
            if crop in message_lower:
                crops.append(crop)
        
        # Extract topics
        topics = []
        if any(word in message_lower for word in ['fertilizer', 'nutrient', 'npk', 'urea']):
            topics.append('fertilizer')
        if any(word in message_lower for word in ['pest', 'disease', 'insect', 'bug']):
            topics.append('pest')
        if any(word in message_lower for word in ['irrigation', 'water', 'drip']):
            topics.append('irrigation')
        if any(word in message_lower for word in ['cost', 'profit', 'economics', 'price']):
            topics.append('economics')
        if any(word in message_lower for word in ['variety', 'seed', 'cultivar']):
            topics.append('varieties')
        if any(word in message_lower for word in ['season', 'kharif', 'rabi', 'plant', 'sow', 'crop']):
            topics.append('seasonal')
        
        return {
            'crops': crops,
            'topics': topics,
            'query_type': self._determine_query_type(message_lower),
            'language': 'hindi' if any(char in message for char in 'अआइईउऊएऐओऔकखगघ') else 'english'
        }
    
    def _determine_query_type(self, message: str) -> str:
        """Determine the type of query"""
        if any(word in message for word in ['how', 'कैसे', 'method', 'process']):
            return 'how_to'
        elif any(word in message for word in ['when', 'कब', 'time', 'season']):
            return 'timing'
        elif any(word in message for word in ['cost', 'price', 'profit', 'लागत']):
            return 'economics'
        elif any(word in message for word in ['problem', 'issue', 'disease', 'समस्या']):
            return 'problem'
        else:
            return 'general'
    
    def generate_response(self, message: str, context: Dict = None) -> Dict[str, Any]:
        """Generate AI response using knowledge base"""
        try:
            # Analyze the query
            analysis = self.analyze_query(message)
            
            # Generate response based on analysis
            if analysis['crops']:
                response = self._generate_crop_response(analysis, message)
            elif 'fertilizer' in analysis['topics']:
                response = self._generate_fertilizer_response(analysis, message)
            elif 'pest' in analysis['topics']:
                response = self._generate_pest_response(analysis, message)
            elif 'seasonal' in analysis['topics']:
                response = self._generate_seasonal_response(analysis, message)
            else:
                response = self._generate_general_response(analysis, message)
            
            # Add metadata
            response.update({
                'success': True,
                'model_type': 'agribot_knowledge_base',
                'analysis': analysis,
                'timestamp': datetime.now().isoformat(),
                'agribot_version': '2.0.0'
            })
            
            # Store in conversation history
            self.conversation_history.append({
                'user_message': message,
                'agribot_response': response['advice'],
                'timestamp': datetime.now().isoformat()
            })
            
            return response
            
        except Exception as e:
            logger.error(f"AgriBot response generation error: {e}")
            return {
                'success': False,
                'error': str(e),
                'advice': 'Sorry, I encountered an error processing your request.',
                'model_type': 'error'
            }
    
    def _generate_crop_response(self, analysis: Dict, message: str) -> Dict[str, Any]:
        """Generate crop-specific response"""
        crop = analysis['crops'][0]
        crop_data = self.knowledge_base.crop_data[crop]
        
        advice = f"""🌾 **{crop.title()} Cultivation Guide by AgriBot**

**🌱 Recommended Varieties:**
{', '.join(crop_data['varieties'])}

**📅 Sowing & Harvest Seasons:**"""
        
        for season, timing in crop_data['seasons'].items():
            advice += f"\n• **{season.title()}:** Sow in {timing['sowing']}, harvest in {timing['harvest']}"
        
        advice += f"""

**🧪 Fertilizer Recommendation:**
• NPK: {crop_data['fertilizer']['N']}:{crop_data['fertilizer']['P']}:{crop_data['fertilizer']['K']} {crop_data['fertilizer']['unit']}

**💧 Water Requirement:**
• Total: {crop_data['water']}

**💰 Economics:**
• Investment: {crop_data['cost']}
• Expected yield: {crop_data['yield']}
• Potential profit: {crop_data['profit']}

**💡 AgriBot Pro Tips:**"""
        
        for tip in crop_data['tips']:
            advice += f"\n• {tip}"
        
        advice += f"\n\n📱 Need more specific help? Ask AgriBot about pest control, soil preparation, or market prices!"
        
        return {'advice': advice}
    
    def _generate_seasonal_response(self, analysis: Dict, message: str) -> Dict[str, Any]:
        """Generate seasonal crop recommendations"""
        advice = """🌾 **Seasonal Crop Planning by AgriBot**

**🌧️ Current Season Recommendations:**

**Kharif Season (June-October):**
• **Rice:** High profit potential, good water availability
• **Cotton:** Excellent for commercial farming
• **Maize:** Fast growing, dual purpose crop
• **Sugarcane:** Long-term investment crop

**❄️ Rabi Season (November-April):**
• **Wheat:** Staple crop, reliable income
• **Mustard:** Oilseed crop, good market demand
• **Gram/Chickpea:** Pulse crop, soil improvement
• **Barley:** Drought tolerant option

**☀️ Zaid Season (April-June):**
• **Watermelon:** High value fruit crop
• **Fodder crops:** For livestock
• **Green gram:** Quick harvest pulse

**💡 Crop Selection Tips:**
• Consider local climate and soil type
• Check water availability
• Analyze market demand and prices
• Plan crop rotation for soil health
• Consider government support schemes

**📊 Profitability Ranking (Current Market):**
1. Cotton (highest profit potential)
2. Rice (stable returns)
3. Wheat (reliable income)
4. Maize (moderate returns)

Ask AgriBot about specific crops for detailed cultivation guidance!"""
        
        return {'advice': advice}
    
    def _generate_fertilizer_response(self, analysis: Dict, message: str) -> Dict[str, Any]:
        """Generate fertilizer-specific response"""
        advice = """🧪 **AgriBot Fertilizer Management Guide**

**📊 Soil Testing First:**
• Get soil tested every 2-3 years
• Test for pH, NPK, organic carbon, micronutrients
• Cost: ₹50-200 per sample

**🌾 Crop-wise NPK Requirements (kg/hectare):**
```
Crop          N     P₂O₅   K₂O
Rice         120    60     40
Wheat        120    80     60  
Cotton       120    60     60
Maize        120    60     40
```

**⏰ Application Timing:**
• **Basal (at sowing):** 100% P&K + 25% N
• **First split (30 days):** 50% remaining N
• **Second split (60 days):** 25% remaining N

**🌿 Organic Alternatives:**
• FYM: 10-15 tonnes/hectare
• Vermicompost: 3-5 tonnes/hectare
• Green manure: Dhaincha, sunhemp

**💰 Cost Optimization Tips:**
• Buy from authorized dealers
• Use soil test recommendations
• Combine organic + inorganic
• Check government subsidies

**⚠️ AgriBot Warning:** Over-fertilization reduces yield and pollutes environment!"""
        
        return {'advice': advice}
    
    def _generate_pest_response(self, analysis: Dict, message: str) -> Dict[str, Any]:
        """Generate pest management response"""
        advice = """🐛 **AgriBot Integrated Pest Management (IPM)**

**🔍 Prevention First:**
• Regular field monitoring (weekly)
• Maintain field cleanliness
• Use resistant varieties
• Proper crop rotation

**🌿 Biological Control:**
• **Beneficial insects:** Ladybirds, lacewings, spiders
• **Biopesticides:** Neem oil, Bt formulations
• **Pheromone traps:** For monitoring and mass trapping

**⚗️ Chemical Control (Last Resort):**
• Use only when economic threshold crossed
• Rotate different chemical groups
• Follow label instructions strictly
• Observe pre-harvest interval

**🚨 Common Issues & Solutions:**
• **Aphids:** Yellow sticky traps + neem oil
• **Bollworm:** Pheromone traps + Bt spray
• **Fungal diseases:** Proper spacing + fungicide spray

**⚠️ Safety Measures:**
• Wear protective equipment
• Don't spray during flowering
• Store pesticides safely

**💡 AgriBot Tip:** Early detection and prevention are better than cure!"""
        
        return {'advice': advice}
    
    def _generate_general_response(self, analysis: Dict, message: str) -> Dict[str, Any]:
        """Generate general farming response"""
        advice = """🤖 **Welcome to AgriBot - Your AI Farming Assistant!**

I'm AgriBot, powered by advanced knowledge systems to help farmers succeed! 🌾

**🎯 What I Can Help You With:**

**🌱 Crop Guidance:**
• Variety selection for your region
• Sowing and harvesting schedules
• Yield optimization techniques

**🧪 Input Management:**
• Fertilizer recommendations (NPK)
• Soil health improvement
• Organic farming methods

**🐛 Plant Protection:**
• Pest and disease identification
• Integrated pest management (IPM)
• Organic control methods

**💧 Water Management:**
• Irrigation scheduling
• Water conservation techniques
• Drip irrigation guidance

**💰 Farm Economics:**
• Cost analysis and budgeting
• Profit calculation
• Market insights

**📝 Example Questions:**
• "How to grow rice in kharif season?"
• "NPK fertilizer for wheat crop"
• "How to control cotton bollworm?"
• "Best crops for this season"
• "Drip irrigation cost for tomatoes"

**💡 Pro Tip:** Be specific about your location, crop, and farm size for better advice!

Ask me anything about farming - I'm here to help you grow better crops! 🚜

*Jai Kisan! Jai Vigyan!* 🌾"""
        
        return {'advice': advice}
    
    def get_conversation_history(self, limit: int = 10) -> List[Dict]:
        """Get recent conversation history"""
        return self.conversation_history[-limit:]
    
    def clear_conversation_history(self):
        """Clear conversation history"""
        self.conversation_history = []
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get AgriBot model information"""
        return {
            'name': 'AgriBot Knowledge Base',
            'type': 'local',
            'provider': 'built_in',
            'cost': 'free',
            'capabilities': [
                'Crop cultivation guidance',
                'Fertilizer recommendations',
                'Pest management',
                'Irrigation planning',
                'Farm economics',
                'Seasonal planning'
            ],
            'conversation_count': len(self.conversation_history)
        }

# AgriBot configuration
AGRIBOT_CONFIG = {
    'name': 'AgriBot with Groq AI',
    'version': '2.0.0',
    'mode': 'groq_free',
    'ai_provider': 'groq_ai',
    'knowledge_base': 'built_in'
}

def initialize_agribot():
    """Initialize AgriBot with Groq or fallback"""
    try:
        groq_api_key = os.getenv('GROQ_API_KEY') or os.getenv('GROK_API_KEY')
        
        if groq_api_key:
            print("🔄 Initializing AgriBot with Groq API...")
            agribot = GroqAgriBot(api_key=groq_api_key)
            print("✅ AgriBot with Groq initialized successfully!")
            print("🆓 Using FREE Groq API quota")
            return agribot, True
        else:
            print("⚠️ Groq API key not found, using knowledge base fallback...")
            agribot = AgriBotAI()
            print("✅ AgriBot initialized with knowledge base fallback")
            return agribot, False
            
    except Exception as e:
        print(f"❌ Groq initialization error: {e}")
        print("🔄 Falling back to knowledge base...")
        agribot = AgriBotAI()
        return agribot, False

# Initialize AgriBot on startup
agribot, groq_enabled = initialize_agribot()

# Flask Routes
@app.route('/')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'AgriBot AI Backend Running',
        'bot_name': AGRIBOT_CONFIG['name'],
        'version': AGRIBOT_CONFIG['version'],
        'mode': AGRIBOT_CONFIG['mode'],
        'ai_provider': AGRIBOT_CONFIG['ai_provider'],
        'grok_enabled': groq_enabled,
        'cost': 'FREE',
        'timestamp': datetime.now().isoformat(),
        'endpoints': {
            'health': '/',
            'chat': '/api/chat',
            'expert_advice': '/api/expert-advice',
            'model_info': '/api/model-info',
            'history': '/api/conversation-history',
            'debug': '/api/debug-grok'
        },
        'features': [
            '🆓 Completely FREE - No billing required',
            '🌾 Expert farming knowledge',
            '🤖 Groq AI-powered responses' if groq_enabled else '🧠 Knowledge base responses',
            '🌍 Multi-language support',
            '📱 Easy API integration'
        ]
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """AgriBot chat endpoint"""
    try:
        # Validate request
        if not request.is_json:
            return jsonify({
                'success': False,
                'error': 'Request must be JSON'
            }), 400
        
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'success': False,
                'error': 'Message field is required'
            }), 400
        
        message = data['message'].strip()
        if not message:
            return jsonify({
                'success': False,
                'error': 'Message cannot be empty'
            }), 400
        
        context = data.get('context', {})
        
        logger.info(f"💬 AgriBot chat request: {message[:100]}...")
        
        # Generate response using AgriBot (Groq or fallback)
        if hasattr(agribot, 'get_farming_advice'):
            # Groq method
            response = agribot.get_farming_advice(message, context)
            
            # If Groq fails, fallback to knowledge base
            if not response.get('success', False):
                logger.warning("Groq failed, using knowledge base fallback...")
                fallback_bot = AgriBotAI()
                response = fallback_bot.generate_response(message, context)
                response['fallback_used'] = True
                response['provider'] = 'knowledge_base'
        else:
            # Knowledge base method
            response = agribot.generate_response(message, context)
        
        logger.info(f"✅ AgriBot response generated successfully")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"❌ AgriBot chat error: {e}")
        traceback.print_exc()
        
        # Emergency fallback
        try:
            fallback_bot = AgriBotAI()
            response = fallback_bot.generate_response(data.get('message', 'help'), {})
            response['emergency_fallback'] = True
            return jsonify(response)
        except:
            return jsonify({
                'success': False,
                'error': f'AgriBot error: {str(e)}',
                'advice': 'Sorry, AgriBot encountered an error. Please try again.',
                'model_type': 'error',
                'timestamp': datetime.now().isoformat()
            }), 500

@app.route('/api/expert-advice', methods=['POST'])
def expert_advice():
    """Expert advice endpoint (compatibility)"""
    return chat()

@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Get AgriBot model information"""
    try:
        info = agribot.get_model_info()
        
        return jsonify({
            'success': True,
            'model_info': info,
            'ai_backend_status': 'online',
            'agribot_status': 'active',
            'grok_enabled': groq_enabled,
            'cost_info': {
                'usage_cost': 'FREE',
                'billing_required': False,
                'api_limits': info.get('limits', 'None'),
                'provider': info.get('provider', 'local')
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Model info error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'ai_backend_status': 'error',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/conversation-history', methods=['GET'])
def get_history():
    """Get conversation history"""
    try:
        limit = request.args.get('limit', 10, type=int)
        history = agribot.get_conversation_history(limit=limit)
        
        return jsonify({
            'success': True,
            'history': history,
            'count': len(history),
            'agribot_info': {
                'name': AGRIBOT_CONFIG['name'],
                'version': AGRIBOT_CONFIG['version'],
                'grok_enabled': groq_enabled
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"History error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/clear-history', methods=['POST'])
def clear_history():
    """Clear conversation history"""
    try:
        agribot.clear_conversation_history()
        return jsonify({
            'success': True,
            'message': 'AgriBot conversation history cleared',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Clear history error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/debug-grok', methods=['GET'])
def debug_grok():
    """Debug Grok API connectivity"""
    try:
        grok_api_key = os.getenv('GROK_API_KEY')
        
        if not grok_api_key:
            return jsonify({
                'success': False,
                'error': 'GROK_API_KEY not found in environment',
                'solution': 'Add GROK_API_KEY to your .env file',
                'grok_enabled': False
            })
        
        # Test simple request
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {grok_api_key}"
        }
        
        payload = {
            "model": "grok-beta",
            "messages": [{"role": "user", "content": "Hello"}],
            "max_tokens": 100
        }
        
        response = requests.post(
            "https://api.x.ai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=10
        )
        
        return jsonify({
            'success': response.status_code == 200,
            'status_code': response.status_code,
            'response_preview': response.text[:200] + '...' if len(response.text) > 200 else response.text,
            'api_key_preview': f"{grok_api_key[:10]}...{grok_api_key[-5:]}",
            'grok_enabled': groq_enabled,
            'test_message': 'Grok API connectivity test completed'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'grok_enabled': groq_enabled,
            'traceback': traceback.format_exc()
        })

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'agribot_help': 'Use /api/chat for farming questions',
        'available_endpoints': [
            '/',
            '/api/chat',
            '/api/expert-advice',
            '/api/model-info',
            '/api/conversation-history',
            '/api/debug-grok'
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'AgriBot encountered an issue. Please try again.'
    }), 500

if __name__ == '__main__':
    print("🤖 AgriBot AI Backend with Groq Integration")
    print("=" * 60)
    print("🆓 No billing required - Completely FREE!")
    print("🌾 Advanced farming knowledge built-in")
    if groq_enabled:
        print("🚀 Groq AI-powered expert responses")
        print("📊 Free Quota: 14,400 requests/day")
    else:
        print("🧠 Knowledge base responses (fallback)")
    print("=" * 60)
    
    # Get configuration
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    
    print(f"🌐 Starting AgriBot on http://{host}:{port}")
    print(f"🔧 Debug mode: {debug}")
    print("=" * 60)
    print("📡 AgriBot Endpoints:")
    print("   🏥 Health Check: /")
    print("   💬 Chat with AgriBot: /api/chat")
    print("   🧑‍🌾 Expert Advice: /api/expert-advice")
    print("   ℹ️ Model Info: /api/model-info")
    print("   📜 Chat History: /api/conversation-history")
    print("   🔍 Debug Grok: /api/debug-grok")
    print("=" * 60)
    print("🚀 AgriBot is ready! Ask farming questions and get expert advice!")
    print("💡 Example: POST to /api/chat with {'message': 'How to grow rice?'}")
    print("=" * 60)
    
    try:
        app.run(host=host, port=port, debug=debug, threaded=True)
    except KeyboardInterrupt:
        print("\n👋 AgriBot stopped by user")
    except Exception as e:
        print(f"\n❌ AgriBot startup error: {e}")
        traceback.print_exc()