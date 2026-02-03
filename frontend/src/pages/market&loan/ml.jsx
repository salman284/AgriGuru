import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import './MarketAndLoanDashboard.css';
import './MarketPriceDashboard.css';

const MarketPriceDashboard = () => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [availableMarkets, setAvailableMarkets] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [pricePrediction, setPricePrediction] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Indian states with major agricultural markets
  const indianStates = [
    { code: 'AP', name: 'Andhra Pradesh' },
    { code: 'AR', name: 'Arunachal Pradesh' },
    { code: 'AS', name: 'Assam' },
    { code: 'BR', name: 'Bihar' },
    { code: 'CT', name: 'Chhattisgarh' },
    { code: 'GA', name: 'Goa' },
    { code: 'GJ', name: 'Gujarat' },
    { code: 'HR', name: 'Haryana' },
    { code: 'HP', name: 'Himachal Pradesh' },
    { code: 'JH', name: 'Jharkhand' },
    { code: 'KA', name: 'Karnataka' },
    { code: 'KL', name: 'Kerala' },
    { code: 'MP', name: 'Madhya Pradesh' },
    { code: 'MH', name: 'Maharashtra' },
    { code: 'MN', name: 'Manipur' },
    { code: 'ML', name: 'Meghalaya' },
    { code: 'MZ', name: 'Mizoram' },
    { code: 'NL', name: 'Nagaland' },
    { code: 'OR', name: 'Odisha' },
    { code: 'PB', name: 'Punjab' },
    { code: 'RJ', name: 'Rajasthan' },
    { code: 'SK', name: 'Sikkim' },
    { code: 'TN', name: 'Tamil Nadu' },
    { code: 'TG', name: 'Telangana' },
    { code: 'TR', name: 'Tripura' },
    { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'UT', name: 'Uttarakhand' },
    { code: 'WB', name: 'West Bengal' },
    { code: 'DL', name: 'Delhi' }
  ];

  // Major crops traded in Indian markets
  const indianCrops = [
    { code: 'rice', name: 'Rice (धान)', category: 'Cereals' },
    { code: 'wheat', name: 'Wheat (गेहूं)', category: 'Cereals' },
    { code: 'maize', name: 'Maize (मक्का)', category: 'Cereals' },
    { code: 'jowar', name: 'Jowar (ज्वार)', category: 'Cereals' },
    { code: 'bajra', name: 'Bajra (बाजरा)', category: 'Cereals' },
    { code: 'ragi', name: 'Ragi (रागी)', category: 'Cereals' },
    { code: 'arhar', name: 'Arhar/Tur (अरहर)', category: 'Pulses' },
    { code: 'moong', name: 'Moong (मूंग)', category: 'Pulses' },
    { code: 'urad', name: 'Urad (उड़द)', category: 'Pulses' },
    { code: 'masur', name: 'Masur (मसूर)', category: 'Pulses' },
    { code: 'gram', name: 'Gram (चना)', category: 'Pulses' },
    { code: 'groundnut', name: 'Groundnut (मूंगफली)', category: 'Oilseeds' },
    { code: 'mustard', name: 'Mustard (सरसों)', category: 'Oilseeds' },
    { code: 'sunflower', name: 'Sunflower (सूरजमुखी)', category: 'Oilseeds' },
    { code: 'soybean', name: 'Soybean (सोयाबीन)', category: 'Oilseeds' },
    { code: 'cotton', name: 'Cotton (कपास)', category: 'Cash Crops' },
    { code: 'sugarcane', name: 'Sugarcane (गन्ना)', category: 'Cash Crops' },
    { code: 'jute', name: 'Jute (जूट)', category: 'Cash Crops' },
    { code: 'onion', name: 'Onion (प्याज)', category: 'Vegetables' },
    { code: 'potato', name: 'Potato (आलू)', category: 'Vegetables' },
    { code: 'tomato', name: 'Tomato (टमाटर)', category: 'Vegetables' },
    { code: 'garlic', name: 'Garlic (लहसुन)', category: 'Vegetables' },
    { code: 'ginger', name: 'Ginger (अदरक)', category: 'Spices' },
    { code: 'turmeric', name: 'Turmeric (हल्दी)', category: 'Spices' },
    { code: 'coriander', name: 'Coriander (धनिया)', category: 'Spices' },
    { code: 'cardamom', name: 'Cardamom (इलायची)', category: 'Spices' },
    { code: 'black_pepper', name: 'Black Pepper (काली मिर्च)', category: 'Spices' }
  ];

  // Mock API function (replace with actual API call)
  // Fetch real-time market prices from Agmarknet API
  const fetchMarketPrices = async (state, crop, market) => {
    setLoading(true);
    try {
      const apiKey = process.env.REACT_APP_AGMARKNET_API_KEY;
      const url = `https://api.data.gov.in/resource/variety-wise-daily-market-prices-data-commodity?api-key=${apiKey}&format=json` +
        (state ? `&filters[state]=${encodeURIComponent(getStateName(state))}` : '') +
        (crop ? `&filters[commodity]=${encodeURIComponent(getCropName(crop))}` : '') +
        (market ? `&filters[market]=${encodeURIComponent(market)}` : '');

      const response = await fetch(url);
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      console.log('Agmarknet API response:', data); // Debug log
      let records = (data.records || []).map((rec, i) => ({
        id: i + 1,
        market: rec.market || market,
        location: rec.district || rec.state || getStateName(state),
        minPrice: Number(rec.min_price) || 0,
        maxPrice: Number(rec.max_price) || 0,
        modalPrice: Number(rec.modal_price) || 0,
        priceChange: 0, // Not available in API
        priceChangePercent: 0,
        volume: Number(rec.arrival_quantity) || 0,
        unit: rec.arrival_unit || getCropUnit(crop),
        lastUpdated: rec.trans_date ? new Date(rec.trans_date) : new Date(),
        trend: 'stable'
      }));

      // If no API records, use mock data as fallback
      if (!records.length) {
        records = generateMockMarketData(state, crop);
      }

      // Generate price history and prediction from first record
      const modalPrice = records[0]?.modalPrice || 3000;
      const historyData = generatePriceHistory(modalPrice);
      const predictionData = generatePricePrediction(historyData);

      setMarketData(records);
      setPriceHistory(historyData);
      setPricePrediction(predictionData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching market data:', error);
      setMarketData([]);
      setPriceHistory([]);
      setPricePrediction([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock market data (replace with actual API integration)
  const generateMockMarketData = (state, crop) => {
    const markets = [
      'APMC Market', 'Mandi', 'Wholesale Market', 'Krishi Upaj Mandi', 'Agricultural Market'
    ];
    
    const data = [];
    const basePrice = Math.floor(Math.random() * 5000) + 1000; // Base price between 1000-6000
    
    for (let i = 0; i < 8; i++) {
      const variation = (Math.random() - 0.5) * 1000; // ±500 variation
      const currentPrice = Math.max(500, basePrice + variation);
      const previousPrice = currentPrice + (Math.random() - 0.5) * 200;
      const change = currentPrice - previousPrice;
      const changePercent = (change / previousPrice) * 100;
      
      data.push({
        id: i + 1,
        market: `${markets[i % markets.length]} ${i + 1}`,
        location: `${getStateName(state)} District ${i + 1}`,
        minPrice: Math.floor(currentPrice * 0.9),
        maxPrice: Math.floor(currentPrice * 1.1),
        modalPrice: Math.floor(currentPrice),
        priceChange: change,
        priceChangePercent: changePercent,
        volume: Math.floor(Math.random() * 1000) + 100,
        unit: getCropUnit(crop),
        lastUpdated: new Date(Date.now() - Math.random() * 3600000), // Random time within last hour
        trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'stable'
      });
    }
    
    return data.sort((a, b) => b.volume - a.volume); // Sort by volume descending
  };

  // Generate price history data for the last 30 days
  const generatePriceHistory = (basePrice) => {
    const history = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic price variations
      const variation = (Math.random() - 0.5) * 300; // ±150 variation
      const dayPrice = Math.max(basePrice * 0.7, basePrice + variation);
      
      history.push({
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: Math.floor(dayPrice),
        volume: Math.floor(Math.random() * 500) + 200
      });
    }
    
    return history;
  };

  // Generate price prediction for next 7 days using simple trend analysis
  const generatePricePrediction = (historyData) => {
    if (historyData.length === 0) return [];
    
    const predictions = [];
    const recentPrices = historyData.slice(-7).map(d => d.price);
    const avgPrice = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
    
    // Calculate trend
    const trend = (recentPrices[recentPrices.length - 1] - recentPrices[0]) / 6;
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Apply trend with some randomness
      const predictedPrice = avgPrice + (trend * i) + (Math.random() - 0.5) * 100;
      const confidence = Math.max(60, 95 - (i * 5)); // Decreasing confidence over time
      
      predictions.push({
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        predictedPrice: Math.floor(Math.max(avgPrice * 0.8, predictedPrice)),
        confidence: confidence,
        type: 'prediction'
      });
    }
    
    return predictions;
  };

  const getStateName = (stateCode) => {
    const state = indianStates.find(s => s.code === stateCode);
    return state ? state.name : 'Unknown State';
  };

  const getCropName = (cropCode) => {
    const crop = indianCrops.find(c => c.code === cropCode);
    return crop ? crop.name : 'Unknown Crop';
  };

  const getCropUnit = (cropCode) => {
    const grainCrops = ['rice', 'wheat', 'maize', 'jowar', 'bajra', 'ragi'];
    const pulses = ['arhar', 'moong', 'urad', 'masur', 'gram'];
    const vegetables = ['onion', 'potato', 'tomato', 'garlic'];
    
    if (grainCrops.includes(cropCode) || pulses.includes(cropCode)) {
      return 'quintal';
    } else if (vegetables.includes(cropCode)) {
      return 'kg';
    } else if (cropCode === 'sugarcane') {
      return 'tonne';
    } else {
      return 'quintal';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatChange = (change, percent) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${formatPrice(change)} (${sign}${percent.toFixed(2)}%)`;
  };

  const handleSearch = () => {};

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (selectedState && selectedCrop && selectedMarket) {
      const interval = setInterval(() => {
        fetchMarketPrices(selectedState, selectedCrop, selectedMarket);
      }, 300000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [selectedState, selectedCrop, selectedMarket]);

  // Fetch initial data when all dropdowns are selected
  useEffect(() => {
    if (selectedState && selectedCrop && selectedMarket) {
      fetchMarketPrices(selectedState, selectedCrop, selectedMarket);
    }
  }, [selectedState, selectedCrop, selectedMarket]);

  // Fetch available markets for selected state and crop (mocked for now)
  useEffect(() => {
    if (selectedState && selectedCrop) {
      // You can replace this with an API call to get available markets for the state/crop
      // For now, use a static list
      const mockMarkets = [
        'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Lucknow'
      ];
      setAvailableMarkets(mockMarkets);
      setSelectedMarket(mockMarkets[0]);
    } else {
      setAvailableMarkets([]);
      setSelectedMarket('');
    }
  }, [selectedState, selectedCrop]);

  const groupedCrops = indianCrops.reduce((groups, crop) => {
    const category = crop.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(crop);
    return groups;
  }, {});

  return (
    <div className="market-dashboard">
      <div className="dashboard-header">
        <h1>📈 Market Price Dashboard</h1>
        <p>Check real-time crop prices, trends, and predictions</p>
      </div>
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="state-select">State:</label>
          <select id="state-select" className="filter-select" value={selectedState} onChange={e => setSelectedState(e.target.value)}>
            <option value="">Select State</option>
            {indianStates.map(state => (
              <option key={state.code} value={state.code}>{state.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="crop-select">Crop:</label>
          <select id="crop-select" className="filter-select" value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}>
            <option value="">Select Crop</option>
            {Object.entries(groupedCrops).map(([category, crops]) => (
              <optgroup key={category} label={category}>
                {crops.map(crop => (
                  <option key={crop.code} value={crop.code}>{crop.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="market-select">Market:</label>
          <select id="market-select" className="filter-select" value={selectedMarket} onChange={e => setSelectedMarket(e.target.value)} disabled={!selectedState || !selectedCrop}>
            <option value="">Select Market</option>
            {availableMarkets.map(market => (
              <option key={market} value={market}>{market}</option>
            ))}
          </select>
        </div>
        <button className="refresh-btn" onClick={() => fetchMarketPrices(selectedState, selectedCrop, selectedMarket)} disabled={loading || !selectedState || !selectedCrop || !selectedMarket}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      <div className="charts-section">
        <div className="chart-container">
          <div className="chart-header">
            <h3>Price History (Last 30 Days)</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={priceHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="#8884d8" name="Price" />
                <Line type="monotone" dataKey="volume" stroke="#82ca9d" name="Volume" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-container">
          <div className="chart-header">
            <h3>Price Prediction (Next 7 Days)</h3>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pricePrediction} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="predictedPrice" fill="#ffc658" name="Predicted Price" />
              </BarChart>
            </ResponsiveContainer>
            <div className="prediction-confidence">
              {pricePrediction.map((pred, idx) => (
                <span key={idx} className="confidence-badge">{pred.date}: {pred.confidence}%</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="market-table-section">
        <h3>Market Prices</h3>
        {marketData.length === 0 ? (
          <div style={{textAlign: 'center', color: '#888', margin: '30px 0'}}>
            No market price data found for the selected filters.<br />
            Try changing the state, crop, or market and click Refresh.
          </div>
        ) : (
          <div className="market-grid">
            {marketData.map(record => (
              <div key={record.id} className={`market-card ${record.trend}`}>
                <div className="market-header">
                  <h3>{record.market}</h3>
                  <div className="location">{record.location}</div>
                </div>
                <div className="price-info">
                  <div className="main-price">
                    <span className="price-label">Modal Price</span>
                    <span className="price-value">{formatPrice(record.modalPrice)}</span>
                    <span className="price-unit">per {record.unit}</span>
                  </div>
                  <div className="price-range">
                    <div className="price-item">
                      <span className="label">Min</span>
                      <span className="value">{formatPrice(record.minPrice)}</span>
                    </div>
                    <div className="price-item">
                      <span className="label">Max</span>
                      <span className="value">{formatPrice(record.maxPrice)}</span>
                    </div>
                  </div>
                </div>
                <div className="market-stats">
                  <div className="stat">
                    <span className="label">Volume</span>
                    <span className="value">{record.volume} {record.unit}</span>
                  </div>
                  <div className={`price-change ${record.trend}`}>
                    <span className="change-icon">
                      {record.trend === 'up' ? '▲' : record.trend === 'down' ? '▼' : '▬'}
                    </span>
                    {formatChange(record.priceChange, record.priceChangePercent)}
                  </div>
                </div>
                <div className="market-footer">
                  <span className="updated-time">Last updated: {record.lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {lastUpdated && (
        <div className="last-updated">Last updated: {lastUpdated.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</div>
      )}
    </div>
  );
};

// Market Dashboard only (Loan schemes moved to Government Schemes page)
const MarketAndLoanDashboard = () => (
  <div className="market-and-loan-dashboard">
    <MarketPriceDashboard />
  </div>
);

export default MarketAndLoanDashboard;
