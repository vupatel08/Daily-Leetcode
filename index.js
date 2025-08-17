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
        
        // Predefined lists of problems by difficulty
        this.problemsByDifficulty = {
            'Easy': [
                'two-sum', 'reverse-integer', 'palindrome-number', 'roman-to-integer',
                'longest-common-prefix', 'valid-parentheses', 'merge-two-sorted-lists',
                'remove-duplicates-from-sorted-array', 'remove-element', 'find-the-index-of-the-first-occurrence-in-a-string',
                'search-insert-position', 'length-of-last-word', 'plus-one', 'add-binary',
                'sqrt-x', 'climbing-stairs', 'remove-duplicates-from-sorted-list',
                'merge-sorted-array', 'same-tree', 'symmetric-tree', 'maximum-depth-of-binary-tree',
                'binary-tree-inorder-traversal', 'convert-sorted-array-to-binary-search-tree',
                'balanced-binary-tree', 'minimum-depth-of-binary-tree', 'path-sum',
                'pascals-triangle', 'best-time-to-buy-and-sell-stock', 'valid-palindrome',
                'single-number', 'linked-list-cycle', 'intersection-of-two-linked-lists',
                'excel-sheet-column-title', 'majority-element', 'factorial-trailing-zeroes',
                'excel-sheet-column-number', 'reverse-bits', 'number-of-1-bits',
                'happy-number', 'remove-linked-list-elements', 'count-primes',
                'isomorphic-strings', 'reverse-linked-list', 'contains-duplicate',
                'contains-duplicate-ii', 'invert-binary-tree', 'power-of-two',
                'implement-queue-using-stacks', 'palindrome-linked-list', 'lowest-common-ancestor-of-a-binary-search-tree',
                'delete-node-in-a-linked-list', 'valid-anagram', 'binary-tree-paths',
                'add-digits', 'ugly-number', 'missing-number', 'first-bad-version',
                'move-zeroes', 'word-pattern', 'nim-game', 'range-sum-query-immutable'
            ],
            'Medium': [
                'add-two-numbers', 'longest-substring-without-repeating-characters',
                'longest-palindromic-substring', 'zigzag-conversion', 'reverse-integer',
                'string-to-integer-atoi', 'container-with-most-water', '3sum',
                '3sum-closest', 'letter-combinations-of-a-phone-number', '4sum',
                'remove-nth-node-from-end-of-list', 'valid-parentheses', 'merge-k-sorted-lists',
                'swap-nodes-in-pairs', 'reverse-nodes-in-k-group', 'remove-duplicates-from-sorted-array',
                'remove-element', 'divide-two-integers', 'substring-with-concatenation-of-all-words',
                'next-permutation', 'longest-valid-parentheses', 'search-in-rotated-sorted-array',
                'find-first-and-last-position-of-element-in-sorted-array', 'search-insert-position',
                'valid-sudoku', 'sudoku-solver', 'count-and-say', 'combination-sum',
                'combination-sum-ii', 'first-missing-positive', 'trapping-rain-water',
                'multiply-strings', 'wildcard-matching', 'jump-game-ii', 'permutations',
                'permutations-ii', 'rotate-image', 'group-anagrams', 'pow-x-n',
                'n-queens', 'n-queens-ii', 'maximum-subarray', 'spiral-matrix',
                'jump-game', 'merge-intervals', 'insert-interval', 'length-of-last-word',
                'spiral-matrix-ii', 'permutation-sequence', 'rotate-list', 'unique-paths',
                'unique-paths-ii', 'minimum-path-sum', 'valid-number', 'plus-one',
                'add-binary', 'text-justification', 'sqrt-x', 'climbing-stairs'
            ],
            'Hard': [
                'median-of-two-sorted-arrays', 'regular-expression-matching',
                'merge-k-sorted-lists', 'reverse-nodes-in-k-group', 'substring-with-concatenation-of-all-words',
                'longest-valid-parentheses', 'sudoku-solver', 'first-missing-positive',
                'trapping-rain-water', 'wildcard-matching', 'jump-game-ii', 'n-queens',
                'n-queens-ii', 'text-justification', 'edit-distance', 'minimum-window-substring',
                'largest-rectangle-in-histogram', 'maximal-rectangle', 'scramble-string',
                'merge-sorted-array', 'decode-ways', 'reverse-linked-list-ii',
                'restore-ip-addresses', 'binary-tree-inorder-traversal', 'unique-binary-search-trees-ii',
                'validate-binary-search-tree', 'recover-binary-search-tree', 'same-tree',
                'symmetric-tree', 'binary-tree-level-order-traversal', 'binary-tree-zigzag-level-order-traversal',
                'maximum-depth-of-binary-tree', 'construct-binary-tree-from-preorder-and-inorder-traversal',
                'construct-binary-tree-from-inorder-and-postorder-traversal', 'binary-tree-level-order-traversal-ii',
                'convert-sorted-array-to-binary-search-tree', 'convert-sorted-list-to-binary-search-tree',
                'balanced-binary-tree', 'minimum-depth-of-binary-tree', 'path-sum',
                'path-sum-ii', 'flatten-binary-tree-to-linked-list', 'distinct-subsequences',
                'populating-next-right-pointers-in-each-node', 'populating-next-right-pointers-in-each-node-ii',
                'pascals-triangle', 'pascals-triangle-ii', 'triangle', 'best-time-to-buy-and-sell-stock',
                'best-time-to-buy-and-sell-stock-ii', 'best-time-to-buy-and-sell-stock-iii',
                'binary-tree-maximum-path-sum', 'valid-palindrome', 'word-ladder-ii',
                'word-ladder', 'longest-consecutive-sequence', 'sum-root-to-leaf-numbers'
            ]
        };
    }

      async getRandomProblem() {
    try {
      // Pick a random difficulty first
      const difficulties = ['Easy', 'Medium', 'Hard'];
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      
      console.log(`🎲 Randomly selected difficulty: ${randomDifficulty}`);
      
      // Use the predefined problem list approach
      return await this.getProblemByDifficulty(randomDifficulty);
      
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
      const problemList = this.problemsByDifficulty[targetDifficulty];
      if (!problemList || problemList.length === 0) {
        console.log(`❌ No problems available for difficulty: ${targetDifficulty}`);
        return null;
      }
      
      // Filter out already solved problems
      const unsolvedProblems = problemList.filter(slug => !this.isProblemSolved(slug));
      
      console.log(`🔍 Found ${unsolvedProblems.length} unsolved ${targetDifficulty} problems out of ${problemList.length} total`);
      
      if (unsolvedProblems.length === 0) {
        console.log(`⚠️  All ${targetDifficulty} problems have been solved!`);
        return null;
      }
      
      // Pick a random unsolved problem
      const randomIndex = Math.floor(Math.random() * unsolvedProblems.length);
      const selectedSlug = unsolvedProblems[randomIndex];
      
      console.log(`🎯 Selected problem: ${selectedSlug}`);
      
      // Fetch the full problem details
      return await this.getProblemBySlug(selectedSlug);
      
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
    
    const difficulties = ['Easy', 'Medium', 'Hard'];
    
    // Solve problems for each difficulty level
    for (const difficulty of difficulties) {
      const currentCount = solvedCounts[difficulty.toLowerCase()];
      const needed = Math.max(0, targetPerDifficulty - currentCount);
      
      if (needed > 0 && totalSolved < targetCount) {
        console.log(`\n🎯 Solving ${needed} ${difficulty} problems...`);
        
        for (let i = 0; i < needed && totalSolved < targetCount; i++) {
          console.log(`\n🔍 Fetching ${difficulty} problem...`);
          const problem = await this.getProblemByDifficulty(difficulty);
          
          if (problem && !this.isProblemSolved(problem.titleSlug)) {
            console.log(`📝 Problem: ${problem.title}`);
            console.log(`🏷️  Difficulty: ${problem.difficulty}`);
            
            const solution = await this.generateSolution(problem);
            if (solution) {
              const filepath = this.saveSolution(problem, solution);
              console.log(`💾 Solution saved to: ${filepath}`);
              totalSolved++;
              solvedCounts[difficulty.toLowerCase()]++;
            }
          } else if (problem) {
            console.log(`⚠️  Problem "${problem.title}" already solved, trying another...`);
          } else {
            console.log(`❌ Could not fetch ${difficulty} problem, trying another...`);
          }
          
          // Wait between requests
          if (i < needed - 1) {
            console.log('⏳ Waiting 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
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
        // Automatically solve problems with difficulty balance
        console.log('🤖 Starting automated LeetCode solving...');
        await bot.solveProblemsWithDifficultyBalance(3);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = LeetCodeBot;
