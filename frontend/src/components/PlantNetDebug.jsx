// PlantNet API Debug Component
import React, { useState } from 'react';
import { testPlantNetAPI, analyzeCropImage } from '../services/cropAnalysisService';

const PlantNetDebug = () => {
  const [testResult, setTestResult] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTestAPI = async () => {
    setLoading(true);
    try {
      const result = await testPlantNetAPI();
      setTestResult(result);
      console.log('Test Result:', result);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    }
    setLoading(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const result = await analyzeCropImage(file);
      setAnalysisResult(result);
      console.log('Analysis Result:', result);
    } catch (error) {
      setAnalysisResult({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>🔧 PlantNet API Debug Tool</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleTestAPI} disabled={loading}>
          {loading ? 'Testing...' : 'Test PlantNet API Connection'}
        </button>
        {testResult && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: testResult.success ? '#d4edda' : '#f8d7da' }}>
            <strong>Test Result:</strong>
            <pre>{JSON.stringify(testResult, null, 2)}</pre>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload}
          disabled={loading}
        />
        {analysisResult && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e2e3e5' }}>
            <strong>Analysis Result:</strong>
            <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
          </div>
        )}
      </div>

      <div style={{ fontSize: '12px', color: '#666' }}>
        <p>Check the browser console (F12) for detailed logs</p>
      </div>
    </div>
  );
};

export default PlantNetDebug;
