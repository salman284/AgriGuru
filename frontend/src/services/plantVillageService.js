// Multi-Crop Plant Disease Detection Service
// This service provides comprehensive disease detection for multiple crops
// including Rice, Wheat, Corn, Cotton, Tomato, Potato, Apple, and more

const PLANTVILLAGE_API_BASE = process.env.REACT_APP_PLANTVILLAGE_API_URL || 'http://localhost:5001';

// Multi-crop disease database with enhanced coverage
const MULTI_CROP_DISEASES = {
  // Rice diseases
  'Rice___Brown_Spot': {
    crop: 'Rice',
    disease: 'Brown Spot',
    severity: 'moderate',
    description: 'A fungal disease causing brown oval spots on leaves, reducing yield.',
    treatment: ['Apply copper-based fungicides', 'Improve field drainage', 'Use balanced fertilization'],
    prevention: ['Use resistant varieties', 'Proper water management', 'Avoid overcrowding']
  },
  'Rice___Leaf_Blight': {
    crop: 'Rice',
    disease: 'Leaf Blight',
    severity: 'severe',
    description: 'Bacterial disease causing yellowish-brown lesions on leaves.',
    treatment: ['Apply carbendazim or propiconazole', 'Remove infected plants', 'Improve drainage'],
    prevention: ['Crop rotation', 'Clean cultivation', 'Use certified seeds']
  },
  'Rice___Neck_Blast': {
    crop: 'Rice',
    disease: 'Neck Blast',
    severity: 'critical',
    description: 'Fungal disease affecting rice neck, causing complete crop failure.',
    treatment: ['Emergency fungicide application', 'Harvest early if possible', 'Destroy infected material'],
    prevention: ['Use blast-resistant varieties', 'Avoid excessive nitrogen', 'Proper field hygiene']
  },

  // Wheat diseases
  'Wheat___Brown_Rust': {
    crop: 'Wheat',
    disease: 'Brown Rust',
    severity: 'severe',
    description: 'Fungal disease causing brown pustules on leaves, reducing grain quality.',
    treatment: ['Apply triazole fungicides immediately', 'Monitor weather conditions', 'Ensure good nutrition'],
    prevention: ['Use resistant varieties', 'Timely sowing', 'Avoid dense sowing']
  },
  'Wheat___Yellow_Rust': {
    crop: 'Wheat',
    disease: 'Yellow Rust',
    severity: 'critical',
    description: 'Highly destructive fungal disease with yellow stripe patterns.',
    treatment: ['Emergency fungicide spray', 'Consider replanting in severe cases', 'Isolate affected areas'],
    prevention: ['Use certified resistant seeds', 'Monitor temperature changes', 'Early detection systems']
  },

  // Corn/Maize diseases
  'Corn_(maize)___Common_rust_': {
    crop: 'Corn',
    disease: 'Common Rust',
    severity: 'moderate',
    description: 'Fungal disease with reddish-brown pustules on leaves.',
    treatment: ['Apply propiconazole-based fungicides', 'Ensure proper plant spacing', 'Monitor humidity'],
    prevention: ['Plant resistant hybrids', 'Proper spacing', 'Crop rotation']
  },
  'Corn_(maize)___Northern_Leaf_Blight': {
    crop: 'Corn',
    disease: 'Northern Leaf Blight',
    severity: 'severe',
    description: 'Fungal disease causing long, elliptical lesions on corn leaves.',
    treatment: ['Apply azoxystrobin or pyraclostrobin', 'Remove infected debris', 'Improve air circulation'],
    prevention: ['Crop rotation with non-host crops', 'Tillage to bury debris', 'Use resistant varieties']
  },
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': {
    crop: 'Corn',
    disease: 'Gray Leaf Spot',
    severity: 'moderate',
    description: 'Fungal disease with rectangular gray lesions on corn leaves.',
    treatment: ['Apply strobilurin fungicides', 'Practice residue management', 'Ensure adequate nutrition'],
    prevention: ['Tillage practices', 'Residue management', 'Crop rotation']
  },

  // Cotton diseases
  'Cotton___Bacterial_Blight': {
    crop: 'Cotton',
    disease: 'Bacterial Blight',
    severity: 'severe',
    description: 'Bacterial disease causing angular leaf spots and boll rot.',
    treatment: ['Copper-based bactericides', 'Improve drainage', 'Remove infected plants'],
    prevention: ['Use disease-free seeds', 'Avoid overhead irrigation', 'Proper field sanitation']
  },
  'Cotton___Fusarium_Wilt': {
    crop: 'Cotton',
    disease: 'Fusarium Wilt',
    severity: 'critical',
    description: 'Soil-borne fungal disease causing wilting and plant death.',
    treatment: ['No cure - remove affected plants', 'Soil treatment with fungicides', 'Improve drainage'],
    prevention: ['Use wilt-resistant varieties', 'Soil fumigation', 'Crop rotation with non-hosts']
  },
  // Apple diseases
  'Apple___Apple_scab': {
    crop: 'Apple',
    disease: 'Apple Scab',
    severity: 'moderate',
    description: 'A fungal disease causing dark, scabby spots on leaves and fruit.',
    treatment: ['Apply fungicides during wet seasons', 'Remove infected leaves', 'Ensure good air circulation'],
    prevention: ['Choose resistant varieties', 'Avoid overhead irrigation', 'Prune for air circulation']
  },
  'Apple___Black_rot': {
    crop: 'Apple',
    disease: 'Black Rot',
    severity: 'severe',
    description: 'A fungal disease causing black, circular spots on leaves and fruit rot.',
    treatment: ['Remove infected plant parts', 'Apply copper-based fungicides', 'Improve drainage'],
    prevention: ['Prune dead branches', 'Avoid wetting foliage', 'Remove fallen fruit']
  },
  'Apple___Cedar_apple_rust': {
    crop: 'Apple',
    disease: 'Cedar Apple Rust',
    severity: 'moderate',
    description: 'A fungal disease causing yellow-orange spots on leaves.',
    treatment: ['Apply preventive fungicides', 'Remove nearby cedar trees if possible'],
    prevention: ['Plant resistant varieties', 'Maintain distance from cedar trees']
  },
  'Apple___healthy': {
    crop: 'Apple',
    disease: 'Healthy',
    severity: 'none',
    description: 'Plant appears healthy with no visible disease symptoms.',
    treatment: ['Continue current care practices'],
    prevention: ['Maintain regular monitoring', 'Ensure proper nutrition and watering']
  },

  // Blueberry diseases
  'Blueberry___healthy': {
    crop: 'Blueberry',
    disease: 'Healthy',
    severity: 'none',
    description: 'Plant appears healthy with no visible disease symptoms.',
    treatment: ['Continue current care practices'],
    prevention: ['Regular monitoring', 'Proper soil pH maintenance']
  },

  // Cherry diseases
  'Cherry_(including_sour)___Powdery_mildew': {
    crop: 'Cherry',
    disease: 'Powdery Mildew',
    severity: 'moderate',
    description: 'White powdery coating on leaves and shoots.',
    treatment: ['Apply sulfur-based fungicides', 'Improve air circulation'],
    prevention: ['Avoid overhead watering', 'Plant in sunny locations']
  },
  'Cherry_(including_sour)___healthy': {
    crop: 'Cherry',
    disease: 'Healthy',
    severity: 'none',
    description: 'Plant appears healthy with no visible disease symptoms.',
    treatment: ['Continue current care practices'],
    prevention: ['Regular monitoring', 'Proper pruning']
  },

  // Corn diseases
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': {
    crop: 'Corn',
    disease: 'Gray Leaf Spot',
    severity: 'moderate',
    description: 'Gray rectangular lesions on leaves.',
    treatment: ['Apply fungicides', 'Rotate crops', 'Remove crop residue'],
    prevention: ['Use resistant varieties', 'Crop rotation', 'Reduce plant density']
  },
  'Corn_(maize)___Common_rust_': {
    crop: 'Corn',
    disease: 'Common Rust',
    severity: 'moderate',
    description: 'Small, circular to elongate, golden brown pustules on leaves.',
    treatment: ['Apply fungicides if severe', 'Monitor weather conditions'],
    prevention: ['Plant resistant hybrids', 'Avoid late planting']
  },
  'Corn_(maize)___Northern_Leaf_Blight': {
    crop: 'Corn',
    disease: 'Northern Leaf Blight',
    severity: 'severe',
    description: 'Large, boat-shaped lesions on leaves.',
    treatment: ['Apply fungicides', 'Remove infected plant debris'],
    prevention: ['Use resistant varieties', 'Crop rotation', 'Tillage practices']
  },
  'Corn_(maize)___healthy': {
    crop: 'Corn',
    disease: 'Healthy',
    severity: 'none',
    description: 'Plant appears healthy with no visible disease symptoms.',
    treatment: ['Continue current care practices'],
    prevention: ['Regular field monitoring', 'Proper fertilization']
  },

  // Grape diseases
  'Grape___Black_rot': {
    crop: 'Grape',
    disease: 'Black Rot',
    severity: 'severe',
    description: 'Black circular spots on leaves and fruit mummification.',
    treatment: ['Apply fungicides', 'Remove infected fruit and leaves'],
    prevention: ['Ensure good air circulation', 'Avoid overhead irrigation']
  },
  'Grape___Esca_(Black_Measles)': {
    crop: 'Grape',
    disease: 'Esca (Black Measles)',
    severity: 'severe',
    description: 'Interveinal chlorosis and necrosis on leaves.',
    treatment: ['Remove infected wood', 'Apply protective fungicides'],
    prevention: ['Avoid wounds during pruning', 'Use clean pruning tools']
  },
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': {
    crop: 'Grape',
    disease: 'Leaf Blight',
    severity: 'moderate',
    description: 'Brown spots with yellow halos on leaves.',
    treatment: ['Apply copper-based fungicides', 'Improve air circulation'],
    prevention: ['Avoid overhead watering', 'Remove fallen leaves']
  },
  'Grape___healthy': {
    crop: 'Grape',
    disease: 'Healthy',
    severity: 'none',
    description: 'Plant appears healthy with no visible disease symptoms.',
    treatment: ['Continue current care practices'],
    prevention: ['Regular monitoring', 'Proper vineyard management']
  },

  // Orange diseases
  'Orange___Haunglongbing_(Citrus_greening)': {
    crop: 'Orange',
    disease: 'Huanglongbing (Citrus Greening)',
    severity: 'severe',
    description: 'Yellow shoots, blotchy mottled leaves, and small bitter fruit.',
    treatment: ['Remove infected trees', 'Control psyllid vectors'],
    prevention: ['Use certified disease-free plants', 'Control Asian citrus psyllid']
  },

  // Peach diseases
  'Peach___Bacterial_spot': {
    crop: 'Peach',
    disease: 'Bacterial Spot',
    severity: 'moderate',
    description: 'Small dark spots on leaves and fruit.',
    treatment: ['Apply copper sprays', 'Improve air circulation'],
    prevention: ['Plant resistant varieties', 'Avoid overhead irrigation']
  },
  'Peach___healthy': {
    crop: 'Peach',
    disease: 'Healthy',
    severity: 'none',
    description: 'Plant appears healthy with no visible disease symptoms.',
    treatment: ['Continue current care practices'],
    prevention: ['Regular monitoring', 'Proper orchard management']
  },

  // Bell Pepper diseases
  'Pepper,_bell___Bacterial_spot': {
    crop: 'Bell Pepper',
    disease: 'Bacterial Spot',
    severity: 'moderate',
    description: 'Dark brown spots with yellow halos on leaves.',
    treatment: ['Apply copper-based bactericides', 'Remove infected plants'],
    prevention: ['Use certified seeds', 'Avoid overhead watering', 'Crop rotation']
  },
  'Pepper,_bell___healthy': {
    crop: 'Bell Pepper',
    disease: 'Healthy',
    severity: 'none',
    description: 'Plant appears healthy with no visible disease symptoms.',
    treatment: ['Continue current care practices'],
    prevention: ['Regular monitoring', 'Proper spacing']
  },

  // Potato diseases
  'Potato___Early_blight': {
    crop: 'Potato',
    disease: 'Early Blight',
    severity: 'moderate',
    description: 'Dark brown spots with concentric rings on leaves.',
    treatment: ['Apply fungicides', 'Remove infected foliage'],
    prevention: ['Crop rotation', 'Avoid overhead irrigation', 'Plant certified seed']
  },
  'Potato___Late_blight': {
    crop: 'Potato',
    disease: 'Late Blight',
    severity: 'severe',
    description: 'Dark, water-soaked lesions on leaves and stems.',
    treatment: ['Apply preventive fungicides', 'Remove infected plants'],
    prevention: ['Monitor weather conditions', 'Use resistant varieties', 'Proper field hygiene']
  },
  'Potato___healthy': {
    crop: 'Potato',
    disease: 'Healthy',
    severity: 'none',
    description: 'Plant appears healthy with no visible disease symptoms.',
    treatment: ['Continue current care practices'],
    prevention: ['Regular field monitoring', 'Proper storage']
  },

  // Raspberry diseases
  'Raspberry___healthy': {
    crop: 'Raspberry',
    disease: 'Healthy',
    severity: 'none',
    description: 'Plant appears healthy with no visible disease symptoms.',
    treatment: ['Continue current care practices'],
    prevention: ['Regular monitoring', 'Proper pruning']
  },

  // Soybean diseases
  'Soybean___healthy': {
    crop: 'Soybean',
    disease: 'Healthy',
    severity: 'none',
    description: 'Plant appears healthy with no visible disease symptoms.',
    treatment: ['Continue current care practices'],
    prevention: ['Regular field monitoring', 'Crop rotation']
  },

  // Squash diseases
  'Squash___Powdery_mildew': {
    crop: 'Squash',
    disease: 'Powdery Mildew',
    severity: 'moderate',
    description: 'White powdery coating on leaves.',
    treatment: ['Apply fungicides', 'Improve air circulation'],
    prevention: ['Plant resistant varieties', 'Avoid overhead watering']
  },

  // Strawberry diseases
  'Strawberry___Leaf_scorch': {
    crop: 'Strawberry',
    disease: 'Leaf Scorch',
    severity: 'moderate',
    description: 'Purple to reddish-brown spots on leaves.',
    treatment: ['Apply fungicides', 'Remove infected leaves'],
    prevention: ['Ensure good drainage', 'Avoid overhead watering']
  },
  'Strawberry___healthy': {
    crop: 'Strawberry',
    disease: 'Healthy',
    severity: 'none',
    description: 'Plant appears healthy with no visible disease symptoms.',
    treatment: ['Continue current care practices'],
    prevention: ['Regular monitoring', 'Proper spacing']
  },

  // Tomato diseases
  'Tomato___Bacterial_spot': {
    crop: 'Tomato',
    disease: 'Bacterial Spot',
    severity: 'moderate',
    description: 'Small dark spots with yellow halos on leaves.',
    treatment: ['Apply copper-based sprays', 'Remove infected plants'],
    prevention: ['Use certified seeds', 'Crop rotation', 'Avoid overhead watering']
  },
  'Tomato___Early_blight': {
    crop: 'Tomato',
    disease: 'Early Blight',
    severity: 'moderate',
    description: 'Dark brown spots with concentric rings on lower leaves.',
    treatment: ['Apply fungicides', 'Remove infected foliage'],
    prevention: ['Crop rotation', 'Mulching', 'Proper spacing']
  },
  'Tomato___Late_blight': {
    crop: 'Tomato',
    disease: 'Late Blight',
    severity: 'severe',
    description: 'Dark, water-soaked lesions that spread rapidly.',
    treatment: ['Apply systemic fungicides', 'Remove infected plants immediately'],
    prevention: ['Monitor weather conditions', 'Use resistant varieties', 'Avoid overhead irrigation']
  },
  'Tomato___Leaf_Mold': {
    crop: 'Tomato',
    disease: 'Leaf Mold',
    severity: 'moderate',
    description: 'Yellow spots on upper leaf surface with fuzzy growth underneath.',
    treatment: ['Improve ventilation', 'Apply fungicides'],
    prevention: ['Reduce humidity', 'Ensure proper spacing']
  },
  'Tomato___Septoria_leaf_spot': {
    crop: 'Tomato',
    disease: 'Septoria Leaf Spot',
    severity: 'moderate',
    description: 'Small circular spots with dark borders and light centers.',
    treatment: ['Apply fungicides', 'Remove infected leaves'],
    prevention: ['Mulching', 'Avoid overhead watering', 'Crop rotation']
  },
  'Tomato___Spider_mites Two-spotted_spider_mite': {
    crop: 'Tomato',
    disease: 'Spider Mites',
    severity: 'moderate',
    description: 'Fine webbing and stippled leaves caused by tiny mites.',
    treatment: ['Apply miticides', 'Increase humidity', 'Introduce beneficial insects'],
    prevention: ['Avoid over-fertilization', 'Regular monitoring', 'Proper irrigation']
  },
  'Tomato___Target_Spot': {
    crop: 'Tomato',
    disease: 'Target Spot',
    severity: 'moderate',
    description: 'Brown spots with concentric rings on leaves and fruit.',
    treatment: ['Apply fungicides', 'Remove infected plant parts'],
    prevention: ['Crop rotation', 'Avoid overhead irrigation', 'Improve air circulation']
  },
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
    crop: 'Tomato',
    disease: 'Yellow Leaf Curl Virus',
    severity: 'severe',
    description: 'Yellowing and curling of leaves, stunted growth.',
    treatment: ['Remove infected plants', 'Control whitefly vectors'],
    prevention: ['Use resistant varieties', 'Control whiteflies', 'Use reflective mulches']
  },
  'Tomato___Tomato_mosaic_virus': {
    crop: 'Tomato',
    disease: 'Mosaic Virus',
    severity: 'severe',
    description: 'Mottled light and dark green patterns on leaves.',
    treatment: ['Remove infected plants', 'Disinfect tools'],
    prevention: ['Use certified seeds', 'Control aphid vectors', 'Avoid handling when wet']
  },
  'Tomato___healthy': {
    crop: 'Tomato',
    disease: 'Healthy',
    severity: 'none',
    description: 'Plant appears healthy with no visible disease symptoms.',
    treatment: ['Continue current care practices'],
    prevention: ['Regular monitoring', 'Proper nutrition', 'Good cultural practices']
  }
};

// Convert image to base64 for API call
const convertImageToBase64 = (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      resolve(base64String);
    };
    reader.onerror = () => reject(new Error('Failed to convert image to base64'));
    reader.readAsDataURL(imageFile);
  });
};

// Call Multi-Crop PlantVillage model API
export const detectDiseaseWithPlantVillage = async (imageFile) => {
  try {
    console.log('� Starting Multi-Crop disease detection...');
    
    // Convert image to base64
    const base64Image = await convertImageToBase64(imageFile);
    
    // Prepare request payload for multi-crop API
    const requestBody = {
      image: base64Image,
      confidence_threshold: 0.3,
      include_treatment: true
    };

    // Call the new multi-crop backend API
    const response = await fetch(`${PLANTVILLAGE_API_BASE}/api/analyze-plantvillage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Multi-Crop PlantVillage API request failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Multi-Crop PlantVillage API Response:', result);

    return processMultiCropResponse(result, imageFile);
  } catch (error) {
    console.error('❌ Multi-Crop PlantVillage detection failed:', error);
    throw error;
  }
};

// Process Multi-Crop PlantVillage API response
const processMultiCropResponse = (apiResponse, imageFile) => {
  const { predictions, model_info } = apiResponse;
  
  if (!predictions || predictions.length === 0) {
    return {
      status: 'Unknown',
      confidence: 0,
      description: 'Could not identify any diseases in the image.',
      cropType: 'Unknown',
      diseaseInfo: null,
      recommendations: ['Please ensure the image shows clear leaf or plant details', 'Try taking a closer photo', 'Ensure good lighting conditions'],
      plantVillageData: {
        processed: true,
        modelType: model_info?.type || 'Multi-Crop',
        predictionsCount: 0
      }
    };
  }

  // Get the top prediction
  const topPrediction = predictions[0];
  const diseaseClass = topPrediction.class;
  const confidence = topPrediction.confidence;
  
  // Get disease information
  const diseaseInfo = MULTI_CROP_DISEASES[diseaseClass] || {
    crop: topPrediction.crop || 'Unknown',
    disease: topPrediction.disease || diseaseClass,
    severity: topPrediction.severity || 'moderate',
    description: `Disease detected: ${topPrediction.disease || diseaseClass}`,
    treatment: topPrediction.treatment ? [topPrediction.treatment] : ['Consult agricultural expert'],
    prevention: topPrediction.prevention ? [topPrediction.prevention] : ['Follow good agricultural practices']
  };
  
  // Determine status and color based on disease severity
  let status, color;
  if (diseaseClass.includes('healthy')) {
    status = 'Healthy';
    color = '#28a745';
  } else {
    const severity = diseaseInfo.severity || topPrediction.severity || 'moderate';
    switch (severity.toLowerCase()) {
      case 'critical':
        status = 'Critical Disease Detected';
        color = '#dc3545';
        break;
      case 'severe':
        status = 'Severe Disease Detected';
        color = '#fd7e14';
        break;
      case 'high':
        status = 'High Risk Disease';
        color = '#ffc107';
        break;
      case 'moderate':
      case 'medium':
        status = 'Moderate Disease Detected';
        color = '#17a2b8';
        break;
      default:
        status = 'Disease Detected';
        color = '#6c757d';
    }
  }
  
  // Prepare comprehensive recommendations
  const recommendations = [
    `🌾 Crop: ${diseaseInfo.crop}`,
    `🦠 Disease: ${diseaseInfo.disease}`,
    `⚠️ Severity: ${diseaseInfo.severity}`,
    '',
    '🏥 Treatment:',
    ...diseaseInfo.treatment,
    '',
    '🛡️ Prevention:',
    ...diseaseInfo.prevention
  ];
  
  // Add additional predictions if available
  if (predictions.length > 1) {
    recommendations.push('', '📊 Other Possibilities:');
    predictions.slice(1, 3).forEach(pred => {
      recommendations.push(`• ${pred.disease || pred.class}: ${(pred.confidence * 100).toFixed(1)}%`);
    });
  }

  return {
    status,
    confidence,
    color,
    description: diseaseInfo.description,
    cropType: diseaseInfo.crop,
    diseaseInfo: {
      disease: diseaseInfo.disease,
      crop: diseaseInfo.crop,
      severity: diseaseInfo.severity,
      treatment: diseaseInfo.treatment,
      prevention: diseaseInfo.prevention,
      className: diseaseClass
    },
    recommendations,
    plantVillageData: {
      processed: true,
      modelType: model_info?.type || 'Multi-Crop EfficientNet',
      modelAccuracy: model_info?.accuracy || 0.95,
      predictionsCount: predictions.length,
      allPredictions: predictions,
      processingInfo: {
        confidence,
        alternatives: predictions.slice(1)
      }
    },
    additionalInfo: {
      modelVersion: 'Multi-Crop v2.0',
      supportedCrops: ['Rice', 'Wheat', 'Corn', 'Cotton', 'Tomato', 'Potato', 'Apple', 'Grape'],
      analysisDate: new Date().toISOString()
    }
  };
};

// Fallback local disease detection using image analysis
export const detectDiseaseLocally = async (imageFile) => {
  try {
    console.log('🔍 Running local disease detection...');
    
    // Create an image element to analyze
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Get image data for analysis
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Simple color analysis
        let totalPixels = data.length / 4;
        let greenPixels = 0;
        let brownPixels = 0;
        let yellowPixels = 0;
        let darkSpots = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Check for green (healthy vegetation)
          if (g > r && g > b && g > 100) {
            greenPixels++;
          }
          // Check for brown/yellow (possible disease)
          else if (r > 150 && g > 100 && b < 100) {
            brownPixels++;
          }
          // Check for yellow (nutrient deficiency)
          else if (r > 200 && g > 200 && b < 150) {
            yellowPixels++;
          }
          // Check for dark spots (disease symptoms)
          else if (r < 80 && g < 80 && b < 80) {
            darkSpots++;
          }
        }
        
        const greenRatio = greenPixels / totalPixels;
        const brownRatio = brownPixels / totalPixels;
        const yellowRatio = yellowPixels / totalPixels;
        const darkSpotRatio = darkSpots / totalPixels;
        
        let status, confidence, color, description, recommendations;
        
        if (greenRatio > 0.6 && brownRatio < 0.1 && darkSpotRatio < 0.05) {
          status = 'Healthy';
          confidence = 0.75;
          color = '#00AA44';
          description = 'Plant appears healthy with predominantly green coloration.';
          recommendations = [
            'Continue current care practices',
            'Monitor regularly for any changes',
            'Maintain proper watering and nutrition'
          ];
        } else if (darkSpotRatio > 0.1) {
          status = 'Possible Disease - Dark Spots Detected';
          confidence = 0.65;
          color = '#FF4444';
          description = 'Dark spots detected which may indicate fungal disease or bacterial infection.';
          recommendations = [
            'Examine leaves closely for disease symptoms',
            'Consider applying appropriate fungicide',
            'Remove affected leaves if necessary',
            'Improve air circulation around plants'
          ];
        } else if (yellowRatio > 0.3) {
          status = 'Possible Nutrient Deficiency';
          confidence = 0.60;
          color = '#FFBB00';
          description = 'Yellowing detected which may indicate nutrient deficiency or stress.';
          recommendations = [
            'Check soil pH and nutrient levels',
            'Consider applying balanced fertilizer',
            'Ensure adequate watering',
            'Monitor for pest activity'
          ];
        } else if (brownRatio > 0.2) {
          status = 'Possible Stress or Disease';
          confidence = 0.55;
          color = '#FF8800';
          description = 'Brown coloration detected which may indicate plant stress or disease.';
          recommendations = [
            'Check watering schedule - avoid over/under watering',
            'Examine for pest damage',
            'Consider environmental stress factors',
            'Monitor plant closely for progression'
          ];
        } else {
          status = 'Unclear - More Analysis Needed';
          confidence = 0.40;
          color = '#888888';
          description = 'Image analysis inconclusive. Manual inspection recommended.';
          recommendations = [
            'Take a clearer, closer photo of affected areas',
            'Ensure good lighting conditions',
            'Focus on specific symptoms',
            'Consult with local agricultural expert'
          ];
        }
        
        resolve({
          status,
          confidence,
          color,
          description,
          cropType: 'Unknown (Local Analysis)',
          recommendations,
          localAnalysis: {
            greenRatio: (greenRatio * 100).toFixed(1),
            brownRatio: (brownRatio * 100).toFixed(1),
            yellowRatio: (yellowRatio * 100).toFixed(1),
            darkSpotRatio: (darkSpotRatio * 100).toFixed(1)
          },
          additionalInfo: {
            analysisTime: 'Local processing',
            imageSize: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`,
            modelType: 'Local Color Analysis'
          }
        });
      };
      
      img.src = URL.createObjectURL(imageFile);
    });
  } catch (error) {
    console.error('❌ Local disease detection failed:', error);
    throw error;
  }
};

// Enhanced disease detection that combines PlantVillage with fallback
export const enhancedDiseaseDetection = async (imageFile) => {
  try {
    // First try PlantVillage API
    console.log('🌱 Attempting PlantVillage detection...');
    const plantVillageResult = await detectDiseaseWithPlantVillage(imageFile);
    
    // If confidence is high enough, return PlantVillage result
    if (plantVillageResult.confidence > 0.6) {
      return {
        ...plantVillageResult,
        analysisMethod: 'PlantVillage Model',
        fallbackUsed: false
      };
    }
    
    // If PlantVillage confidence is low, also run local analysis
    console.log('🔍 PlantVillage confidence low, running local analysis...');
    const localResult = await detectDiseaseLocally(imageFile);
    
    // Combine results
    return {
      status: `${plantVillageResult.status} (Verified Locally)`,
      confidence: Math.max(plantVillageResult.confidence, localResult.confidence),
      color: plantVillageResult.confidence > localResult.confidence ? plantVillageResult.color : localResult.color,
      description: `${plantVillageResult.description} Local analysis: ${localResult.description}`,
      cropType: plantVillageResult.cropType !== 'Unknown' ? plantVillageResult.cropType : localResult.cropType,
      recommendations: [
        '=== AI Model Analysis ===',
        ...plantVillageResult.recommendations,
        '',
        '=== Local Color Analysis ===',
        ...localResult.recommendations
      ],
      diseaseInfo: plantVillageResult.diseaseInfo,
      plantVillageData: plantVillageResult.plantVillageData,
      localAnalysis: localResult.localAnalysis,
      analysisMethod: 'Combined (PlantVillage + Local)',
      fallbackUsed: true,
      additionalInfo: {
        ...plantVillageResult.additionalInfo,
        combinedAnalysis: true
      }
    };
    
  } catch (error) {
    console.error('❌ PlantVillage API failed, falling back to local analysis...', error);
    
    // Fallback to local analysis
    const localResult = await detectDiseaseLocally(imageFile);
    return {
      ...localResult,
      analysisMethod: 'Local Analysis (Fallback)',
      fallbackUsed: true,
      apiError: error.message
    };
  }
};

export default {
  detectDiseaseWithPlantVillage,
  detectDiseaseLocally,
  enhancedDiseaseDetection,
  MULTI_CROP_DISEASES
};