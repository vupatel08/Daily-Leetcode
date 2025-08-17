# Daily LeetCode Bot 🤖

An automated bot that fetches LeetCode problems via GraphQL and generates solutions using OpenRouter AI.

## Features

- 🎯 Automatically fetches Easy, Medium, and Hard LeetCode problems
- 🤖 Generates detailed solutions using OpenRouter (GPT-4o-mini)
- 📁 Organizes solutions by difficulty in structured folders
- 🚫 Prevents duplicate solutions with smart tracking
- 🚀 Fully automated - no manual naming required

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables:**
   The `.env` file contains your OpenRouter API key.

3. **Test the setup:**
   ```bash
   npm test
   ```

## Usage

### Daily automated solving (3 problems, balanced):
```bash
npm run daily
```

### Solve multiple problems with difficulty balance:
```bash
npm run auto
node daily-auto.js weekly
```

### Solve specific problem:
```bash
npm start two-sum
npm start add-two-numbers
```

## How it works

1. **Smart Problem Selection**: Uses predefined problem lists to ensure reliability
2. **Difficulty Balancing**: Automatically ensures all difficulty levels are covered
3. **AI Generation**: Sends problems to OpenRouter (GPT-4o-mini) for solution generation
4. **Organized Storage**: Saves solutions in difficulty-based folders
5. **Duplicate Prevention**: Tracks solved problems to avoid repeats

## File Structure

```
solutions/
├── easy/     # Easy difficulty solutions
├── medium/   # Medium difficulty solutions
└── hard/     # Hard difficulty solutions

- index.js        # Main bot logic
- daily-auto.js   # Automated solving script
- test.js         # Setup verification
- .env           # Environment variables
```

## Output Format

Each solution is saved as `{DIFFICULTY}_{problem-slug}.md` containing:
- Problem title and difficulty
- Problem description
- Example test cases
- AI-generated solution with explanations
- Time/space complexity analysis

## Dependencies

- `graphql-request` - GraphQL client for LeetCode API
- `openai` - OpenRouter API client
- `dotenv` - Environment variable management
