require('dotenv').config();
const LeetCodeBot = require('./index');
const fs = require('fs');
const path = require('path');

class LeetCodeAutomation {
    constructor() {
        this.bot = new LeetCodeBot();
        this.solutionsDir = './solutions';
        this.ensureSolutionsDirectory();
    }

    ensureSolutionsDirectory() {
        if (!fs.existsSync(this.solutionsDir)) {
            fs.mkdirSync(this.solutionsDir, { recursive: true });
        }
    }

    async runDailyChallenge() {
        console.log('🚀 Starting daily LeetCode challenge...\n');

        try {
            // Show current progress
            const currentCounts = this.bot.getSolvedProblemsCount();
            console.log('📊 Current progress:', currentCounts);

            // Solve problems ensuring difficulty balance
            await this.bot.solveProblemsWithDifficultyBalance(3);

            console.log('\n✅ Daily challenge completed successfully!');
            console.log('📁 Solutions organized in difficulty-based folders');

        } catch (error) {
            console.error('❌ Error in daily challenge:', error);
        }
    }

    async solveMultipleProblems(count = 3) {
        console.log(`🚀 Solving ${count} LeetCode problems with difficulty balance...\n`);

        try {
            await this.bot.solveProblemsWithDifficultyBalance(count);
            console.log('\n✅ Multiple problems solved successfully!');
        } catch (error) {
            console.error('❌ Error solving multiple problems:', error);
        }
    }

    organizeSolutions() {
        // Move all solution files to solutions directory
        const files = fs.readdirSync('.');
        const solutionFiles = files.filter(file =>
            file.endsWith('_solution.md') && !file.startsWith('.')
        );

        solutionFiles.forEach(file => {
            const sourcePath = path.join('.', file);
            const destPath = path.join(this.solutionsDir, file);

            if (fs.existsSync(sourcePath)) {
                fs.renameSync(sourcePath, destPath);
                console.log(`📁 Moved ${file} to solutions directory`);
            }
        });
    }

    async solveByDifficulty(difficulty = 'EASY', count = 1) {
        console.log(`🎯 Solving ${count} ${difficulty} problems...\n`);

        // For now, we'll solve random problems and filter by difficulty
        // In a more advanced version, we could modify the GraphQL query
        let solved = 0;
        let attempts = 0;
        const maxAttempts = count * 5; // Prevent infinite loops

        while (solved < count && attempts < maxAttempts) {
            attempts++;
            try {
                const problem = await this.bot.getRandomProblem();
                if (problem && problem.difficulty === difficulty) {
                    console.log(`\n--- ${difficulty} Problem ${solved + 1}/${count} ---`);
                    await this.bot.generateSolution(problem);
                    solved++;
                }
            } catch (error) {
                console.error(`❌ Error in attempt ${attempts}:`, error);
            }
        }

        if (solved < count) {
            console.log(`⚠️  Only solved ${solved}/${count} ${difficulty} problems after ${attempts} attempts`);
        }

        this.organizeSolutions();
    }

    generateReport() {
        const solutionsDir = this.solutionsDir;
        if (!fs.existsSync(solutionsDir)) {
            console.log('❌ No solutions directory found');
            return;
        }

        const counts = this.bot.getSolvedProblemsCount();
        const totalSolutions = Object.values(counts).reduce((a, b) => a + b, 0);

        console.log('\n📊 LeetCode Bot Report');
        console.log('='.repeat(40));
        console.log(`Total Solutions: ${totalSolutions}`);
        console.log(`Solutions Directory: ${solutionsDir}`);
        console.log('\n📈 Progress by Difficulty:');
        console.log(`  Easy: ${counts.easy}`);
        console.log(`  Medium: ${counts.medium}`);
        console.log(`  Hard: ${counts.hard}`);

        if (totalSolutions > 0) {
            console.log('\n📝 Recent Solutions:');

            const difficulties = ['easy', 'medium', 'hard'];
            const allFiles = [];

            for (const difficulty of difficulties) {
                const difficultyDir = path.join(solutionsDir, difficulty);
                if (fs.existsSync(difficultyDir)) {
                    const files = fs.readdirSync(difficultyDir);
                    files.forEach(file => {
                        const filepath = path.join(difficultyDir, file);
                        const stats = fs.statSync(filepath);
                        allFiles.push({
                            name: file,
                            difficulty: difficulty.toUpperCase(),
                            date: stats.mtime,
                            path: filepath
                        });
                    });
                }
            }

            // Sort by date and show recent ones
            allFiles.sort((a, b) => b.date - a.date);
            allFiles.slice(0, 5).forEach(file => {
                const date = file.date.toLocaleDateString();
                console.log(`  • ${file.difficulty}_${file.name} (${date})`);
            });
        }
    }
}

// Command line interface
async function main() {
    const automation = new LeetCodeAutomation();
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // Default: solve one random problem
        await automation.runDailyChallenge();
    } else {
        const command = args[0];

        switch (command) {
            case 'daily':
                await automation.runDailyChallenge();
                break;
            case 'multiple':
                const count = parseInt(args[1]) || 3;
                await automation.solveMultipleProblems(count);
                break;
            case 'balanced':
                const balancedCount = parseInt(args[1]) || 6;
                await automation.bot.solveProblemsWithDifficultyBalance(balancedCount);
                break;
            case 'difficulty':
                const difficulty = args[1] || 'EASY';
                const diffCount = parseInt(args[2]) || 1;
                await automation.solveByDifficulty(difficulty, diffCount);
                break;
            case 'report':
                automation.generateReport();
                break;
            default:
                console.log('Usage:');
                console.log('  node automate.js              # Daily challenge (3 problems)');
                console.log('  node automate.js daily        # Daily challenge');
                console.log('  node automate.js multiple [N] # Solve N problems with difficulty balance');
                console.log('  node automate.js balanced [N] # Solve N problems ensuring all difficulties');
                console.log('  node automate.js difficulty [EASY|MEDIUM|HARD] [N] # Solve N problems of specific difficulty');
                console.log('  node automate.js report       # Generate report');
        }
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = LeetCodeAutomation;
