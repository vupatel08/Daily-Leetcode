# LeetCode Bot 🤖

An automated bot that fetches LeetCode problems via GraphQL and generates solutions using OpenRouter AI.

## Features

- 🎯 Fetches random or specific LeetCode problems via GraphQL
- 🤖 Generates detailed solutions using OpenRouter (GPT-4o-mini)
- 💾 Saves solutions as markdown files
- 🚀 Ready for automation and GitHub integration

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables:**
   The `.env` file is already configured with your OpenRouter API key.

3. **Test the setup:**
   ```bash
   npm test
   ```

## Usage

### Solve a random problem:
```bash
npm start
```

### Solve a specific problem:
```bash
npm start two-sum
npm start add-two-numbers
npm start longest-substring-without-repeating-characters
```

## How it works

1. **Problem Fetching**: Uses LeetCode's GraphQL API to fetch problem details
2. **AI Generation**: Sends problem to OpenRouter (GPT-4o-mini) for solution generation
3. **File Output**: Saves complete problem + solution as markdown files
4. **Automation Ready**: Designed for automated runs and GitHub commits

## File Structure

- `index.js` - Main bot logic
- `test.js` - Setup verification
- `.env` - Environment variables (OpenRouter API key)
- `package.json` - Dependencies and scripts

## Output Format

Each solution is saved as `{problem-slug}_solution.md` containing:
- Problem title and difficulty
- Problem description
- Example test cases
- AI-generated solution with explanations
- Time/space complexity analysis

## Next Steps

This bot is ready for:
- Automated daily runs
- GitHub integration
- CI/CD pipeline setup
- Custom problem selection logic

## Dependencies

- `graphql-request` - GraphQL client for LeetCode API
- `openai` - OpenRouter API client
- `dotenv` - Environment variable management
