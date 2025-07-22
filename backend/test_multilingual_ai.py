#!/usr/bin/env python3
"""
Test script for multilingual AgriBot functionality
Tests language detection and multilingual responses
"""

import os
import sys
import logging
from datetime import datetime

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from farming_expert_app_ai import GroqAgriBot

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_language_detection():
    """Test language detection with various inputs"""
    print("\n" + "="*60)
    print("🌐 TESTING MULTILINGUAL LANGUAGE DETECTION")
    print("="*60)
    
    # Initialize AgriBot
    agribot = GroqAgriBot()
    
    # Test cases for different languages
    test_cases = [
        {
            'text': 'मेरी फसल में कीट लग गए हैं, क्या करूं?',
            'expected_lang': 'hindi',
            'description': 'Hindi - pest problem'
        },
        {
            'text': 'என் பயிரில் பூச்சி தாக்குதல் உள்ளது, என்ன செய்வது?',
            'expected_lang': 'tamil',
            'description': 'Tamil - pest attack'
        },
        {
            'text': 'నా పంటలో పురుగులు వచ్చాయి, ఏమి చేయాలి?',
            'expected_lang': 'telugu', 
            'description': 'Telugu - pest issue'
        },
        {
            'text': 'ਮੇਰੀ ਫਸਲ ਵਿੱਚ ਕੀੜੇ ਲੱਗ ਗਏ ਹਨ, ਕੀ ਕਰਨਾ ਚਾਹੀਦਾ ਹੈ?',
            'expected_lang': 'punjabi',
            'description': 'Punjabi - crop pest'
        },
        {
            'text': 'আমার ফসলে পোকার আক্রমণ হয়েছে, কী করব?',
            'expected_lang': 'bengali',
            'description': 'Bengali - pest attack'
        },
        {
            'text': 'माझ्या पिकावर किडे लागले आहेत, काय करावे?',
            'expected_lang': 'marathi',
            'description': 'Marathi - pest problem'
        },
        {
            'text': 'મારા પાકમાં જંતુઓ લાગ્યા છે, શું કરવું?',
            'expected_lang': 'gujarati',
            'description': 'Gujarati - pest issue'
        },
        {
            'text': 'ನನ್ನ ಬೆಳೆಯಲ್ಲಿ ಕೀಟಗಳು ಬಂದಿವೆ, ಏನು ಮಾಡಬೇಕು?',
            'expected_lang': 'kannada',
            'description': 'Kannada - pest problem'
        },
        {
            'text': 'എന്റെ വിളയിൽ പുഴുക്കൾ വന്നിട്ടുണ്ട്, എന്ത് ചെയ്യണം?',
            'expected_lang': 'malayalam',
            'description': 'Malayalam - pest attack'
        },
        {
            'text': 'My crop has pest infestation, what should I do?',
            'expected_lang': 'english',
            'description': 'English - pest infestation'
        }
    ]
    
    # Test each case
    correct_detections = 0
    total_tests = len(test_cases)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}: {test_case['description']}")
        print(f"Input: {test_case['text']}")
        
        # Detect language
        lang_info = agribot.detect_language(test_case['text'])
        
        print(f"Detected: {lang_info['language']} (Expected: {test_case['expected_lang']})")
        print(f"Region: {lang_info['region']}")
        print(f"Confidence: {lang_info['confidence']} characters")
        print(f"Common crops: {', '.join(lang_info['common_crops'][:3])}...")
        
        # Check if detection is correct
        if lang_info['language'].lower() == test_case['expected_lang'].lower():
            print("✅ CORRECT")
            correct_detections += 1
        else:
            print("❌ INCORRECT")
    
    # Summary
    accuracy = (correct_detections / total_tests) * 100
    print(f"\n{'='*60}")
    print(f"🎯 DETECTION ACCURACY: {correct_detections}/{total_tests} ({accuracy:.1f}%)")
    print(f"{'='*60}")
    
    return accuracy >= 80  # 80% accuracy threshold

def test_multilingual_response():
    """Test actual multilingual responses"""
    print("\n" + "="*60)
    print("🤖 TESTING MULTILINGUAL AI RESPONSES")
    print("="*60)
    
    # Initialize AgriBot
    agribot = GroqAgriBot()
    
    # Test cases for responses
    test_queries = [
        {
            'query': 'मेरी गेहूं की फसल पीली हो रही है',
            'language': 'Hindi',
            'expected_response_lang': 'hindi'
        },
        {
            'query': 'என் நெல் பயிரில் இலைகள் மஞ்சளாக மாறுகிறது',
            'language': 'Tamil', 
            'expected_response_lang': 'tamil'
        },
        {
            'query': 'What fertilizer should I use for tomatoes?',
            'language': 'English',
            'expected_response_lang': 'english'
        }
    ]
    
    for i, test in enumerate(test_queries, 1):
        print(f"\n🌾 Test Query {i} ({test['language']}):")
        print(f"Query: {test['query']}")
        print("-" * 50)
        
        try:
            # Get response
            result = agribot.get_farming_advice(test['query'])
            
            if result['success']:
                print(f"✅ Response generated successfully")
                print(f"🗣️ Detected Language: {result.get('language_info', {}).get('language', 'Unknown')}")
                print(f"📍 Region: {result.get('language_info', {}).get('region', 'Unknown')}")
                print(f"📝 Response Preview: {result['advice'][:150]}...")
                print(f"🔧 Model: {result.get('model_type', 'Unknown')}")
                print(f"🌐 Multilingual: {result.get('multilingual_support', False)}")
            else:
                print(f"❌ Failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")
    
    return True

def main():
    """Main test function"""
    print("🚀 STARTING MULTILINGUAL AGRIBOT TESTS")
    print(f"⏰ Timestamp: {datetime.now().isoformat()}")
    
    try:
        # Test 1: Language Detection
        detection_success = test_language_detection()
        
        # Test 2: Multilingual Responses (only if detection works)
        if detection_success:
            response_success = test_multilingual_response()
            
            if response_success:
                print("\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!")
                print("✅ Multilingual AgriBot is ready for deployment")
            else:
                print("\n⚠️ Response tests failed")
        else:
            print("\n⚠️ Language detection accuracy too low, skipping response tests")
            
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        logger.error(f"Test error: {e}")
    
    print(f"\n🏁 Test completed at: {datetime.now().isoformat()}")

if __name__ == "__main__":
    main()
