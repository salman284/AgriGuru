"""
Quick Multi-Crop Plant Disease Detection Training
===============================================

A faster training script for quick testing and deployment.
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib.pyplot as plt
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration - Optimized for speed
IMG_SIZE = 96  # Smaller for faster training
BATCH_SIZE = 64  # Larger batch for faster training
EPOCHS = 10  # Fewer epochs for quicker completion
LEARNING_RATE = 0.001

# Paths
DATASET_PATH = './PlantVillage/PlantVillage/PlantVillage'
MODEL_SAVE_PATH = './models/quick_crop_disease_model.h5'
TRAINING_INFO_PATH = './models/quick_training_info.json'

def detect_dataset_structure():
    """Detect dataset structure and classes"""
    logger.info("🔍 Detecting dataset structure...")
    
    if not os.path.exists(DATASET_PATH):
        logger.error(f"❌ Dataset not found at {DATASET_PATH}")
        return None, []
    
    # Get all class directories, excluding empty ones
    class_dirs = []
    for d in os.listdir(DATASET_PATH):
        dir_path = os.path.join(DATASET_PATH, d)
        if os.path.isdir(dir_path):
            # Check if directory has images
            image_files = [f for f in os.listdir(dir_path) 
                          if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
            if len(image_files) > 0:  # Only include directories with images
                class_dirs.append(d)
    
    if not class_dirs:
        logger.error("❌ No valid class directories found in dataset")
        return None, []
    
    # Count images per class
    class_info = {}
    total_images = 0
    
    for class_dir in class_dirs:
        class_path = os.path.join(DATASET_PATH, class_dir)
        image_files = [f for f in os.listdir(class_path) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
        
        image_count = len(image_files)
        class_info[class_dir] = image_count
        total_images += image_count
    
    # Sort classes by name for consistency
    sorted_classes = sorted(class_dirs)
    num_classes = len(sorted_classes)
    
    logger.info(f"✅ Dataset structure detected:")
    logger.info(f"   📊 Total classes: {num_classes}")
    logger.info(f"   🖼️  Total images: {total_images}")
    logger.info(f"   📁 Dataset path: {DATASET_PATH}")
    
    # Display class distribution
    logger.info("📋 Class distribution:")
    for class_name in sorted_classes[:10]:
        count = class_info[class_name]
        logger.info(f"   📂 {class_name}: {count} images")
    
    if num_classes > 10:
        logger.info(f"   ... and {num_classes - 10} more classes")
    
    return num_classes, sorted_classes

def create_quick_cnn_model(num_classes):
    """Create a simpler CNN model for faster training"""
    logger.info(f"🏗️  Creating Quick CNN model for {num_classes} classes...")
    
    model = Sequential([
        # First Convolutional Block
        Conv2D(32, (3, 3), activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 3)),
        MaxPooling2D(2, 2),
        
        # Second Convolutional Block
        Conv2D(64, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        
        # Third Convolutional Block
        Conv2D(128, (3, 3), activation='relu'),
        MaxPooling2D(2, 2),
        
        # Classification Head
        Flatten(),
        Dense(256, activation='relu'),
        Dropout(0.5),
        Dense(128, activation='relu'),
        Dropout(0.3),
        Dense(num_classes, activation='softmax')
    ])
    
    # Compile model
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    logger.info("✅ Model created and compiled successfully")
    logger.info(f"📊 Total parameters: {model.count_params():,}")
    
    return model

def setup_data_generators():
    """Setup data generators for training and validation"""
    logger.info("📊 Creating data generators...")
    
    # Training data generator with minimal augmentation
    train_datagen = ImageDataGenerator(
        rescale=1.0/255.0,
        rotation_range=10,
        width_shift_range=0.1,
        height_shift_range=0.1,
        horizontal_flip=True,
        validation_split=0.2
    )
    
    # Validation data generator (no augmentation)
    val_datagen = ImageDataGenerator(
        rescale=1.0/255.0,
        validation_split=0.2
    )
    
    # Create training generator
    train_generator = train_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        shuffle=True
    )
    
    # Create validation generator
    validation_generator = val_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )
    
    logger.info(f"✅ Training samples: {train_generator.samples}")
    logger.info(f"✅ Validation samples: {validation_generator.samples}")
    logger.info(f"✅ Detected classes: {train_generator.num_classes}")
    
    return train_generator, validation_generator

def train_model():
    """Main training function"""
    logger.info("🌾 Starting Quick Multi-Crop Disease Detection Training")
    logger.info("=" * 60)
    
    # Detect dataset structure
    num_classes, class_names = detect_dataset_structure()
    if num_classes is None:
        logger.error("❌ Cannot proceed without valid dataset")
        return None, None
    
    # Setup data generators
    train_generator, validation_generator = setup_data_generators()
    
    # Create model
    model = create_quick_cnn_model(num_classes)
    
    # Create models directory
    os.makedirs('./models', exist_ok=True)
    
    # Setup callbacks
    callbacks = [
        ModelCheckpoint(
            MODEL_SAVE_PATH,
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        EarlyStopping(
            monitor='val_accuracy',
            patience=3,
            restore_best_weights=True,
            verbose=1
        )
    ]
    
    logger.info("🚀 Starting training...")
    logger.info(f"📊 Training for {EPOCHS} epochs")
    
    # Train the model
    history = model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=validation_generator,
        callbacks=callbacks,
        verbose=1
    )
    
    # Evaluate final model
    logger.info("📊 Evaluating final model...")
    final_accuracy = max(history.history['val_accuracy'])
    final_loss = min(history.history['val_loss'])
    
    logger.info(f"✅ Training completed!")
    logger.info(f"📊 Best validation accuracy: {final_accuracy:.4f}")
    logger.info(f"📊 Best validation loss: {final_loss:.4f}")
    
    # Save training information
    training_info = {
        'model_type': 'Quick CNN',
        'num_classes': num_classes,
        'class_names': class_names,
        'final_accuracy': float(final_accuracy),
        'final_loss': float(final_loss),
        'img_size': IMG_SIZE,
        'batch_size': BATCH_SIZE,
        'epochs_trained': len(history.history['accuracy']),
        'total_parameters': model.count_params(),
        'training_date': datetime.now().isoformat()
    }
    
    with open(TRAINING_INFO_PATH, 'w') as f:
        json.dump(training_info, f, indent=2)
    
    logger.info(f"💾 Training info saved to: {TRAINING_INFO_PATH}")
    logger.info(f"💾 Model saved to: {MODEL_SAVE_PATH}")
    
    return model, history

if __name__ == "__main__":
    # Check TensorFlow version
    logger.info(f"🔧 TensorFlow version: {tf.__version__}")
    
    # Check if GPU is available
    if tf.config.list_physical_devices('GPU'):
        logger.info("🎮 Training on GPU")
    else:
        logger.info("🖥️  Training on CPU")
    
    # Start training
    try:
        model, history = train_model()
        if model is not None:
            logger.info("🎉 Training completed successfully!")
        else:
            logger.error("❌ Training failed!")
    except KeyboardInterrupt:
        logger.warning("⚠️  Training interrupted by user")
    except Exception as e:
        logger.error(f"❌ Training failed with error: {e}")