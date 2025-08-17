require('dotenv').config();

// Test if environment variables are loaded
console.log('🔧 Testing LeetCode Bot Setup...\n');

// Check if OpenRouter API key is loaded
if (process.env.OPENROUTER_API_KEY) {
    console.log('✅ OPENROUTER_API_KEY loaded successfully');
    console.log(`   Key: ${process.env.OPENROUTER_API_KEY.substring(0, 20)}...`);
} else {
    console.log('❌ OPENROUTER_API_KEY not found in .env file');
}

// Test if required packages can be imported
try {
    const { GraphQLClient, gql } = require('graphql-request');
    console.log('✅ graphql-request package imported successfully');
} catch (error) {
    console.log('❌ Failed to import graphql-request:', error.message);
}

try {
    const OpenAI = require('openai');
    console.log('✅ openai package imported successfully');
} catch (error) {
    console.log('❌ Failed to import openai:', error.message);
}

try {
    const LeetCodeBot = require('./index');
    console.log('✅ LeetCodeBot class imported successfully');
} catch (error) {
    console.log('❌ Failed to import LeetCodeBot:', error.message);
}

console.log('\n🚀 Setup complete! You can now run:');
console.log('   npm start          # Solve a random problem');
console.log('   npm start two-sum  # Solve a specific problem');
console.log('\n📚 The bot will:');
console.log('   1. Fetch LeetCode problems via GraphQL');
console.log('   2. Generate solutions using OpenRouter');
console.log('   3. Save solutions as markdown files');
