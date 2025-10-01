# PlantVillage Disease Detection Integration

## Overview
This integration adds advanced crop disease detection capabilities to KisanMitra using machine learning models trained on the PlantVillage dataset. The PlantVillage dataset contains over 54,000 images of healthy and diseased crop leaves across 14 different crop species and 26 diseases.

## Features

### 🌱 Supported Crops
- **Apple** (Apple Scab, Black Rot, Cedar Apple Rust)
- **Blueberry** (Healthy)
- **Cherry** (Powdery Mildew)
- **Corn/Maize** (Gray Leaf Spot, Common Rust, Northern Leaf Blight)
- **Grape** (Black Rot, Esca, Leaf Blight)
- **Orange** (Huanglongbing/Citrus Greening)
- **Peach** (Bacterial Spot)
- **Bell Pepper** (Bacterial Spot)
- **Potato** (Early Blight, Late Blight)
- **Raspberry** (Healthy)
- **Soybean** (Healthy)
- **Squash** (Powdery Mildew)
- **Strawberry** (Leaf Scorch)
- **Tomato** (Multiple diseases including Bacterial Spot, Early Blight, Late Blight, etc.)

### 🔍 Disease Detection Capabilities
- **39 different disease classes** supported
- **High accuracy** disease identification
- **Confidence scoring** for each prediction
- **Treatment recommendations** for detected diseases
- **Prevention strategies** for future care
- **Severity assessment** (none, mild, moderate, severe)

## Architecture

### CNN Model: EfficientNetB0
The system uses **EfficientNetB0** as the backbone architecture, which provides:
- **State-of-the-art accuracy** with fewer parameters
- **Efficient computation** suitable for real-time inference
- **Transfer learning** from ImageNet for better feature extraction
- **Compound scaling** for optimal accuracy-efficiency trade-off

### Model Architecture Details
```
EfficientNetB0 Backbone (ImageNet pre-trained)
├── GlobalAveragePooling2D
├── Dense(512, activation='relu')
├── Dropout(0.3)
├── Dense(256, activation='relu') 
├── Dropout(0.2)
└── Dense(39, activation='softmax')  # PlantVillage classes
```

### Performance Characteristics
- **Input Size:** 224×224×3
- **Parameters:** ~5.3M (efficient for deployment)
- **Expected Accuracy:** 95-99% on PlantVillage dataset
- **Inference Time:** 200-600ms on CPU, <100ms on GPU
- **Memory Usage:** ~20MB model size

### Analysis Priority
1. **PlantVillage AI Model** (Primary - highest accuracy for diseases)
2. **Backend PyTorch Analysis** (Secondary)
3. **Plant.id API** (Fallback)
4. **PlantNet API** (Final fallback)

## Setup Instructions

### Prerequisites
- Python 3.8 or later
- Node.js and npm
- 4GB+ RAM recommended for model inference

### Backend Setup

1. **Install Python Dependencies**
   ```bash
   cd backend
   pip install -r requirements_plantvillage.txt
   ```

2. **Run the Service**
   
   **Windows:**
   ```cmd
   start_plantvillage.bat
   ```
   
   **Linux/Mac:**
   ```bash
   chmod +x start_plantvillage.sh
   ./start_plantvillage.sh
   ```

3. **Verify Service**
   - Service runs on port 5001
   - Health check: http://localhost:5001/api/health
   - Model info: http://localhost:5001/api/model-info

### Frontend Setup

1. **Environment Variables**
   Add to `.env`:
   ```
   REACT_APP_PLANTVILLAGE_API_URL=http://localhost:5001
   ```

2. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start Frontend**
   ```bash
   npm start
   ```

## Usage

### Basic Disease Detection
1. Open KisanMitra application
2. Navigate to Crop Health Analysis widget
3. Upload an image of a crop leaf
4. Click "Analyze Crop"
5. View detailed disease detection results

### API Integration

**Endpoint:** `POST /api/detect-disease`

**Request:**
```json
{
  "image": "base64_encoded_image_data",
  "confidence_threshold": 0.3
}
```

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "class": "Tomato___Early_blight",
      "confidence": 0.85,
      "rank": 1
    }
  ],
  "processing_time": 250,
  "model_info": {
    "name": "PlantVillage CNN",
    "version": "1.0",
    "classes": 39
  }
}
```

## Model Training with EfficientNet

### Training Script
A complete EfficientNet training script is provided: `train_efficientnet_plantvillage.py`

### Training Process
1. **Phase 1:** Train classification head with frozen EfficientNet backbone
2. **Phase 2:** Fine-tune entire model with lower learning rate
3. **Data Augmentation:** Rotation, shifts, zoom, flip for better generalization
4. **Callbacks:** ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

### Using Your Own EfficientNet Model

1. **Download PlantVillage Dataset**
   ```bash
   kaggle datasets download -d abdallahalidev/plantvillage-dataset
   ```

2. **Train EfficientNet Model**
   ```bash
   cd backend
   python train_efficientnet_plantvillage.py
   ```

3. **Model will be saved as:** `models/plantvillage_efficientnet.h5`

### Expected Training Results
- **Training Accuracy:** 98-99%
- **Validation Accuracy:** 95-97%
- **Top-3 Accuracy:** 99%+
- **Training Time:** 2-3 hours (GPU), 8-12 hours (CPU)

### Kaggle Dataset
Download the PlantVillage dataset from Kaggle:
https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset

### EfficientNet Advantages
- **Compound Scaling:** Balances depth, width, and resolution
- **Mobile-Friendly:** Efficient inference on edge devices
- **Transfer Learning:** Leverages ImageNet pre-training
- **State-of-the-Art:** Achieves best accuracy-efficiency trade-off

## Performance Optimization

### Production Considerations
- Use **GPU acceleration** for faster inference
- Implement **model caching** for repeated predictions
- Add **image preprocessing** optimization
- Consider **quantization** for mobile deployment

### Scaling
- Deploy on **cloud services** (AWS, GCP, Azure)
- Use **container orchestration** (Docker, Kubernetes)
- Implement **load balancing** for high traffic
- Add **caching layers** (Redis, Memcached)

## Troubleshooting

### Common Issues

1. **Model Not Found**
   - Service runs in simulation mode
   - Download or train a model and place in `models/` directory

2. **Memory Issues**
   - Reduce batch size in inference
   - Use model quantization
   - Increase system RAM

3. **API Connection Errors**
   - Check if backend service is running on port 5001
   - Verify CORS settings
   - Check firewall restrictions

4. **Low Accuracy**
   - Ensure image quality is good
   - Use proper lighting when taking photos
   - Focus on diseased leaf areas
   - Consider model retraining with local data

### Debug Mode
Enable debug logging by setting:
```bash
export FLASK_ENV=development
```

## Future Enhancements

### Planned Features
- [ ] **Real-time video analysis**
- [ ] **Mobile app integration**
- [ ] **Drone imagery support**
- [ ] **Disease progression tracking**
- [ ] **Geographic disease mapping**
- [ ] **Weather correlation analysis**
- [ ] **Multi-language support**
- [ ] **Offline model deployment**

### Advanced Analytics
- [ ] **Disease severity scoring**
- [ ] **Treatment effectiveness tracking**
- [ ] **Yield impact prediction**
- [ ] **Economic loss estimation**

## Contributing

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Submit a pull request

### Areas for Contribution
- Model accuracy improvements
- Additional crop species support
- Performance optimizations
- UI/UX enhancements
- Documentation improvements

## License and Credits

### PlantVillage Dataset
- **Source:** PlantVillage Project
- **License:** Creative Commons
- **Paper:** "Using Deep Learning for Image-Based Plant Disease Detection"

### Dependencies
- TensorFlow/Keras for deep learning
- Flask for API service
- Pillow for image processing
- NumPy for numerical operations

## Support

For technical support or questions:
- Check the troubleshooting section
- Review error logs in the console
- Create an issue in the repository
- Contact the development team

---

**Happy Farming with AI! 🌾🤖**