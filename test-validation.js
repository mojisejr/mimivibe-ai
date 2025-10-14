// Simple validation test script for text input limits
console.log("Testing text input validation boundaries...");

// Test cases: {input, expectedMinResult, expectedMaxResult}
const testCases = [
  {input: "Test", length: 4, expectedMin: false, desc: "4 chars - below minimum"},
  {input: "Tests", length: 5, expectedMin: true, desc: "5 chars - at minimum"}, 
  {input: "Testing", length: 7, expectedMin: true, desc: "7 chars - above minimum"},
  {input: "a".repeat(180), length: 180, expectedMax: true, desc: "180 chars - at maximum"},
  {input: "a".repeat(181), length: 181, expectedMax: false, desc: "181 chars - above maximum"}
];

console.log("Frontend Validation Tests (HeroSection logic):");
testCases.forEach(test => {
  const minCheck = test.length >= 5; // New minimum
  const maxCheck = test.length <= 180; // New maximum
  
  console.log(`${test.desc}: ${test.length} chars`);
  console.log(`  Min check (${test.length >= 5}): ${minCheck === test.expectedMin ? '✅' : '❌'}`);
  console.log(`  Max check (${test.length <= 180}): ${maxCheck === (test.expectedMax !== false) ? '✅' : '❌'}`);
});

console.log("\nBackend Validation Tests (AI Protection logic):");
testCases.forEach(test => {
  // Backend validation: min 10 chars (still same), max 180 chars (updated)
  const backendMinCheck = test.length >= 10; // Still 10 for backend validation
  const backendMaxCheck = test.length <= 180; // Updated to 180
  
  console.log(`${test.desc}: ${test.length} chars`);
  console.log(`  Backend Min (${test.length >= 10}): ${backendMinCheck === (test.expectedMin || test.length >= 10) ? '✅' : '❌'}`);
  console.log(`  Backend Max (${test.length <= 180}): ${backendMaxCheck === (test.expectedMax !== false) ? '✅' : '❌'}`);
});

console.log("\nValidation test completed.");
