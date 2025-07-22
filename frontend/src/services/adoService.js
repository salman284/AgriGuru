import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const getADOsByLocation = async (latitude, longitude) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ados/nearby`, {
      params: {
        lat: latitude,
        lng: longitude
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby ADOs:', error);
    throw error;
  }
};

export const getAllADOs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ados`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ADOs:', error);
    throw error;
  }
};
