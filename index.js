require('dotenv').config();
const { GraphQLClient, gql } = require('graphql-request');
const OpenAI = require('openai');

// LeetCode GraphQL endpoint
const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

// OpenRouter configuration
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': 'https://github.com/yourusername/leetcode-bot',
        'X-Title': 'LeetCode Bot'
    }
});

// GraphQL query to fetch a random problem
const GET_RANDOM_PROBLEM = gql`
  query getRandomProblem($categorySlug: String!, $filters: QuestionListFilterInput!) {
    randomQuestion(categorySlug: $categorySlug, filters: $filters) {
      titleSlug
      title
      difficulty
      content
      codeSnippets {
        lang
        code
      }
      exampleTestcases
      topicTags {
        name
      }
    }
  }
`;

// GraphQL query to fetch a specific problem by title slug
const GET_PROBLEM_BY_SLUG = gql`
  query getProblemBySlug($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      titleSlug
      title
      difficulty
      content
      codeSnippets {
        lang
        code
      }
      exampleTestcases
      topicTags {
        name
      }
    }
  }
`;

// GraphQL query to fetch a list of problems
const GET_PROBLEMS_LIST = gql`
  query getProblemsList($categorySlug: String!, $filters: QuestionFilterInput!, $limit: Int!) {
    problemsetQuestionListV2(categorySlug: $categorySlug, filters: $filters, limit: $limit) {
      questions {
        titleSlug
        title
        difficulty
        topicTags {
          name
        }
      }
    }
  }
`;

class LeetCodeBot {
    constructor() {
        this.client = new GraphQLClient(LEETCODE_GRAPHQL_URL);
    }

    async getRandomProblem() {
        try {
            // First try to get a random problem directly
            try {
                const variables = {
                    categorySlug: 'all-code-essentials',
                    filters: {
                        difficulty: 'EASY',
                        status: 'NOT_STARTED'
                    }
                };
                const data = await this.client.request(GET_RANDOM_PROBLEM, variables);
                if (data.randomQuestion) {
                    return data.randomQuestion;
                }
            } catch (error) {
                console.log('Random question query failed, trying alternative approach...');
            }

            // Fallback: get a list of problems and pick one randomly
            const variables = {
                categorySlug: 'all-code-essentials',
                filters: {
                    difficulty: 'EASY',
                    status: 'NOT_STARTED'
                },
                limit: 50
            };

            const data = await this.client.request(GET_PROBLEMS_LIST, variables);
            if (data.problemsetQuestionListV2 && data.problemsetQuestionListV2.questions.length > 0) {
                const randomIndex = Math.floor(Math.random() * data.problemsetQuestionListV2.questions.length);
                const randomProblem = data.problemsetQuestionListV2.questions[randomIndex];

                // Now fetch the full problem details
                return await this.getProblemBySlug(randomProblem.titleSlug);
            }

            return null;
        } catch (error) {
            console.error('Error fetching random problem:', error);
            return null;
        }
    }

    async getProblemBySlug(titleSlug) {
        try {
            const variables = { titleSlug };
            const data = await this.client.request(GET_PROBLEM_BY_SLUG, variables);
            return data.question;
        } catch (error) {
            console.error('Error fetching problem by slug:', error);
            return null;
        }
    }

    async generateSolution(problem) {
        try {
            const prompt = `You are an expert programmer. Please solve this LeetCode problem:

Title: ${problem.title}
Difficulty: ${problem.difficulty}
Tags: ${problem.topicTags.map(tag => tag.name).join(', ')}

Problem Description:
${problem.content}

Example Test Cases:
${problem.exampleTestcases}

Please provide:
1. A clear explanation of your approach
2. The solution in Python with detailed comments
3. Time and space complexity analysis
4. Alternative approaches if applicable

Make sure your solution is correct and follows best practices.`;

            const completion = await openai.chat.completions.create({
                model: 'openai/gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert programmer specializing in algorithms and data structures. Provide clear, well-commented solutions to coding problems.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.3
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('Error generating solution:', error);
            return null;
        }
    }

    // Save solution with proper folder structure
    saveSolution(problem, solution) {
        const fs = require('fs');
        const path = require('path');

        // Create difficulty-based folder structure
        const difficulty = problem.difficulty.toLowerCase();
        const difficultyDir = path.join('./solutions', difficulty);

        if (!fs.existsSync(difficultyDir)) {
            fs.mkdirSync(difficultyDir, { recursive: true });
        }

        // Create filename with difficulty prefix
        const filename = `${difficulty.toUpperCase()}_${problem.titleSlug}.md`;
        const filepath = path.join(difficultyDir, filename);

        const content = `# ${problem.title}

**Difficulty:** ${problem.difficulty}
**Tags:** ${problem.topicTags.map(tag => tag.name).join(', ')}

## Problem Description
${problem.content}

## Example Test Cases
${problem.exampleTestcases}

## Solution
${solution}`;

        fs.writeFileSync(filepath, content);
        return filepath;
    }

    // Check if problem is already solved
    isProblemSolved(titleSlug) {
        const fs = require('fs');
        const path = require('path');

        const difficulties = ['easy', 'medium', 'hard'];

        for (const difficulty of difficulties) {
            const difficultyDir = path.join('./solutions', difficulty);
            if (fs.existsSync(difficultyDir)) {
                const files = fs.readdirSync(difficultyDir);
                if (files.some(file => file.includes(titleSlug))) {
                    return true;
                }
            }
        }

        return false;
    }

    // Get solved problems count by difficulty
    getSolvedProblemsCount() {
        const fs = require('fs');
        const path = require('path');

        const counts = { easy: 0, medium: 0, hard: 0 };
        const difficulties = ['easy', 'medium', 'hard'];

        for (const difficulty of difficulties) {
            const difficultyDir = path.join('./solutions', difficulty);
            if (fs.existsSync(difficultyDir)) {
                const files = fs.readdirSync(difficultyDir);
                counts[difficulty] = files.filter(file => file.endsWith('.md')).length;
            }
        }

        return counts;
    }

    // Get a problem of specific difficulty
    async getProblemByDifficulty(targetDifficulty) {
        try {
            // Try to get a problem of the target difficulty
            const variables = {
                categorySlug: 'all-code-essentials',
                filters: {
                    difficulty: targetDifficulty,
                    status: 'NOT_STARTED'
                },
                limit: 50
            };

            const data = await this.client.request(GET_PROBLEMS_LIST, variables);
            if (data.problemsetQuestionListV2 && data.problemsetQuestionListV2.questions.length > 0) {
                // Filter out already solved problems
                const unsolvedProblems = data.problemsetQuestionListV2.questions.filter(
                    q => !this.isProblemSolved(q.titleSlug)
                );

                if (unsolvedProblems.length > 0) {
                    const randomIndex = Math.floor(Math.random() * unsolvedProblems.length);
                    const randomProblem = unsolvedProblems[randomIndex];

                    // Now fetch the full problem details
                    return await this.getProblemBySlug(randomProblem.titleSlug);
                }
            }

            return null;
        } catch (error) {
            console.error(`Error fetching ${targetDifficulty} problem:`, error);
            return null;
        }
    }

    // Solve problems ensuring all difficulties are covered
    async solveProblemsWithDifficultyBalance(targetCount = 6) {
        const solvedCounts = this.getSolvedProblemsCount();
        console.log('📊 Current solved problems:', solvedCounts);

        const targetPerDifficulty = Math.ceil(targetCount / 3);
        let totalSolved = 0;

        // Use a simpler approach: solve random problems and track difficulties
        const attempts = targetCount * 3; // Allow more attempts to get variety

        for (let i = 0; i < attempts && totalSolved < targetCount; i++) {
            const problem = await this.getRandomProblem();
            if (problem && !this.isProblemSolved(problem.titleSlug)) {
                const difficulty = problem.difficulty.toLowerCase();
                const currentCount = solvedCounts[difficulty];

                // Only solve if we need more of this difficulty
                if (currentCount < targetPerDifficulty) {
                    console.log(`\n📝 Problem: ${problem.title}`);
                    console.log(`🏷️  Difficulty: ${problem.difficulty}`);

                    const solution = await this.generateSolution(problem);
                    if (solution) {
                        const filepath = this.saveSolution(problem, solution);
                        console.log(`💾 Solution saved to: ${filepath}`);
                        totalSolved++;
                        solvedCounts[difficulty]++;

                        // Check if we've reached our target
                        if (totalSolved >= targetCount) break;
                    }
                }
            }

            // Wait between requests
            if (i < attempts - 1) {
                console.log('⏳ Waiting 2 seconds...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.log(`\n✅ Completed! Total problems solved: ${totalSolved}`);
        const finalCounts = this.getSolvedProblemsCount();
        console.log('📊 Final solved problems:', finalCounts);

        return totalSolved;
    }

    async solveRandomProblem() {
        console.log('🎯 Fetching a random LeetCode problem...');

        const problem = await this.getRandomProblem();
        if (!problem) {
            console.log('❌ Failed to fetch problem');
            return;
        }

        // Check if problem is already solved
        if (this.isProblemSolved(problem.titleSlug)) {
            console.log(`⚠️  Problem "${problem.title}" is already solved, skipping...`);
            return false;
        }

        console.log(`\n📝 Problem: ${problem.title}`);
        console.log(`🏷️  Difficulty: ${problem.difficulty}`);
        console.log(`🏷️  Tags: ${problem.topicTags.map(tag => tag.name).join(', ')}`);
        console.log(`\n📖 Problem Description:`);
        console.log(problem.content.substring(0, 500) + '...');

        console.log('\n🤖 Generating solution with OpenRouter...');
        const solution = await this.generateSolution(problem);

        if (solution) {
            console.log('\n💡 Generated Solution:');
            console.log('='.repeat(50));
            console.log(solution);
            console.log('='.repeat(50));

            // Save to file with proper folder structure
            const filepath = this.saveSolution(problem, solution);
            console.log(`\n💾 Solution saved to: ${filepath}`);
            return true;
        } else {
            console.log('❌ Failed to generate solution');
            return false;
        }
    }

    async solveSpecificProblem(titleSlug) {
        console.log(`🎯 Fetching problem: ${titleSlug}`);

        const problem = await this.getProblemBySlug(titleSlug);
        if (!problem) {
            console.log('❌ Failed to fetch problem');
            return;
        }

        // Check if problem is already solved
        if (this.isProblemSolved(problem.titleSlug)) {
            console.log(`⚠️  Problem "${problem.title}" is already solved, skipping...`);
            return false;
        }

        console.log(`\n📝 Problem: ${problem.title}`);
        console.log(`🏷️  Difficulty: ${problem.difficulty}`);

        console.log('\n🤖 Generating solution with OpenRouter...');
        const solution = await this.generateSolution(problem);

        if (solution) {
            console.log('\n💡 Generated Solution:');
            console.log('='.repeat(50));
            console.log(solution);
            console.log('='.repeat(50));

            // Save to file with proper folder structure
            const filepath = this.saveSolution(problem, solution);
            console.log(`\n💾 Solution saved to: ${filepath}`);
            return true;
        } else {
            console.log('❌ Failed to generate solution');
            return false;
        }
    }
}

// Main execution
async function main() {
    const bot = new LeetCodeBot();

    // Check if a specific problem slug was provided as command line argument
    const args = process.argv.slice(2);

    if (args.length > 0) {
        await bot.solveSpecificProblem(args[0]);
    } else {
        await bot.solveRandomProblem();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = LeetCodeBot;
