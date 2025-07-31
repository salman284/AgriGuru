// Test the leaf analysis function directly
console.log('=== Testing Leaf Analysis Function ===');

// Simulate the analyzeLeafCondition function
const analyzeLeafCondition = (fileName) => {
  const condition = {
    detected: false,
    type: 'unknown',
    color: 'unknown',
    pattern: 'unknown'
  };
  
  console.log('Analyzing filename:', fileName);
  
  if (fileName.includes('leaf') || fileName.includes('leaves')) {
    condition.detected = true;
    console.log('✅ Leaf detected in filename');
    
    // Color analysis
    if (fileName.includes('yellow') || fileName.includes('yellowing')) {
      condition.color = 'yellow';
      condition.type = 'nutrient_issue';
      console.log('🟡 Yellow color detected');
    } else if (fileName.includes('brown') || fileName.includes('dark')) {
      condition.color = 'brown';
      condition.type = 'disease_spots';
      console.log('🟤 Brown color detected');
    } else if (fileName.includes('white')) {
      condition.color = 'white';
      condition.type = 'fungal_coating';
      console.log('⚪ White color detected');
    } else if (fileName.includes('green')) {
      condition.color = 'green';
      condition.type = 'healthy';
      console.log('🟢 Green/healthy detected');
    } else if (fileName.includes('healthy')) {
      condition.color = 'green';
      condition.type = 'healthy';
      console.log('🟢 Healthy detected');
    }
    
    // Pattern analysis
    if (fileName.includes('spot') || fileName.includes('spots')) {
      condition.pattern = 'spots';
      console.log('🔵 Spots pattern detected');
    } else if (fileName.includes('curl') || fileName.includes('twisted')) {
      condition.pattern = 'deformed';
      console.log('🌀 Deformed pattern detected');
    } else if (fileName.includes('hole') || fileName.includes('holes')) {
      condition.pattern = 'holes';
      console.log('⚫ Holes pattern detected');
    }
  } else {
    console.log('❌ No leaf detected in filename');
  }
  
  return condition;
};

// Test with your filename
const testFilename = 'healthy_tomato_leaf.jpg';
console.log('\n--- Testing with filename:', testFilename, '---');
const result = analyzeLeafCondition(testFilename.toLowerCase());
console.log('Result:', JSON.stringify(result, null, 2));

console.log('\n=== Test Complete ===');
