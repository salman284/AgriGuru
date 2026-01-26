// PestDetection Service - API integration for AI-powered pest identification

class PestDetectionService {
  constructor() {
    this.baseURL = process.env.REACT_APP_PEST_API_URL || 'http://localhost:5002';
    this.apiKey = process.env.REACT_APP_PEST_API_KEY || 'demo-key';
  }

  // Mock pest database for demonstration
  static pestDatabase = {
    'aphids': {
      name: 'Aphids',
      scientificName: 'Aphidoidea',
      severity: 'High',
      confidence: 92,
      description: 'Small, soft-bodied insects that feed on plant sap, causing yellowing and stunted growth',
      symptoms: [
        'Yellowing or curling leaves',
        'Sticky honeydew residue',
        'Presence of small green/black insects',
        'Stunted plant growth',
        'Sooty mold on leaves'
      ],
      treatment: [
        'Apply neem oil spray (2-3% solution)',
        'Introduce natural predators (ladybugs, lacewings)',
        'Use insecticidal soap spray',
        'Remove heavily infested leaves',
        'Apply diatomaceous earth around plants'
      ],
      prevention: [
        'Regular plant inspection (weekly)',
        'Maintain proper plant spacing for air circulation',
        'Avoid over-fertilizing with nitrogen',
        'Plant companion crops (marigolds, catnip)',
        'Use reflective mulch to deter aphids'
      ],
      urgency: 'immediate',
      affectedCrops: ['tomatoes', 'peppers', 'roses', 'lettuce', 'beans'],
      seasonality: 'Spring and early summer',
      economicImpact: 'High - can cause 20-30% yield loss if untreated'
    },
    'leafMiner': {
      name: 'Leaf Miner',
      scientificName: 'Liriomyza spp.',
      severity: 'Medium',
      confidence: 85,
      description: 'Larvae that create characteristic serpentine tunnels within leaf tissue',
      symptoms: [
        'Serpentine trails or tunnels in leaves',
        'White or brown winding paths',
        'Small black specks (frass) in tunnels',
        'Leaf tissue damage and browning',
        'Reduced photosynthesis efficiency'
      ],
      treatment: [
        'Remove and destroy affected leaves',
        'Apply sticky yellow traps near plants',
        'Use beneficial nematodes in soil',
        'Spray with spinosad-based insecticide',
        'Apply row covers during egg-laying season'
      ],
      prevention: [
        'Use row covers during peak season',
        'Regular monitoring and early detection',
        'Maintain proper garden sanitation',
        'Plant trap crops (nasturtiums)',
        'Encourage beneficial insects'
      ],
      urgency: 'moderate',
      affectedCrops: ['spinach', 'chard', 'beets', 'citrus', 'tomatoes'],
      seasonality: 'Year-round in warm climates',
      economicImpact: 'Medium - can reduce marketability of leafy crops'
    },
    'whitefly': {
      name: 'Whitefly',
      scientificName: 'Bemisia tabaci',
      severity: 'High',
      confidence: 89,
      description: 'Small white flying insects that feed on plant juices and transmit viral diseases',
      symptoms: [
        'Small white flying insects under leaves',
        'Yellowing and wilting leaves',
        'Sticky honeydew on leaves',
        'Sooty mold growth',
        'Viral disease symptoms'
      ],
      treatment: [
        'Use yellow sticky traps',
        'Apply neem oil or insecticidal soap',
        'Introduce parasitic wasps',
        'Use reflective mulch',
        'Apply systemic insecticides if severe'
      ],
      prevention: [
        'Regular inspection of leaf undersides',
        'Use reflective mulch',
        'Maintain proper plant spacing',
        'Remove weeds that harbor whiteflies',
        'Use companion planting'
      ],
      urgency: 'immediate',
      affectedCrops: ['tomatoes', 'peppers', 'eggplant', 'cucumbers', 'beans'],
      seasonality: 'Warm seasons, year-round in greenhouses',
      economicImpact: 'Very High - can transmit devastating viral diseases'
    },
    'thrips': {
      name: 'Thrips',
      scientificName: 'Thysanoptera',
      severity: 'Medium',
      confidence: 78,
      description: 'Tiny, slender insects that feed by rasping leaf surfaces',
      symptoms: [
        'Silver or bronze stippling on leaves',
        'Black specks of excrement',
        'Distorted or curled leaves',
        'Reduced plant vigor',
        'Premature leaf drop'
      ],
      treatment: [
        'Apply blue sticky traps',
        'Use predatory mites',
        'Spray with insecticidal soap',
        'Apply neem oil treatment',
        'Use beneficial nematodes in soil'
      ],
      prevention: [
        'Regular monitoring with sticky traps',
        'Maintain proper humidity levels',
        'Remove weeds and debris',
        'Use companion plants (basil, marigolds)',
        'Encourage natural predators'
      ],
      urgency: 'moderate',
      affectedCrops: ['onions', 'garlic', 'roses', 'chrysanthemums', 'peppers'],
      seasonality: 'Spring through fall',
      economicImpact: 'Medium - affects crop quality and yield'
    },
    'spiderMites': {
      name: 'Spider Mites',
      scientificName: 'Tetranychidae',
      severity: 'High',
      confidence: 91,
      description: 'Microscopic pests that create fine webbing and cause stippled leaf damage',
      symptoms: [
        'Fine webbing on leaves and stems',
        'Stippled or speckled leaves',
        'Yellow or bronze discoloration',
        'Leaf drop and plant stress',
        'Tiny moving dots on leaf undersides'
      ],
      treatment: [
        'Increase humidity around plants',
        'Apply predatory mites',
        'Use miticide spray',
        'Spray with strong water stream',
        'Apply neem oil or insecticidal soap'
      ],
      prevention: [
        'Maintain adequate humidity (>50%)',
        'Avoid over-fertilizing with nitrogen',
        'Regular misting of plants',
        'Encourage beneficial insects',
        'Proper plant spacing for air circulation'
      ],
      urgency: 'immediate',
      affectedCrops: ['strawberries', 'beans', 'tomatoes', 'houseplants', 'fruit trees'],
      seasonality: 'Hot, dry conditions',
      economicImpact: 'High - can cause complete crop loss in severe infestations'
    },
    'healthy': {
      name: 'Healthy Plant',
      scientificName: 'N/A',
      severity: 'None',
      confidence: 96,
      description: 'No pest infestation detected - plant appears healthy',
      symptoms: [
        'Green, vibrant foliage',
        'No visible damage or discoloration',
        'Normal growth patterns',
        'No presence of pests',
        'Healthy root system'
      ],
      treatment: [
        'Continue current care routine',
        'Maintain regular watering schedule',
        'Monitor for early signs of issues',
        'Provide appropriate nutrition'
      ],
      prevention: [
        'Regular monitoring and inspection',
        'Proper watering and drainage',
        'Adequate nutrition and soil health',
        'Good air circulation',
        'Integrated pest management practices'
      ],
      urgency: 'none',
      affectedCrops: ['All crops when healthy'],
      seasonality: 'Year-round goal',
      economicImpact: 'Positive - optimal yield and quality expected'
    }
  };

  // Analyze uploaded image for pest detection
  async analyzeImage(imageFile) {
    try {
      // Simulate API processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock AI analysis - in real implementation, this would call an ML service
      const pestTypes = Object.keys(PestDetectionService.pestDatabase);
      const randomPest = pestTypes[Math.floor(Math.random() * pestTypes.length)];
      
      // Add some logic to make healthy plants more likely if we detect good image quality
      const isHealthyBias = Math.random() > 0.3; // 70% chance of finding issues for demo
      const selectedPest = isHealthyBias ? randomPest : 'healthy';
      
      const pestData = PestDetectionService.pestDatabase[selectedPest];
      
      // Add some random variation to confidence
      const confidence = Math.max(75, Math.min(98, pestData.confidence + (Math.random() - 0.5) * 10));
      
      return {
        success: true,
        pest: {
          ...pestData,
          confidence: Math.round(confidence),
          detectedAt: new Date().toISOString(),
          imageAnalyzed: true,
          recommendations: this.generateRecommendations(pestData),
          weatherConsiderations: this.getWeatherConsiderations(selectedPest)
        }
      };
    } catch (error) {
      console.error('Pest detection analysis failed:', error);
      return {
        success: false,
        error: 'Failed to analyze image. Please try again.',
        details: error.message
      };
    }
  }

  // Generate specific recommendations based on pest type and conditions
  generateRecommendations(pestData) {
    const baseRecommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };

    if (pestData.urgency === 'immediate') {
      baseRecommendations.immediate = [
        'Begin treatment within 24 hours',
        'Isolate affected plants if possible',
        'Document the extent of infestation',
        'Prepare treatment materials'
      ];
    }

    baseRecommendations.shortTerm = [
      'Monitor treatment effectiveness daily',
      'Apply follow-up treatments as needed',
      'Check neighboring plants for spread',
      'Maintain treatment log'
    ];

    baseRecommendations.longTerm = [
      'Implement prevention strategies',
      'Review and improve garden practices',
      'Plan resistant varieties for next season',
      'Build beneficial insect habitat'
    ];

    return baseRecommendations;
  }

  // Get weather-specific considerations
  getWeatherConsiderations(pestType) {
    const weatherFactors = {
      aphids: {
        optimal: 'Cool, dry weather (15-20°C)',
        avoid: 'Hot, humid conditions reduce effectiveness',
        timing: 'Best to treat early morning or evening'
      },
      leafMiner: {
        optimal: 'Any weather conditions suitable',
        avoid: 'Heavy rain washes away treatments',
        timing: 'Apply during egg-laying season'
      },
      whitefly: {
        optimal: 'Warm, still days for treatment',
        avoid: 'Windy conditions disperse adults',
        timing: 'Multiple treatments needed in warm weather'
      },
      healthy: {
        optimal: 'Maintain current conditions',
        avoid: 'Stress factors that invite pests',
        timing: 'Continue preventive monitoring'
      }
    };

    return weatherFactors[pestType] || weatherFactors.healthy;
  }

  // Get historical pest data for the area
  async getHistoricalData(location, pestType) {
    try {
      // Mock historical data
      const mockData = {
        location,
        pestType,
        historicalOccurrence: [
          { month: 'Jan', incidents: 2 },
          { month: 'Feb', incidents: 1 },
          { month: 'Mar', incidents: 4 },
          { month: 'Apr', incidents: 8 },
          { month: 'May', incidents: 12 },
          { month: 'Jun', incidents: 15 },
          { month: 'Jul', incidents: 18 },
          { month: 'Aug', incidents: 16 },
          { month: 'Sep', incidents: 10 },
          { month: 'Oct', incidents: 6 },
          { month: 'Nov', incidents: 3 },
          { month: 'Dec', incidents: 1 }
        ],
        peakSeason: 'June-August',
        riskLevel: 'Medium',
        commonTreatments: ['Neem oil', 'Beneficial insects', 'Sticky traps']
      };

      return { success: true, data: mockData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get pest alerts for the region
  async getPestAlerts(location) {
    try {
      // Mock pest alerts
      const mockAlerts = [
        {
          id: 1,
          pest: 'Aphids',
          severity: 'High',
          region: location || 'Your Area',
          message: 'Increased aphid activity reported in the region',
          date: new Date().toISOString(),
          action: 'Monitor plants daily and prepare treatments'
        },
        {
          id: 2,
          pest: 'Whitefly',
          severity: 'Medium',
          region: location || 'Your Area',
          message: 'Whitefly populations increasing with warm weather',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          action: 'Check undersides of leaves regularly'
        }
      ];

      return { success: true, alerts: mockAlerts };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Submit pest sighting to community database
  async submitSighting(sightingData) {
    try {
      // Mock submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Thank you for your contribution to the community pest database!',
        sightingId: Math.random().toString(36).substr(2, 9)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get treatment effectiveness data
  getTreatmentEffectiveness(pestType, treatment) {
    const effectiveness = {
      aphids: {
        'neem-oil': { effectiveness: 85, timeToSee: '2-3 days', duration: '7-10 days' },
        'ladybugs': { effectiveness: 90, timeToSee: '3-5 days', duration: '2-3 weeks' },
        'insecticidal-soap': { effectiveness: 75, timeToSee: '1-2 days', duration: '3-5 days' }
      },
      leafMiner: {
        'sticky-traps': { effectiveness: 70, timeToSee: '1-2 days', duration: '1-2 weeks' },
        'spinosad': { effectiveness: 85, timeToSee: '2-4 days', duration: '7-14 days' },
        'beneficial-nematodes': { effectiveness: 80, timeToSee: '5-7 days', duration: '3-4 weeks' }
      }
    };

    return effectiveness[pestType]?.[treatment] || {
      effectiveness: 'Unknown',
      timeToSee: 'Varies',
      duration: 'Varies'
    };
  }
}

export default new PestDetectionService();