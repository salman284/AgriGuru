// Smart Irrigation Service - IoT integration for automated irrigation management

class SmartIrrigationService {
  constructor() {
    this.baseURL = process.env.REACT_APP_IOT_API_URL || 'http://localhost:5003';
    this.mqttClient = null;
    this.deviceCache = new Map();
    this.sensorUpdateInterval = null;
  }

  // Initialize IoT connection
  async initializeIoTConnection() {
    try {
      // Mock IoT initialization
      console.log('🔌 Initializing IoT connection...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ IoT connection established');
      
      this.startSensorDataStream();
      return { success: true, message: 'IoT devices connected successfully' };
    } catch (error) {
      console.error('❌ IoT connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get real-time sensor data
  async getSensorData(deviceId = null) {
    try {
      // Mock sensor data with realistic variations
      const mockSensorData = {
        timestamp: new Date().toISOString(),
        devices: {
          'sensor-001': {
            id: 'sensor-001',
            name: 'Field Sensor A1',
            type: 'Soil Moisture Sensor',
            location: { zone: 'Zone A', coordinates: { lat: 28.6139, lng: 77.2090 } },
            status: 'online',
            battery: 87,
            lastUpdate: new Date().toISOString(),
            readings: {
              soilMoisture: this.generateRealisticReading(45, 20, 80),
              temperature: this.generateRealisticReading(28, 15, 40),
              soilPH: this.generateRealisticReading(6.8, 5.5, 8.0),
              soilConductivity: this.generateRealisticReading(1.2, 0.5, 3.0),
              lightIntensity: this.generateRealisticReading(75, 0, 100)
            }
          },
          'sensor-002': {
            id: 'sensor-002',
            name: 'Weather Station Central',
            type: 'Weather Monitor',
            location: { zone: 'Central Field', coordinates: { lat: 28.6140, lng: 77.2091 } },
            status: 'online',
            battery: 78,
            lastUpdate: new Date().toISOString(),
            readings: {
              airTemperature: this.generateRealisticReading(32, 20, 45),
              humidity: this.generateRealisticReading(62, 30, 90),
              windSpeed: this.generateRealisticReading(12, 0, 30),
              rainfall: this.generateRealisticReading(0, 0, 50),
              pressure: this.generateRealisticReading(1013, 980, 1050),
              uvIndex: this.generateRealisticReading(6, 0, 11)
            }
          },
          'valve-001': {
            id: 'valve-001',
            name: 'Main Irrigation Valve',
            type: 'Water Valve Controller',
            location: { zone: 'Pump House', coordinates: { lat: 28.6138, lng: 77.2089 } },
            status: 'online',
            battery: 92,
            lastUpdate: new Date().toISOString(),
            readings: {
              waterFlow: this.generateRealisticReading(15.5, 0, 50),
              waterPressure: this.generateRealisticReading(2.3, 1.0, 5.0),
              valvePosition: 75, // 0-100%
              waterTemperature: this.generateRealisticReading(24, 15, 35),
              totalWaterUsed: 2450 // Liters today
            }
          },
          'pump-001': {
            id: 'pump-001',
            name: 'Water Pump Controller',
            type: 'Pump Control System',
            location: { zone: 'Pump House', coordinates: { lat: 28.6138, lng: 77.2089 } },
            status: Math.random() > 0.8 ? 'offline' : 'online', // Occasionally offline for realism
            battery: 45,
            lastUpdate: new Date(Date.now() - Math.random() * 900000).toISOString(), // Random last update
            readings: {
              pumpSpeed: this.generateRealisticReading(1200, 0, 1800), // RPM
              waterLevel: this.generateRealisticReading(85, 0, 100), // Tank level %
              powerConsumption: this.generateRealisticReading(4.2, 0, 10), // kWh
              vibration: this.generateRealisticReading(0.3, 0, 1.0), // Vibration level
              efficiency: this.generateRealisticReading(94, 70, 98) // %
            }
          }
        }
      };

      if (deviceId) {
        return {
          success: true,
          data: mockSensorData.devices[deviceId] || null
        };
      }

      return { success: true, data: mockSensorData };
    } catch (error) {
      console.error('Failed to get sensor data:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate realistic sensor readings with some variation
  generateRealisticReading(baseValue, min, max) {
    const variation = (Math.random() - 0.5) * (baseValue * 0.1); // ±10% variation
    const newValue = baseValue + variation;
    return Math.max(min, Math.min(max, Math.round(newValue * 100) / 100));
  }

  // Control irrigation system
  async controlIrrigation(action, zoneId = null, duration = null) {
    try {
      console.log(`🎛️ Irrigation control: ${action}`, { zoneId, duration });
      
      // Mock control commands
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const responses = {
        start: `✅ Irrigation started${zoneId ? ` for ${zoneId}` : ''}${duration ? ` for ${duration} minutes` : ''}`,
        stop: `⏹️ Irrigation stopped${zoneId ? ` for ${zoneId}` : ''}`,
        pause: `⏸️ Irrigation paused${zoneId ? ` for ${zoneId}` : ''}`,
        resume: `▶️ Irrigation resumed${zoneId ? ` for ${zoneId}` : ''}`,
        schedule: `📅 Irrigation scheduled${zoneId ? ` for ${zoneId}` : ''}`
      };

      return {
        success: true,
        message: responses[action] || 'Command executed',
        timestamp: new Date().toISOString(),
        affectedZones: zoneId ? [zoneId] : ['Zone A', 'Zone B', 'Zone C']
      };
    } catch (error) {
      console.error('Irrigation control failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get irrigation schedule
  async getIrrigationSchedule(date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      // Mock schedule data
      const mockSchedule = {
        date: targetDate,
        schedules: [
          {
            id: 'schedule-001',
            time: '06:00',
            duration: 30, // minutes
            zone: 'Zone A',
            crop: 'Tomatoes',
            status: 'completed',
            waterAmount: 150, // liters
            completedAt: '06:30',
            soilMoistureTarget: 65,
            actualMoistureAfter: 68
          },
          {
            id: 'schedule-002',
            time: '12:00',
            duration: 20,
            zone: 'Zone B',
            crop: 'Peppers',
            status: 'active',
            waterAmount: 100,
            startedAt: '12:00',
            soilMoistureTarget: 60,
            estimatedCompletion: '12:20'
          },
          {
            id: 'schedule-003',
            time: '18:00',
            duration: 25,
            zone: 'Zone C',
            crop: 'Lettuce',
            status: 'scheduled',
            waterAmount: 120,
            soilMoistureTarget: 70,
            weatherCondition: 'Clear'
          },
          {
            id: 'schedule-004',
            time: '22:00',
            duration: 15,
            zone: 'Zone A',
            crop: 'Tomatoes',
            status: 'scheduled',
            waterAmount: 80,
            soilMoistureTarget: 65,
            weatherCondition: 'Clear'
          }
        ],
        totalWaterPlanned: 450, // liters
        totalWaterUsed: 250, // liters (completed schedules)
        efficiency: 94,
        weatherAdjustments: [
          {
            originalTime: '18:00',
            adjustedTime: '17:30',
            reason: 'Rain expected at 19:00'
          }
        ]
      };

      return { success: true, data: mockSchedule };
    } catch (error) {
      console.error('Failed to get irrigation schedule:', error);
      return { success: false, error: error.message };
    }
  }

  // Create or update irrigation schedule
  async setIrrigationSchedule(scheduleData) {
    try {
      console.log('📅 Setting irrigation schedule:', scheduleData);
      
      // Mock schedule creation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        success: true,
        message: 'Irrigation schedule updated successfully',
        scheduleId: Math.random().toString(36).substr(2, 9),
        nextIrrigation: scheduleData.nextTime || '06:00 tomorrow'
      };
    } catch (error) {
      console.error('Failed to set irrigation schedule:', error);
      return { success: false, error: error.message };
    }
  }

  // Get AI recommendations for irrigation
  async getIrrigationRecommendations(sensorData, weatherData, cropData) {
    try {
      // Mock AI-based recommendations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const recommendations = {
        immediate: [],
        shortTerm: [],
        longTerm: [],
        waterSavings: {
          potential: '15-25%',
          methods: ['Smart scheduling', 'Soil moisture optimization', 'Weather integration']
        },
        efficiency: {
          current: 94,
          target: 98,
          improvements: ['Pressure optimization', 'Leak detection', 'Zone-specific timing']
        }
      };

      // Generate recommendations based on mock sensor data
      const soilMoisture = sensorData?.soilMoisture || 45;
      const temperature = sensorData?.temperature || 28;
      const humidity = sensorData?.humidity || 62;

      if (soilMoisture < 30) {
        recommendations.immediate.push({
          priority: 'High',
          action: 'Start irrigation immediately',
          reason: `Soil moisture critically low (${soilMoisture}%)`,
          estimatedDuration: '30 minutes',
          waterAmount: '200 liters'
        });
      } else if (soilMoisture < 50) {
        recommendations.immediate.push({
          priority: 'Medium',
          action: 'Schedule irrigation within 2 hours',
          reason: `Soil moisture below optimal (${soilMoisture}%)`,
          estimatedDuration: '20 minutes',
          waterAmount: '150 liters'
        });
      }

      if (temperature > 30) {
        recommendations.immediate.push({
          priority: 'Medium',
          action: 'Increase irrigation frequency',
          reason: `High temperature (${temperature}°C) increases evaporation`,
          adjustment: '+20% water amount'
        });
      }

      if (humidity < 40) {
        recommendations.shortTerm.push({
          priority: 'Medium',
          action: 'Consider misting system',
          reason: `Low humidity (${humidity}%) stresses plants`,
          benefit: 'Reduces water loss, improves plant health'
        });
      }

      recommendations.longTerm.push(
        {
          priority: 'Low',
          action: 'Install soil moisture sensors in all zones',
          reason: 'Improve precision and reduce water waste',
          costBenefit: 'ROI in 6-8 months'
        },
        {
          priority: 'Medium',
          action: 'Upgrade to variable-rate irrigation',
          reason: 'Different crops have different water needs',
          costBenefit: 'Up to 30% water savings'
        }
      );

      return { success: true, recommendations };
    } catch (error) {
      console.error('Failed to get irrigation recommendations:', error);
      return { success: false, error: error.message };
    }
  }

  // Get system analytics and performance metrics
  async getSystemAnalytics(timeRange = '7d') {
    try {
      // Mock analytics data
      const mockAnalytics = {
        timeRange,
        generated: new Date().toISOString(),
        waterUsage: {
          total: 12450, // liters
          average: 1780, // liters per day
          peak: 2250, // liters (highest day)
          savings: {
            amount: 1850, // liters saved
            percentage: 12,
            cost: 245 // currency units saved
          }
        },
        energyConsumption: {
          total: 29.4, // kWh
          average: 4.2, // kWh per day
          peak: 6.1, // kWh (highest day)
          efficiency: 94 // %
        },
        systemPerformance: {
          uptime: 98.5, // %
          failedOperations: 2,
          maintenanceAlerts: 1,
          avgResponseTime: 1.2 // seconds
        },
        cropHealth: {
          overallScore: 87, // 0-100
          zonesOptimal: 2,
          zonesWarning: 1,
          zonesCritical: 0
        },
        trends: {
          waterEfficiency: '+5%',
          energyEfficiency: '+3%',
          cropYield: '+12%',
          costSavings: '+15%'
        },
        recommendations: [
          'Zone C shows higher water consumption - check for leaks',
          'Sensor battery in pump-001 needs replacement',
          'Consider scheduling more frequent short irrigations for Zone B'
        ]
      };

      return { success: true, data: mockAnalytics };
    } catch (error) {
      console.error('Failed to get system analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // Start real-time sensor data streaming
  startSensorDataStream() {
    if (this.sensorUpdateInterval) {
      clearInterval(this.sensorUpdateInterval);
    }

    this.sensorUpdateInterval = setInterval(async () => {
      try {
        const sensorData = await this.getSensorData();
        if (sensorData.success) {
          // Emit event for components to listen to
          window.dispatchEvent(new CustomEvent('sensorDataUpdate', {
            detail: sensorData.data
          }));
        }
      } catch (error) {
        console.error('Sensor data stream error:', error);
      }
    }, 5000); // Update every 5 seconds
  }

  // Stop sensor data streaming
  stopSensorDataStream() {
    if (this.sensorUpdateInterval) {
      clearInterval(this.sensorUpdateInterval);
      this.sensorUpdateInterval = null;
    }
  }

  // Get device status and diagnostics
  async getDeviceDiagnostics(deviceId) {
    try {
      const mockDiagnostics = {
        deviceId,
        status: 'healthy',
        lastDiagnostic: new Date().toISOString(),
        issues: [],
        performance: {
          responseTime: 120, // ms
          signalStrength: -45, // dBm
          dataAccuracy: 98.5, // %
          uptimePercent: 99.2
        },
        maintenanceSchedule: {
          nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastMaintenance: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          maintenanceType: 'Routine inspection and calibration'
        },
        recommendations: [
          'Device operating within normal parameters',
          'Consider cleaning sensor housing monthly',
          'Battery replacement recommended in 3 months'
        ]
      };

      // Add some random issues for realism
      if (Math.random() > 0.8) {
        mockDiagnostics.issues.push({
          severity: 'low',
          type: 'calibration_drift',
          message: 'Minor sensor calibration drift detected',
          recommendation: 'Schedule calibration within 2 weeks'
        });
      }

      return { success: true, data: mockDiagnostics };
    } catch (error) {
      console.error('Failed to get device diagnostics:', error);
      return { success: false, error: error.message };
    }
  }

  // Send remote commands to IoT devices
  async sendDeviceCommand(deviceId, command, parameters = {}) {
    try {
      console.log(`📡 Sending command to ${deviceId}:`, command, parameters);
      
      // Mock command execution
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const commandResponses = {
        'calibrate': '🔧 Device calibration initiated',
        'reset': '🔄 Device reset completed',
        'update_firmware': '⬆️ Firmware update started',
        'change_frequency': '📊 Data frequency updated',
        'test_connection': '🔗 Connection test successful',
        'emergency_stop': '🛑 Emergency stop activated'
      };

      return {
        success: true,
        message: commandResponses[command] || 'Command executed successfully',
        commandId: Math.random().toString(36).substr(2, 9),
        executedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to send device command:', error);
      return { success: false, error: error.message };
    }
  }

  // Cleanup resources
  destroy() {
    this.stopSensorDataStream();
    if (this.mqttClient) {
      this.mqttClient.end();
    }
    this.deviceCache.clear();
  }
}

export default new SmartIrrigationService();