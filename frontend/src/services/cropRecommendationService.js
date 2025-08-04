// Service to handle CSV-based crop recommendations

let cropData = null;

// Hardcoded crop data (equivalent to CSV content)
const getHardcodedCropData = () => [
  {
    crop_name: 'Wheat',
    min_ph: 6.0,
    max_ph: 7.5,
    min_organic_carbon: 1.5,
    min_nitrogen: 50,
    max_nitrogen: 120,
    soil_types: ['Loam', 'Clay Loam', 'Sandy Loam'],
    season: 'Rabi',
    water_requirement: '450-650',
    temperature_range: '15-25',
    rainfall_mm: '400-600',
    growth_duration_days: 120,
    yield_potential_tons_per_hectare: 3.5,
    region_suitability: 'Northern Plains,Central India',
    fertilizer_requirements: 'NPK 120:60:40',
    pest_diseases: 'Rust,Aphids,Termites'
  },
  {
    crop_name: 'Rice',
    min_ph: 5.5,
    max_ph: 7.0,
    min_organic_carbon: 1.2,
    min_nitrogen: 40,
    max_nitrogen: 100,
    soil_types: ['Clay', 'Silty Loam', 'Loam'],
    season: 'Kharif',
    water_requirement: '1000-1200',
    temperature_range: '20-35',
    rainfall_mm: '1000-1500',
    growth_duration_days: 130,
    yield_potential_tons_per_hectare: 5,
    region_suitability: 'Eastern India,Southern India,Coastal Areas',
    fertilizer_requirements: 'NPK 80:40:40',
    pest_diseases: 'Blast,Sheath Blight,Brown Plant Hopper'
  },
  {
    crop_name: 'Maize',
    min_ph: 5.5,
    max_ph: 7.5,
    min_organic_carbon: 1.0,
    min_nitrogen: 30,
    max_nitrogen: 80,
    soil_types: ['Sandy Loam', 'Loam'],
    season: 'Kharif',
    water_requirement: '500-800',
    temperature_range: '21-27',
    rainfall_mm: '600-1000',
    growth_duration_days: 105,
    yield_potential_tons_per_hectare: 5,
    region_suitability: 'Central India,Northern Plains',
    fertilizer_requirements: 'NPK 120:60:40',
    pest_diseases: 'Fall Army Worm,Stem Borer,Cutworm'
  },
  {
    crop_name: 'Cotton',
    min_ph: 6.0,
    max_ph: 8.0,
    min_organic_carbon: 1.0,
    min_nitrogen: 30,
    max_nitrogen: 90,
    soil_types: ['Sandy Loam', 'Loam'],
    season: 'Kharif',
    water_requirement: '700-1000',
    temperature_range: '21-32',
    rainfall_mm: '500-1000',
    growth_duration_days: 190,
    yield_potential_tons_per_hectare: 2.2,
    region_suitability: 'Gujarat,Maharashtra,Telangana',
    fertilizer_requirements: 'NPK 120:60:60',
    pest_diseases: 'Bollworm,Whitefly,Thrips'
  },
  {
    crop_name: 'Pulses',
    min_ph: 6.0,
    max_ph: 7.5,
    min_organic_carbon: 1.0,
    min_nitrogen: 25,
    max_nitrogen: 60,
    soil_types: ['Loam', 'Sandy Loam', 'Clay Loam'],
    season: 'Rabi/Kharif',
    water_requirement: '300-400',
    temperature_range: '20-30',
    rainfall_mm: '400-600',
    growth_duration_days: 105,
    yield_potential_tons_per_hectare: 1.5,
    region_suitability: 'Rajasthan,Madhya Pradesh,Maharashtra',
    fertilizer_requirements: 'NPK 20:60:40',
    pest_diseases: 'Pod Borer,Aphids,Rust'
  },
  {
    crop_name: 'Potato',
    min_ph: 5.8,
    max_ph: 6.5,
    min_organic_carbon: 2.0,
    min_nitrogen: 40,
    max_nitrogen: 100,
    soil_types: ['Sandy Loam', 'Loam'],
    season: 'Rabi',
    water_requirement: '500-700',
    temperature_range: '15-20',
    rainfall_mm: '600-1000',
    growth_duration_days: 105,
    yield_potential_tons_per_hectare: 25,
    region_suitability: 'Uttar Pradesh,West Bengal,Punjab',
    fertilizer_requirements: 'NPK 180:80:150',
    pest_diseases: 'Late Blight,Early Blight,Potato Beetle'
  },
  {
    crop_name: 'Tomato',
    min_ph: 6.0,
    max_ph: 7.0,
    min_organic_carbon: 2.5,
    min_nitrogen: 50,
    max_nitrogen: 120,
    soil_types: ['Loam', 'Sandy Loam'],
    season: 'Year-round',
    water_requirement: '400-600',
    temperature_range: '18-27',
    rainfall_mm: '600-1000',
    growth_duration_days: 135,
    yield_potential_tons_per_hectare: 32.5,
    region_suitability: 'Karnataka,Andhra Pradesh,Maharashtra',
    fertilizer_requirements: 'NPK 150:100:100',
    pest_diseases: 'Bacterial Wilt,Leaf Curl,Fruit Borer'
  },
  {
    crop_name: 'Onion',
    min_ph: 6.0,
    max_ph: 7.5,
    min_organic_carbon: 1.5,
    min_nitrogen: 30,
    max_nitrogen: 80,
    soil_types: ['Sandy Loam', 'Loam', 'Silty Loam'],
    season: 'Rabi',
    water_requirement: '350-550',
    temperature_range: '13-24',
    rainfall_mm: '650-750',
    growth_duration_days: 135,
    yield_potential_tons_per_hectare: 20,
    region_suitability: 'Maharashtra,Gujarat,Karnataka',
    fertilizer_requirements: 'NPK 100:50:50',
    pest_diseases: 'Purple Blotch,Thrips,Stem Rot'
  },
  {
    crop_name: 'Sugarcane',
    min_ph: 6.0,
    max_ph: 8.0,
    min_organic_carbon: 1.5,
    min_nitrogen: 60,
    max_nitrogen: 150,
    soil_types: ['Loam', 'Clay Loam'],
    season: 'Year-round',
    water_requirement: '1500-2000',
    temperature_range: '20-35',
    rainfall_mm: '1000-1500',
    growth_duration_days: 365,
    yield_potential_tons_per_hectare: 70,
    region_suitability: 'Maharashtra,Uttar Pradesh,Karnataka',
    fertilizer_requirements: 'NPK 340:170:170',
    pest_diseases: 'Red Rot,Smut,Early Shoot Borer'
  },
  {
    crop_name: 'Mustard',
    min_ph: 6.0,
    max_ph: 7.5,
    min_organic_carbon: 1.0,
    min_nitrogen: 30,
    max_nitrogen: 80,
    soil_types: ['Loam', 'Sandy Loam', 'Clay Loam'],
    season: 'Rabi',
    water_requirement: '240-400',
    temperature_range: '15-25',
    rainfall_mm: '400-600',
    growth_duration_days: 135,
    yield_potential_tons_per_hectare: 1.25,
    region_suitability: 'Rajasthan,Haryana,Uttar Pradesh',
    fertilizer_requirements: 'NPK 60:30:30',
    pest_diseases: 'Aphids,Sawfly,White Rust'
  },
  {
    crop_name: 'Groundnut',
    min_ph: 6.0,
    max_ph: 7.0,
    min_organic_carbon: 1.0,
    min_nitrogen: 20,
    max_nitrogen: 60,
    soil_types: ['Sandy Loam', 'Red Soil'],
    season: 'Kharif',
    water_requirement: '500-750',
    temperature_range: '20-30',
    rainfall_mm: '750-1000',
    growth_duration_days: 130,
    yield_potential_tons_per_hectare: 2,
    region_suitability: 'Gujarat,Andhra Pradesh,Tamil Nadu',
    fertilizer_requirements: 'NPK 25:50:75',
    pest_diseases: 'Leaf Spot,Rust,Thrips'
  },
  {
    crop_name: 'Millet',
    min_ph: 5.0,
    max_ph: 8.5,
    min_organic_carbon: 0.5,
    min_nitrogen: 20,
    max_nitrogen: 60,
    soil_types: ['Sandy Loam', 'Red Soil'],
    season: 'Kharif',
    water_requirement: '200-400',
    temperature_range: '20-35',
    rainfall_mm: '300-700',
    growth_duration_days: 75,
    yield_potential_tons_per_hectare: 1.2,
    region_suitability: 'Rajasthan,Karnataka,Tamil Nadu',
    fertilizer_requirements: 'NPK 40:20:20',
    pest_diseases: 'Downy Mildew,Blast,Stem Borer'
  },
  {
    crop_name: 'Barley',
    min_ph: 6.5,
    max_ph: 8.0,
    min_organic_carbon: 1.2,
    min_nitrogen: 40,
    max_nitrogen: 100,
    soil_types: ['Loam', 'Clay Loam', 'Sandy Loam'],
    season: 'Rabi',
    water_requirement: '300-500',
    temperature_range: '12-25',
    rainfall_mm: '300-500',
    growth_duration_days: 120,
    yield_potential_tons_per_hectare: 2.5,
    region_suitability: 'Rajasthan,Uttar Pradesh,Madhya Pradesh',
    fertilizer_requirements: 'NPK 60:30:30',
    pest_diseases: 'Rust,Smut,Aphids'
  },
  {
    crop_name: 'Coconut',
    min_ph: 5.5,
    max_ph: 7.5,
    min_organic_carbon: 2.0,
    min_nitrogen: 50,
    max_nitrogen: 120,
    soil_types: ['Sandy Loam', 'Coastal Soil'],
    season: 'Year-round',
    water_requirement: '1500-2500',
    temperature_range: '27-35',
    rainfall_mm: '1500-2500',
    growth_duration_days: 365,
    yield_potential_tons_per_hectare: 8,
    region_suitability: 'Kerala,Tamil Nadu,Karnataka,Andhra Pradesh',
    fertilizer_requirements: 'NPK 500:320:1200',
    pest_diseases: 'Rhinoceros Beetle,Red Palm Weevil,Bud Rot'
  }
];

// Load crop data
const loadCropData = async () => {
  if (cropData) return cropData;
  
  try {
    // Use hardcoded data as primary source
    cropData = getHardcodedCropData();
    return cropData;
  } catch (error) {
    console.error('Error loading crop data:', error);
    return getHardcodedCropData();
  }
};

// Get crop recommendations based on soil data
export const getCropRecommendationsFromCSV = async (soilData) => {
  try {
    console.log('Getting crop recommendations for soil data:', soilData);
    const crops = await loadCropData();
    const soilType = getSoilType(soilData.sand || 45, soilData.clay || 25, soilData.silt || 30);
    console.log('Soil type determined:', soilType);
    console.log('Soil conditions - pH:', soilData.ph, 'OC:', soilData.organicCarbon, 'N:', soilData.nitrogen);
    
    const suitableCrops = crops.filter(crop => {
      // Check pH range
      const phSuitable = soilData.ph >= crop.min_ph && soilData.ph <= crop.max_ph;
      
      // Check organic carbon
      const carbonSuitable = soilData.organicCarbon >= crop.min_organic_carbon;
      
      // Check nitrogen levels
      const nitrogenSuitable = soilData.nitrogen >= crop.min_nitrogen && 
                              soilData.nitrogen <= (crop.max_nitrogen || Infinity);
      
      // Check soil type compatibility
      const soilTypeSuitable = crop.soil_types.includes(soilType);
      
      const isAllSuitable = phSuitable && carbonSuitable && nitrogenSuitable && soilTypeSuitable;
      
      if (isAllSuitable) {
        console.log(`${crop.crop_name} is suitable - pH: ${phSuitable}, Carbon: ${carbonSuitable}, Nitrogen: ${nitrogenSuitable}, Soil: ${soilTypeSuitable}`);
      }
      
      return isAllSuitable;
    });
    
    console.log('Suitable crops found:', suitableCrops.length);
    
    // Sort by suitability score (you can enhance this logic)
    return suitableCrops.sort((a, b) => {
      const scoreA = calculateSuitabilityScore(a, soilData, soilType);
      const scoreB = calculateSuitabilityScore(b, soilData, soilType);
      return scoreB - scoreA;
    });
    
  } catch (error) {
    console.error('Error getting crop recommendations:', error);
    return [];
  }
};

// Calculate suitability score for ranking crops
const calculateSuitabilityScore = (crop, soilData, soilType) => {
  let score = 0;
  
  // pH score (closer to optimal range gets higher score)
  const phOptimal = (crop.min_ph + crop.max_ph) / 2;
  const phDeviation = Math.abs(soilData.ph - phOptimal);
  score += Math.max(0, 10 - phDeviation * 2);
  
  // Organic carbon bonus
  if (soilData.organicCarbon > crop.min_organic_carbon) {
    score += 5;
  }
  
  // Nitrogen level bonus
  if (soilData.nitrogen > crop.min_nitrogen) {
    score += 5;
  }
  
  // Soil type exact match bonus
  if (crop.soil_types.includes(soilType)) {
    score += 10;
  }
  
  return score;
};

// Helper function to determine soil type (reused from soilService)
const getSoilType = (sand, clay, silt) => {
  if (sand > 85) return 'Sand';
  if (clay > 40) return 'Clay';
  if (silt > 40 && clay < 12) return 'Silt';
  if (sand > 52 && clay < 20) return 'Sandy Loam';
  if (clay >= 20 && clay < 35 && silt < 28 && sand > 45) return 'Sandy Clay Loam';
  if (clay >= 20 && clay < 35 && silt >= 28 && sand <= 45) return 'Loam';
  if (silt >= 50 && clay >= 12 && clay < 27) return 'Silty Loam';
  if (silt >= 80 && clay < 12) return 'Silt Loam';
  if (clay >= 35 && sand > 45) return 'Sandy Clay';
  if (clay >= 35 && sand <= 45) return 'Clay Loam';
  if (silt >= 40 && clay >= 40) return 'Silty Clay';
  return 'Loam'; // Default
};

// Get detailed information about a specific crop
export const getCropDetails = async (cropName) => {
  try {
    const crops = await loadCropData();
    return crops.find(crop => 
      crop.crop_name.toLowerCase() === cropName.toLowerCase()
    );
  } catch (error) {
    console.error('Error getting crop details:', error);
    return null;
  }
};

// Get all available crops
export const getAllCrops = async () => {
  try {
    return await loadCropData();
  } catch (error) {
    console.error('Error getting all crops:', error);
    return getHardcodedCropData();
  }
};

const cropRecommendationService = {
  getCropRecommendationsFromCSV,
  getCropDetails,
  getAllCrops
};

export default cropRecommendationService;
