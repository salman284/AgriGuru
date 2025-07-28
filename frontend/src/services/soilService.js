import axios from 'axios';

// For soil data, we'll use multiple APIs for comprehensive information
const SOIL_API_BASE = 'https://rest.isric.org/soilgrids/v2.0/properties';
// const AGRO_API_BASE = 'https://api.agromonitoring.com/agro/1.0'; // For future use

// Get soil information by coordinates
export const getSoilData = async (lat, lon) => {
  try {
    // Fetch soil data from backend proxy
    const response = await axios.get(`http://localhost:5000/api/soil-data?lat=${lat}&lon=${lon}`);
    if (response.data && response.data.success && response.data.data) {
      const soilData = response.data.data;
      // If backend returns fallback demo data, use it as mock
      if (soilData.source && soilData.source.includes('Demo Fallback')) {
        // Use fallback structure
        return {
          ph: soilData?.properties?.phh2o?.values?.[0] || 6.8,
          nitrogen: soilData?.properties?.nitrogen?.values?.[0] || 85,
          organicCarbon: soilData?.properties?.soc?.values?.[0] || 2.3,
          sand: soilData?.properties?.sand?.values?.[0] || 45,
          clay: soilData?.properties?.clay?.values?.[0] || 25,
          silt: soilData?.properties?.silt?.values?.[0] || 30,
          location: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          depth: soilData?.properties?.phh2o?.depths?.[0] || '0-30cm',
          lastUpdated: new Date().toLocaleDateString(),
          isRealTime: false,
          data: soilData
        };
      } else {
        // If backend returns real data (structure may differ), fallback to previous logic
        return {
          ph: soilData?.properties?.phh2o?.mean || 6.8,
          nitrogen: soilData?.properties?.nitrogen?.mean || 85,
          organicCarbon: soilData?.properties?.soc?.mean || 2.3,
          sand: soilData?.properties?.sand?.mean || 45,
          clay: soilData?.properties?.clay?.mean || 25,
          silt: soilData?.properties?.silt?.mean || 30,
          location: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          depth: '0-30cm',
          lastUpdated: new Date().toLocaleDateString(),
          isRealTime: true,
          data: soilData
        };
      }
    } else {
      // If backend fails, use local mock data
      return getMockSoilData(lat, lon);
    }
  } catch (error) {
    console.error('Error fetching soil data from backend:', error);
    // Use local mock data on error
    return getMockSoilData(lat, lon);
  }
};

// Mock soil data for demonstration (in case API is down)
const getMockSoilData = (lat, lon) => {
  // Map of city coordinates to unique soil profiles
  const cityProfiles = [
    { name: 'Amaravati', ph: 7.2, nitrogen: 90, organicCarbon: 2.8, sand: 50, clay: 20, silt: 30, moisture: 60, fertility: 'Excellent' },
    { name: 'Itanagar', ph: 5.8, nitrogen: 70, organicCarbon: 3.1, sand: 40, clay: 30, silt: 30, moisture: 75, fertility: 'Good' },
    { name: 'Dispur', ph: 6.2, nitrogen: 80, organicCarbon: 2.5, sand: 55, clay: 18, silt: 27, moisture: 68, fertility: 'Good' },
    { name: 'Patna', ph: 7.0, nitrogen: 95, organicCarbon: 2.1, sand: 48, clay: 22, silt: 30, moisture: 62, fertility: 'Excellent' },
    { name: 'Raipur', ph: 6.5, nitrogen: 88, organicCarbon: 2.6, sand: 52, clay: 24, silt: 24, moisture: 65, fertility: 'Good' },
    { name: 'Gandhinagar', ph: 8.0, nitrogen: 60, organicCarbon: 1.8, sand: 60, clay: 15, silt: 25, moisture: 55, fertility: 'Fair' },
    { name: 'Chandigarh', ph: 7.5, nitrogen: 85, organicCarbon: 2.4, sand: 47, clay: 23, silt: 30, moisture: 63, fertility: 'Good' },
    { name: 'Shimla', ph: 5.5, nitrogen: 75, organicCarbon: 3.0, sand: 38, clay: 32, silt: 30, moisture: 80, fertility: 'Good' },
    { name: 'Ranchi', ph: 6.7, nitrogen: 82, organicCarbon: 2.7, sand: 49, clay: 21, silt: 30, moisture: 66, fertility: 'Good' },
    { name: 'Bengaluru', ph: 6.9, nitrogen: 90, organicCarbon: 2.9, sand: 46, clay: 24, silt: 30, moisture: 64, fertility: 'Excellent' },
    { name: 'Thiruvananthapuram', ph: 5.9, nitrogen: 78, organicCarbon: 3.2, sand: 42, clay: 28, silt: 30, moisture: 70, fertility: 'Good' },
    { name: 'Bhopal', ph: 7.1, nitrogen: 92, organicCarbon: 2.2, sand: 51, clay: 19, silt: 30, moisture: 61, fertility: 'Excellent' },
    { name: 'Mumbai', ph: 7.8, nitrogen: 65, organicCarbon: 2.0, sand: 58, clay: 17, silt: 25, moisture: 58, fertility: 'Fair' },
    { name: 'Imphal', ph: 6.0, nitrogen: 77, organicCarbon: 3.3, sand: 41, clay: 29, silt: 30, moisture: 72, fertility: 'Good' },
    { name: 'Shillong', ph: 5.7, nitrogen: 73, organicCarbon: 3.4, sand: 39, clay: 31, silt: 30, moisture: 78, fertility: 'Good' },
    { name: 'Aizawl', ph: 6.3, nitrogen: 79, organicCarbon: 2.6, sand: 44, clay: 26, silt: 30, moisture: 69, fertility: 'Good' },
    { name: 'Kohima', ph: 6.1, nitrogen: 76, organicCarbon: 3.0, sand: 43, clay: 27, silt: 30, moisture: 71, fertility: 'Good' },
    { name: 'Bhubaneswar', ph: 7.3, nitrogen: 89, organicCarbon: 2.5, sand: 53, clay: 20, silt: 27, moisture: 67, fertility: 'Excellent' },
    { name: 'Jaipur', ph: 8.2, nitrogen: 58, organicCarbon: 1.7, sand: 62, clay: 13, silt: 25, moisture: 53, fertility: 'Fair' },
    { name: 'Gangtok', ph: 5.6, nitrogen: 74, organicCarbon: 3.5, sand: 37, clay: 33, silt: 30, moisture: 82, fertility: 'Good' },
    { name: 'Chennai', ph: 7.4, nitrogen: 87, organicCarbon: 2.3, sand: 50, clay: 20, silt: 30, moisture: 60, fertility: 'Excellent' },
    { name: 'Hyderabad', ph: 7.0, nitrogen: 93, organicCarbon: 2.7, sand: 48, clay: 22, silt: 30, moisture: 62, fertility: 'Excellent' },
    { name: 'Agartala', ph: 6.4, nitrogen: 81, organicCarbon: 2.8, sand: 45, clay: 25, silt: 30, moisture: 65, fertility: 'Good' },
    { name: 'Lucknow', ph: 7.6, nitrogen: 86, organicCarbon: 2.2, sand: 54, clay: 18, silt: 28, moisture: 59, fertility: 'Good' },
    { name: 'Dehradun', ph: 6.6, nitrogen: 83, organicCarbon: 2.9, sand: 47, clay: 23, silt: 30, moisture: 63, fertility: 'Good' },
    { name: 'Kolkata', ph: 7.7, nitrogen: 84, organicCarbon: 2.1, sand: 56, clay: 16, silt: 28, moisture: 57, fertility: 'Fair' }
  ];
  // Find city by coordinates (rounded for matching)
  const city = cityProfiles.find(c => Math.abs(c.lat - lat) < 0.2 && Math.abs(c.lon - lon) < 0.2);
  const profile = city || cityProfiles[0];
  return {
    ph: profile.ph,
    nitrogen: profile.nitrogen,
    organicCarbon: profile.organicCarbon,
    sand: profile.sand,
    clay: profile.clay,
    silt: profile.silt,
    moisture: profile.moisture,
    temperature: 22,
    fertility: profile.fertility,
    location: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    depth: '0-30cm',
    lastUpdated: new Date().toLocaleDateString(),
    recommendations: [
      `Soil pH is ${profile.ph} (${profile.fertility})`,
      `Nitrogen level: ${profile.nitrogen} mg/kg`,
      `Organic carbon: ${profile.organicCarbon}%`,
      `Moisture: ${profile.moisture}%`
    ]
  };
};

// Analyze soil health based on values
export const analyzeSoilHealth = (soilData) => {
  const analysis = {
    overall: 'Good',
    phStatus: 'Optimal',
    fertilityLevel: 'Good',
    recommendations: []
  };

  // pH Analysis
  if (soilData.ph < 6.0) {
    analysis.phStatus = 'Acidic';
    analysis.recommendations.push('Consider lime application to raise pH');
  } else if (soilData.ph > 8.0) {
    analysis.phStatus = 'Alkaline';
    analysis.recommendations.push('Consider sulfur application to lower pH');
  } else {
    analysis.phStatus = 'Optimal';
    analysis.recommendations.push('pH level is suitable for most crops');
  }

  // Organic Carbon Analysis
  if (soilData.organicCarbon < 1.5) {
    analysis.fertilityLevel = 'Low';
    analysis.recommendations.push('Add compost or organic matter');
  } else if (soilData.organicCarbon > 3.0) {
    analysis.fertilityLevel = 'High';
    analysis.recommendations.push('Excellent organic matter content');
  }

  // Nitrogen Analysis
  if (soilData.nitrogen < 50) {
    analysis.recommendations.push('Consider nitrogen fertilizer application');
  }

  // Overall assessment
  const scores = [
    soilData.ph >= 6.0 && soilData.ph <= 8.0 ? 1 : 0,
    soilData.organicCarbon >= 2.0 ? 1 : 0,
    soilData.nitrogen >= 60 ? 1 : 0
  ];
  
  const totalScore = scores.reduce((a, b) => a + b, 0);
  
  if (totalScore >= 2) {
    analysis.overall = 'Excellent';
  } else if (totalScore === 1) {
    analysis.overall = 'Good';
  } else {
    analysis.overall = 'Needs Improvement';
  }

  return analysis;
};

// Get soil type based on sand, clay, silt percentages
export const getSoilType = (sand, clay, silt) => {
  if (sand > 85) return 'Sand';
  if (clay > 40) return 'Clay';
  if (silt > 80) return 'Silt';
  if (sand > 45 && clay < 20) return 'Sandy Loam';
  if (clay > 27 && clay < 40 && sand > 20) return 'Clay Loam';
  if (silt > 50 && clay < 27) return 'Silt Loam';
  return 'Loam';
};

// Get soil color for visualization
export const getSoilColor = (organicCarbon) => {
  if (organicCarbon > 3) return '#3d2914'; // Dark brown - high organic matter
  if (organicCarbon > 2) return '#8b4513'; // Brown - good organic matter
  if (organicCarbon > 1) return '#daa520'; // Light brown - moderate organic matter
  return '#d2b48c'; // Light tan - low organic matter
};


// Get soil health emoji
export const getSoilHealthEmoji = (overall) => {
  switch (overall) {
    case 'Excellent': return '🌱';
    case 'Good': return '🌿';
    case 'Needs Improvement': return '🌾';
    default: return '🌱';
  }
};

// Crop requirements mapping (basic demo)
const cropRequirements = [
  {
    name: 'Wheat',
    minPh: 6.0,
    maxPh: 7.5,
    minOrganicCarbon: 1.5,
    minNitrogen: 50,
    soilTypes: ['Loam', 'Clay Loam', 'Sandy Loam']
  },
  {
    name: 'Rice',
    minPh: 5.5,
    maxPh: 7.0,
    minOrganicCarbon: 1.2,
    minNitrogen: 40,
    soilTypes: ['Clay', 'Silty Loam', 'Loam']
  },
  {
    name: 'Maize',
    minPh: 5.5,
    maxPh: 7.5,
    minOrganicCarbon: 1.0,
    minNitrogen: 30,
    soilTypes: ['Sandy Loam', 'Loam']
  },
  {
    name: 'Sugarcane',
    minPh: 6.0,
    maxPh: 8.0,
    minOrganicCarbon: 1.5,
    minNitrogen: 60,
    soilTypes: ['Loam', 'Clay Loam']
  },
  {
    name: 'Cotton',
    minPh: 6.0,
    maxPh: 8.0,
    minOrganicCarbon: 1.0,
    minNitrogen: 30,
    soilTypes: ['Sandy Loam', 'Loam']
  },
  {
    name: 'Pulses',
    minPh: 6.0,
    maxPh: 7.5,
    minOrganicCarbon: 1.0,
    minNitrogen: 25,
    soilTypes: ['Loam', 'Sandy Loam', 'Clay Loam']
  }
];

// Recommend suitable crops based on soil data
export const recommendCropsForSoil = (soilData) => {
  const soilType = getSoilType(soilData.sand, soilData.clay, soilData.silt);
  return cropRequirements.filter(crop => {
    return (
      soilData.ph >= crop.minPh && soilData.ph <= crop.maxPh &&
      soilData.organicCarbon >= crop.minOrganicCarbon &&
      soilData.nitrogen >= crop.minNitrogen &&
      crop.soilTypes.includes(soilType)
    );
  }).map(crop => crop.name);
};